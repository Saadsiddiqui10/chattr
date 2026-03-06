import { useState, useEffect, useRef, useCallback } from 'react'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function DmPanel({ myUsername, withUser, messages, isTyping, onSend, onSendFile, onTyping, onClose }) {
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef()
  const fileRef = useRef()
  const typingTimer = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
    onTyping(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
    onTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => onTyping(false), 1500)
  }

  const uploadFile = useCallback(async (file) => {
    if (!file || file.size > 5 * 1024 * 1024) return alert('File must be under 5MB')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${SERVER_URL}/upload`, { method: 'POST', body: form })
      const data = await res.json()
      onSendFile(data)
    } catch { alert('Upload failed') }
    finally { setUploading(false) }
  }, [onSendFile])

  const isImage = (mimetype) => mimetype?.startsWith('image/')

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.dmAvatar} title={withUser.username}>
            <div style={{ ...styles.avatarInner, background: withUser.avatar?.color || '#333' }}>
              {withUser.avatar?.initials}
            </div>
          </div>
          <div>
            <div style={styles.dmName}>{withUser.username}</div>
            <div style={styles.dmSub}>Direct Message</div>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyAvatar} title={withUser.username}>
              <div style={{ ...styles.avatarInner, background: withUser.avatar?.color || '#333', width: 48, height: 48, fontSize: 16 }}>
                {withUser.avatar?.initials}
              </div>
            </div>
            <div style={styles.emptyName}>{withUser.username}</div>
            <div style={styles.emptyText}>Start of your conversation</div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.from === myUsername
          const prev = messages[i - 1]
          const sameUser = prev && prev.from === msg.from

          return (
            <div key={msg.id} style={{ ...styles.msgRow, ...(isOwn ? styles.msgRowOwn : {}) }}>
              {!isOwn && !sameUser && (
                <div style={{ ...styles.avatarInner, background: withUser.avatar?.color || '#333', width: 28, height: 28, fontSize: 10, flexShrink: 0, borderRadius: 3 }}>
                  {withUser.avatar?.initials}
                </div>
              )}
              {!isOwn && sameUser && <div style={{ width: 28, flexShrink: 0 }} />}

              <div style={{ ...styles.bubble, ...(isOwn ? styles.bubbleOwn : styles.bubbleOther) }}>
                {!sameUser && (
                  <div style={styles.msgMeta}>
                    <span style={{ ...styles.msgUser, color: isOwn ? '#00ff88' : withUser.avatar?.color }}>{msg.from}</span>
                    <span style={styles.msgTime}>{formatTime(msg.timestamp)}</span>
                  </div>
                )}
                {msg.type === 'text' && <p style={styles.msgText}>{msg.content}</p>}
                {msg.type === 'file' && isImage(msg.content?.mimetype) && (
                  <div>
                    <img src={msg.content.url} alt={msg.content.filename} style={styles.image} onClick={() => window.open(msg.content.url, '_blank')} />
                    <div style={styles.fileInfo}><span style={styles.fileName}>{msg.content.filename}</span></div>
                  </div>
                )}
                {msg.type === 'file' && !isImage(msg.content?.mimetype) && (
                  <a href={msg.content.url} target="_blank" rel="noopener noreferrer" style={styles.fileCard}>
                    <span style={{ fontSize: 20 }}>📎</span>
                    <div>
                      <div style={styles.fileName}>{msg.content.filename}</div>
                      <div style={styles.fileSize}>{formatFileSize(msg.content.size)}</div>
                    </div>
                    <span style={{ color: '#555', marginLeft: 'auto' }}>↓</span>
                  </a>
                )}
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div style={styles.typingRow}>
            <div style={styles.typingDots}>
              {[0,150,300].map(d => (
                <span key={d} style={{ ...styles.dot, animationDelay: `${d}ms` }} />
              ))}
            </div>
            <span style={styles.typingText}>{withUser.username} is typing</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputRow}>
          <button style={styles.attachBtn} onClick={() => fileRef.current?.click()} title="Attach file">
            {uploading ? '⏳' : '📎'}
          </button>
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => uploadFile(e.target.files[0])} />
          <textarea
            style={styles.textarea}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${withUser.username}`}
            rows={1}
          />
          <button
            style={{ ...styles.sendBtn, ...(text.trim() ? styles.sendBtnActive : {}) }}
            onClick={handleSend}
            disabled={!text.trim()}
          >→</button>
        </div>
      </div>

      <style>{`@keyframes dmBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  )
}

const styles = {
panel: {
    position: 'fixed', inset: 0,
    width: '100%', height: '100vh',
    background: '#0d0d0d',
    borderLeft: '1px solid #1a1a1a',
    display: 'flex', flexDirection: 'column',
    zIndex: 30,
    '@media (min-width: 768px)': { position: 'static', width: 360 },
  },
  header: {
    height: 56, borderBottom: '1px solid #1a1a1a',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  dmAvatar: {},
  avatarInner: {
    width: 32, height: 32, borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#0a0a0a',
    fontFamily: "'Space Mono', monospace",
  },
  dmName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 14, fontWeight: 700, color: '#f0f0f0',
  },
  dmSub: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, color: '#444', letterSpacing: '0.1em',
  },
  closeBtn: {
    background: 'transparent', border: 'none',
    color: '#444', cursor: 'pointer', fontSize: 14,
  },
  messages: {
    flex: 1, overflowY: 'auto',
    padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2,
  },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px', opacity: 0.4,
  },
  emptyAvatar: { marginBottom: 12 },
  emptyName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 18, fontWeight: 800, color: '#f0f0f0', marginBottom: 4,
  },
  emptyText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, color: '#555',
  },
  msgRow: {
    display: 'flex', gap: 8, padding: '2px 12px',
    alignItems: 'flex-end',
  },
  msgRowOwn: { flexDirection: 'row-reverse' },
  bubble: {
    maxWidth: '75%', padding: '8px 12px', borderRadius: 4,
  },
  bubbleOther: { background: '#1a1a1a', border: '1px solid #2a2a2a' },
  bubbleOwn: { background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)' },
  msgMeta: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 },
  msgUser: { fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700 },
  msgTime: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#444' },
  msgText: { fontSize: 13, color: '#e0e0e0', lineHeight: 1.5, wordBreak: 'break-word' },
  image: { maxWidth: 240, maxHeight: 180, display: 'block', borderRadius: 2, cursor: 'pointer', objectFit: 'cover' },
  fileInfo: { marginTop: 4 },
  fileName: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 },
  fileSize: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#555', marginTop: 2 },
  fileCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#111', border: '1px solid #2a2a2a', textDecoration: 'none', borderRadius: 2 },
  typingRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px' },
  typingDots: { display: 'flex', gap: 3 },
  dot: { width: 5, height: 5, background: '#444', borderRadius: '50%', display: 'inline-block', animation: 'dmBounce 1s infinite' },
  typingText: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#444' },
  inputArea: { padding: '10px 12px 14px', borderTop: '1px solid #1a1a1a', flexShrink: 0 },
  inputRow: {
    display: 'flex', alignItems: 'flex-end', gap: 6,
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: 4, padding: '6px',
  },
  attachBtn: { width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textarea: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e0e0e0', fontSize: 13, fontFamily: "'Syne', sans-serif", resize: 'none', lineHeight: 1.5, padding: '3px 0', minHeight: 22, maxHeight: 100 },
  sendBtn: { width: 32, height: 32, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#444', fontSize: 16, cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' },
  sendBtnActive: { background: '#00ff88', color: '#0a0a0a', border: '1px solid #00ff88' },
}
