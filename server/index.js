const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: [CLIENT_URL, "http://localhost:5173", "http://localhost:3000"], methods: ["GET", "POST"] },
  maxHttpBufferSize: 5e6,
});

app.use(cors({ origin: [CLIENT_URL, "http://localhost:5173"] }));
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── In-Memory State ─────────────────────────────────────────────────────────
const rooms = {
  general: { id: "general", name: "general", description: "General chat for everyone", isPrivate: false, password: null, messages: [], users: new Set(), createdBy: "system" },
  random:  { id: "random",  name: "random",  description: "Off-topic conversations",   isPrivate: false, password: null, messages: [], users: new Set(), createdBy: "system" },
  tech:    { id: "tech",    name: "tech",     description: "Tech talk and code sharing", isPrivate: false, password: null, messages: [], users: new Set(), createdBy: "system" },
};

const connectedUsers = new Map(); // socketId -> { username, avatar, room, socketId }
const dmThreads = new Map();      // dmId -> { id, participants, messages[] }
const userSockets = new Map();    // username -> socketId

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDmId(a, b) { return [a, b].sort().join(":"); }

function systemMessage(text, room) {
  return { id: uuidv4(), type: "system", content: text, room, timestamp: new Date().toISOString() };
}

function generateAvatar(username) {
  const colors = ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#F1948A"];
  const hash = username.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return { color: colors[hash % colors.length], initials: username.slice(0, 2).toUpperCase() };
}

function getRoomList() {
  return Object.values(rooms).map(r => ({
    id: r.id, name: r.name, description: r.description,
    isPrivate: r.isPrivate, userCount: r.users.size, createdBy: r.createdBy,
  }));
}

function broadcastRoomUsers(roomId) {
  const users = [];
  rooms[roomId]?.users.forEach(sid => {
    const u = connectedUsers.get(sid);
    if (u) users.push({ username: u.username, avatar: u.avatar });
  });
  io.to(roomId).emit("room_users", users);
}

function leaveRoom(socket, user, roomId) {
  socket.leave(roomId);
  rooms[roomId]?.users.delete(socket.id);
  const msg = systemMessage(`${user.username} left the room`, roomId);
  rooms[roomId]?.messages.push(msg);
  io.to(roomId).emit("message", msg);
  broadcastRoomUsers(roomId);
}

function joinRoom(socket, user, roomId) {
  user.room = roomId;
  socket.join(roomId);
  rooms[roomId].users.add(socket.id);
  socket.emit("history", rooms[roomId].messages.slice(-50));
  const msg = systemMessage(`${user.username} joined the room`, roomId);
  rooms[roomId].messages.push(msg);
  io.to(roomId).emit("message", msg);
  broadcastRoomUsers(roomId);
}

function getOnlineUsers() {
  const seen = new Set();
  const users = [];
  connectedUsers.forEach(u => {
    if (!seen.has(u.username)) {
      seen.add(u.username);
      users.push({ username: u.username, avatar: u.avatar });
    }
  });
  return users;
}

