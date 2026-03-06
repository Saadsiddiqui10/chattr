import { useState, useEffect, useRef } from 'react'
import { useSocket } from './hooks/useSocket'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import Message from './components/Message'
import ChatInput from './components/ChatInput'
import CreateRoomModal from './components/CreateRoomModal'
import PasswordModal from './components/PasswordModal'
import DmPanel from './components/DmPanel'

export default function App() {
  const [user, setUser] = useState(null)
  const [currentRoom, setCurrentRoom] = useState('general')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [passwordPrompt, setPasswordPrompt] = useState(null)
  const [activeDm, setActiveDm] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef()

  const {
    connected, messages, roomUsers, rooms, typingUsers,
    onlineUsers, dmThreads, dmTyping,
    join, sendMessage, sendFile, switchRoom, createRoom,
    setTyping, sendDm, sendDmFile, getDmHistory,
    setDmTypingIndicator,
  } = useSocket()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleJoin = (username, room) => {
    setUser(username)
    setCurrentRoom(room)
    join(username, room)
  }

  const handleSwitchRoom = async (room) => {
    setSidebarOpen(false)
    if (room.isPrivate) { setPasswordPrompt(room); return }
    const result = await switchRoom(room.name)
    if (result?.error) return alert(result.error)
    setCurrentRoom(room.name)
    setActiveDm(null)
  }

  const handlePasswordSubmit = async (password) => {
    const result = await switchRoom(passwordPrompt.name, password)
    if (result?.error) return result
    setCurrentRoom(passwordPrompt.name)
    setActiveDm(null)
    setPasswordPrompt(null)
    return result
  }

  const handleCreateRoom = async (roomData) => {
    const result = await createRoom(roomData)
    if (result?.success) {
      await switchRoom(result.roomId, roomData.password)
      setCurrentRoom(result.roomId)
      setActiveDm(null)
    }
    return result
  }

  const handleOpenDm = async (targetUser) => {
    setActiveDm(targetUser)
    setSidebarOpen(false)
    await getDmHistory(targetUser.username)
  }

  const handleSendDm = (content) => { if (activeDm) sendDm(activeDm.username, content) }
  const handleSendDmFile = (fileInfo) => { if (activeDm) sendDmFile(activeDm.username, fileInfo) }

  const getDmId = (a, b) => [a, b].sort().join(':')
  const activeDmMessages = activeDm ? (dmThreads[getDmId(user, activeDm.username)] || []) : []
  const activeDmTyping = activeDm ? (dmTyping[activeDm.username] || false) : false

  if (!user) return <LoginScreen onJoin={handleJoin} />

  const currentRoomInfo = rooms.find(r => r.name === currentRoom)

  return (
    <div style={styles.app}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div style={{ ...styles.sidebarWrapper, ...(sidebarOpen ? styles.sidebarWrapperOpen : {}) }}>
        <Sidebar
          rooms={rooms.length ? rooms : DEFAULT_ROOMS}
          currentRoom={currentRoom}
          onSwitchRoom={handleSwitchRoom}
          users={roomUsers}
          username={user}
          onCreateRoom={() => { setShowCreateRoom(true); setSidebarOpen(false) }}
          onlineUsers={onlineUsers}
          onOpenDm={handleOpenDm}
          activeDmUser={activeDm?.username}
        />
      </div>

      {/* Main chat area */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <span style={styles.headerHash}>{currentRoomInfo?.isPrivate ? '🔒' : '#'}</span>
            <span style={styles.headerRoom}>{currentRoom}</span>
            {currentRoomInfo?.isPrivate && <span style={styles.privateBadge}>PRIVATE</span>}
          </div>
          <div style={styles.headerRight}>
            <div style={{ ...styles.statusDot, background: connected ? '#00ff88' : '#ff3366' }} />
            <span style={styles.statusText}>{connected ? 'connected' : 'reconnecting...'}</span>
            <span style={styles.memberCount}>{roomUsers.length} online</span>
          </div>
        </div>

        <div style={styles.messages}>
          {messages.length === 0 && (
            <div style={styles.empty}>
              <div style={styles.emptyTitle}>{currentRoomInfo?.isPrivate ? '🔒' : '#'}{currentRoom}</div>
              <div style={styles.emptyText}>Start of channel. Say hi!</div>
            </div>
          )}
          {messages.map((msg, i) => (
            <Message key={msg.id} msg={msg} isOwn={msg.username === user} prevMsg={messages[i - 1]} />
          ))}
          {typingUsers.length > 0 && (
            <div style={styles.typing}>
              <div style={styles.typingDots}>
                {[0,150,300].map(d => <span key={d} style={{ ...styles.typingDot, animationDelay: `${d}ms` }} />)}
              </div>
              <span style={styles.typingText}>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={sendMessage} onSendFile={sendFile} onTyping={setTyping} disabled={!connected} />
      </div>

      {/* DM Panel — fullscreen on mobile */}
      {activeDm && (
        <DmPanel
          myUsername={user}
          withUser={activeDm}
          messages={activeDmMessages}
          isTyping={activeDmTyping}
          onSend={handleSendDm}
          onSendFile={handleSendDmFile}
          onTyping={(t) => setDmTypingIndicator(activeDm.username, t)}
          onClose={() => setActiveDm(null)}
        />
      )}

      {showCreateRoom && <CreateRoomModal onClose={() => setShowCreateRoom(false)} onCreate={handleCreateRoom} />}
      {passwordPrompt && <PasswordModal roomName={passwordPrompt.name} onClose={() => setPasswordPrompt(null)} onSubmit={handlePasswordSubmit} />}

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @media (min-width: 768px) {
          .sidebar-wrapper { position: static !important; transform: none !important; box-shadow: none !important; }
          .menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  )
}

const DEFAULT_ROOMS = [
  { name: 'general', description: 'General chat', isPrivate: false, userCount: 0 },
  { name: 'random', description: 'Off-topic', isPrivate: false, userCount: 0 },
  { name: 'tech', description: 'Tech talk', isPrivate: false, userCount: 0 },
]

const styles = {
  app: { height: '100vh', display: 'flex', background: '#0a0a0a', overflow: 'hidden', position: 'relative' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 40, display: 'block',
  },
  sidebarWrapper: {
    position: 'fixed', top: 0, left: 0, height: '100vh',
    transform: 'translateX(-100%)',
    transition: 'transform 0.25s ease',
    zIndex: 50,
    '@media (min-width: 768px)': { position: 'static', transform: 'none' },
  },
  sidebarWrapperOpen: { transform: 'translateX(0)', boxShadow: '4px 0 40px rgba(0,0,0,0.8)' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  header: {
    height: 52, borderBottom: '1px solid #1a1a1a',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', background: '#0d0d0d', flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' },
  menuBtn: {
    background: 'transparent', border: 'none',
    color: '#888', fontSize: 18, cursor: 'pointer',
    padding: '4px 8px 4px 0', flexShrink: 0,
  },
  headerHash: { fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#444', flexShrink: 0 },
  headerRoom: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f0f0', flexShrink: 0 },
  privateBadge: {
    fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#ff9900',
    background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)',
    padding: '2px 6px', letterSpacing: '0.1em', flexShrink: 0,
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  statusDot: { width: 7, height: 7, borderRadius: '50%' },
  statusText: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#444', letterSpacing: '0.05em' },
  memberCount: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#555', background: '#1a1a1a', padding: '3px 8px', borderRadius: 10 },
  messages: { flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 2 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, padding: '60px 20px' },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#f0f0f0', marginBottom: 8 },
  emptyText: { fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#666' },
  typing: { display: 'flex', alignItems: 'center', gap: 10, padding: '4px 16px', marginTop: 4 },
  typingDots: { display: 'flex', gap: 3, alignItems: 'center' },
  typingDot: { width: 5, height: 5, background: '#444', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1s infinite' },
  typingText: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#444', letterSpacing: '0.05em' },
}