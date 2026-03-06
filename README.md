# Chattr — Real-Time Chat App

A portfolio-ready real-time chat application built with React, Socket.io, and Express. Features live messaging, multiple chat rooms, file sharing, emoji support, and typing indicators.

![Stack](https://img.shields.io/badge/React-18-blue?style=flat-square) ![Stack](https://img.shields.io/badge/Socket.io-4.7-green?style=flat-square) ![Stack](https://img.shields.io/badge/Express-4.18-lightgrey?style=flat-square)

## ✨ Features

- **Real-Time Messaging** — WebSocket-powered via Socket.io, instant delivery
- **Multiple Rooms** — `#general`, `#random`, `#tech` — switch rooms on the fly
- **File Sharing** — Upload images, PDFs, and files up to 5MB; drag-and-drop supported
- **Emoji Picker** — 30+ emoji quick-select, plus per-message emoji reactions
- **Typing Indicators** — See when others are typing in real time
- **Message History** — Last 50 messages loaded on room join
- **User Presence** — Live online user list with color-coded avatars

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite |
| Backend | Express 4, Node.js |
| Real-Time | Socket.io 4 |
| File Upload | Multer |
| Deployment | Render |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone <your-repo-url>
cd chattr

# Install all dependencies
npm run install:all
```

### Development

Run both server and client simultaneously:

```bash
npm install          # install concurrently
npm run dev          # starts server on :3001 and client on :5173
```

Or run separately:

```bash
# Terminal 1 — Backend
npm run dev:server

# Terminal 2 — Frontend  
npm run dev:client
```

Open `http://localhost:5173` in multiple browser windows to test real-time features.

## 📦 Deploy to Render

This project includes a `render.yaml` for one-command deployment.

### Steps:
1. Push to GitHub
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` and deploys both services
5. Environment variables are wired automatically

### Manual Deployment

**Backend (Web Service):**
- Root: `server/`
- Build: `npm install`
- Start: `npm start`
- Env: `PORT=3001`, `CLIENT_URL=<your-client-url>`

**Frontend (Static Site):**
- Root: `client/`
- Build: `npm install && npm run build`
- Publish: `dist/`
- Env: `VITE_SERVER_URL=<your-server-url>`

## 📁 Project Structure

```
chattr/
├── server/
│   ├── index.js          # Express + Socket.io server
│   ├── uploads/          # Uploaded files (auto-created)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx           # Main chat layout
│   │   ├── hooks/
│   │   │   └── useSocket.js  # Socket.io React hook
│   │   └── components/
│   │       ├── LoginScreen.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Message.jsx
│   │       └── ChatInput.jsx
│   ├── index.html
│   └── vite.config.js
├── render.yaml           # Render deployment blueprint
└── package.json          # Root scripts
```

## 🔌 Socket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join` | Client → Server | `{ username, room }` |
| `send_message` | Client → Server | `{ content, type }` |
| `send_file` | Client → Server | `{ url, filename, mimetype, size }` |
| `switch_room` | Client → Server | `{ room }` |
| `typing` | Client → Server | `{ isTyping }` |
| `message` | Server → Client | Message object |
| `history` | Server → Client | Message[] |
| `room_users` | Server → Client | User[] |
| `user_typing` | Server → Client | `{ username, isTyping }` |
| `rooms_update` | Server → All | Room[] |

## 📸 Key Implementation Details

- **In-memory state** — Rooms and message history are stored in-memory (resets on restart). For production persistence, swap with MongoDB or PostgreSQL.
- **File uploads** — Served as static files from `/uploads`. For production, use S3 or Cloudinary.
- **Avatars** — Deterministically generated from username (consistent color + initials).
- **CORS** — Configured to allow client origin. Update `CLIENT_URL` in production.