// ─── REST ─────────────────────────────────────────────────────────────────────
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size });
});
app.get("/rooms", (req, res) => res.json(getRoomList()));
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ─── Sockets ──────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {

  socket.on("join", ({ username, room = "general" }) => {
    if (!rooms[room]) room = "general";
    const avatar = generateAvatar(username);
    const user = { username, avatar, room, socketId: socket.id };
    connectedUsers.set(socket.id, user);
    userSockets.set(username, socket.id);
    joinRoom(socket, user, room);
    socket.emit("rooms_update", getRoomList());
    io.emit("online_users", getOnlineUsers());
  });

  socket.on("create_room", ({ name, description, isPrivate, password }, callback) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return callback?.({ error: "Not authenticated" });
    const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 24);
    if (!slug) return callback?.({ error: "Invalid room name" });
    if (rooms[slug]) return callback?.({ error: "Room name already taken" });
    rooms[slug] = {
      id: slug, name: slug, description: description || "",
      isPrivate: !!isPrivate,
      password: (isPrivate && password) ? password : null,
      messages: [], users: new Set(), createdBy: user.username,
    };
    io.emit("rooms_update", getRoomList());
    callback?.({ success: true, roomId: slug });
  });

  socket.on("switch_room", ({ room, password }, callback) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return callback?.({ error: "Not authenticated" });
    if (!rooms[room]) return callback?.({ error: "Room not found" });
    const target = rooms[room];
    if (target.isPrivate && target.password && target.password !== password) {
      return callback?.({ error: "Wrong password" });
    }
    leaveRoom(socket, user, user.room);
    joinRoom(socket, user, room);
    io.emit("rooms_update", getRoomList());
    callback?.({ success: true });
  });

  socket.on("send_message", ({ content, type = "text" }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;
    const msg = { id: uuidv4(), type, content, username: user.username, avatar: user.avatar, room: user.room, timestamp: new Date().toISOString() };
    rooms[user.room]?.messages.push(msg);
    io.to(user.room).emit("message", msg);
  });

  socket.on("send_file", ({ url, filename, mimetype, size }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;
    const msg = { id: uuidv4(), type: "file", content: { url, filename, mimetype, size }, username: user.username, avatar: user.avatar, room: user.room, timestamp: new Date().toISOString() };
    rooms[user.room]?.messages.push(msg);
    io.to(user.room).emit("message", msg);
  });

  socket.on("send_dm", ({ toUsername, content, type = "text" }, callback) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return callback?.({ error: "Not authenticated" });
    const dmId = getDmId(user.username, toUsername);
    if (!dmThreads.has(dmId)) dmThreads.set(dmId, { id: dmId, participants: [user.username, toUsername], messages: [] });
    const msg = { id: uuidv4(), type, content, from: user.username, to: toUsername, avatar: user.avatar, dmId, timestamp: new Date().toISOString() };
    dmThreads.get(dmId).messages.push(msg);
    socket.emit("dm_message", msg);
    const recipientSid = userSockets.get(toUsername);
    if (recipientSid) io.to(recipientSid).emit("dm_message", msg);
    callback?.({ success: true });
  });

  socket.on("send_dm_file", ({ toUsername, url, filename, mimetype, size }, callback) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return callback?.({ error: "Not authenticated" });
    const dmId = getDmId(user.username, toUsername);
    if (!dmThreads.has(dmId)) dmThreads.set(dmId, { id: dmId, participants: [user.username, toUsername], messages: [] });
    const msg = { id: uuidv4(), type: "file", content: { url, filename, mimetype, size }, from: user.username, to: toUsername, avatar: user.avatar, dmId, timestamp: new Date().toISOString() };
    dmThreads.get(dmId).messages.push(msg);
    socket.emit("dm_message", msg);
    const recipientSid = userSockets.get(toUsername);
    if (recipientSid) io.to(recipientSid).emit("dm_message", msg);
    callback?.({ success: true });
  });

  socket.on("get_dm_history", ({ withUsername }, callback) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return callback?.([]);
    const thread = dmThreads.get(getDmId(user.username, withUsername));
    callback?.(thread ? thread.messages.slice(-50) : []);
  });

  socket.on("dm_typing", ({ toUsername, isTyping }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;
    const sid = userSockets.get(toUsername);
    if (sid) io.to(sid).emit("dm_user_typing", { username: user.username, isTyping });
  });

  socket.on("typing", ({ isTyping }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;
    socket.to(user.room).emit("user_typing", { username: user.username, isTyping });
  });

  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      rooms[user.room]?.users.delete(socket.id);
      const msg = systemMessage(`${user.username} left the room`, user.room);
      rooms[user.room]?.messages.push(msg);
      io.to(user.room).emit("message", msg);
      broadcastRoomUsers(user.room);
      userSockets.delete(user.username);
      connectedUsers.delete(socket.id);
      io.emit("rooms_update", getRoomList());
      io.emit("online_users", getOnlineUsers());
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
