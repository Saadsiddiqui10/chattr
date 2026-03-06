import { useState } from 'react'

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '🔥', '👀', '💯']

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function Avatar({ avatar, username }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 4,
      background: avatar?.color || '#333',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: '#0a0a0a',
      fontFamily: "'Space Mono', monospace",
      flexShrink: 0,
    }}>
      {avatar?.initials || username?.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function Message({ msg, isOwn, prevMsg }) {
  const [reactions, setReactions] = useState({})
  const [showPicker, setShowPicker] = useState(false)

  if (msg.type === 'system') {
    return (
      <div style={styles.system}>
        <span style={styles.systemLine} />
        <span style={styles.systemText}>{msg.content}</span>
        <span style={styles.systemLine} />
      </div>
    )
  }

  const sameUser = prevMsg && prevMsg.username === msg.username && prevMsg.type !== 'system'
  const showHeader = !sameUser

  const addReaction = (emoji) => {
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    setShowPicker(false)
  }

  const isImage = msg.type === 'file' && msg.content?.mimetype?.startsWith('image/')

  return (
    <div
      style={{ ...styles.wrapper, ...(isOwn ? styles.wrapperOwn : {}) }}
      onMouseEnter={() => {}}
    >
      {!isOwn && showHeader && <Avatar avatar={msg.avatar} username={msg.username} />}
      {!isOwn && !showHeader && <div style={{ width: 32 }} />}

      <div style={{ ...styles.bubble, ...(isOwn ? styles.bubbleOwn : styles.bubbleOther), maxWidth: '70%' }}>
        {showHeader && !isOwn && (
          <div style={styles.header}>
            <span style={styles.username}>{msg.username}</span>
            <span style={styles.time}>{formatTime(msg.timestamp)}</span>
          </div>
        )}

        {msg.type === 'text' && (
          <p style={styles.text}>{msg.content}</p>
        )}

        {msg.type === 'file' && isImage && (
          <div>
            <img
              src={msg.content.url}
              alt={msg.content.filename}
              style={styles.image}
              onClick={() => window.open(msg.content.url, '_blank')}
            />
            <div style={styles.fileInfo}>
              <span style={styles.fileName}>{msg.content.filename}</span>
              <span style={styles.fileSize}>{formatFileSize(msg.content.size)}</span>
            </div>
          </div>
        )}

        {msg.type === 'file' && !isImage && (
          <a href={msg.content.url} target="_blank" rel="noopener noreferrer" style={styles.fileCard}>
            <div style={styles.fileIcon}>
              {getFileIcon(msg.content.mimetype)}
            </div>
            <div>
              <div style={styles.fileName}>{msg.content.filename}</div>
              <div style={styles.fileSize}>{formatFileSize(msg.content.size)}</div>
            </div>
            <span style={styles.downloadIcon}>↓</span>
          </a>
        )}

        {!showHeader && isOwn && (
          <div style={{ ...styles.header, justifyContent: 'flex-end' }}>
            <span style={styles.time}>{formatTime(msg.timestamp)}</span>
          </div>
        )}
        {showHeader && isOwn && (
          <div style={{ ...styles.header, justifyContent: 'flex-end' }}>
            <span style={styles.time}>{formatTime(msg.timestamp)}</span>
          </div>
        )}

        {Object.keys(reactions).length > 0 && (
          <div style={styles.reactions}>
            {Object.entries(reactions).map(([emoji, count]) => (
              <button key={emoji} style={styles.reactionBadge} onClick={() => addReaction(emoji)}>
                {emoji} {count}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.emojiTrigger}>
        <button style={styles.emojiBtn} onClick={() => setShowPicker(!showPicker)} title="React">
          +
        </button>
        {showPicker && (
          <div style={{ ...styles.picker, ...(isOwn ? styles.pickerOwn : {}) }}>
            {EMOJI_REACTIONS.map(e => (
              <button key={e} style={styles.pickerEmoji} onClick={() => addReaction(e)}>{e}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getFileIcon(mimetype) {
  if (!mimetype) return '📎'
  if (mimetype.includes('pdf')) return '📄'
  if (mimetype.includes('video')) return '🎬'
  if (mimetype.includes('audio')) return '🎵'
  if (mimetype.includes('zip') || mimetype.includes('archive')) return '🗜️'
  return '📎'
}

const styles = {
  wrapper: {
    display: 'flex', alignItems: 'flex-end', gap: 8,
    marginBottom: 4, padding: '0 16px',
    position: 'relative',
  },
  wrapperOwn: { flexDirection: 'row-reverse' },
  bubble: {
    padding: '10px 14px',
    borderRadius: 4,
    position: 'relative',
  },
  bubbleOther: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
  },
  bubbleOwn: {
    background: 'rgba(0,255,136,0.08)',
    border: '1px solid rgba(0,255,136,0.2)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  username: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, fontWeight: 700,
    color: '#00ff88',
  },
  time: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#444',
    marginLeft: 'auto',
  },
  text: {
    fontSize: 14, lineHeight: 1.5,
    color: '#e0e0e0',
    wordBreak: 'break-word',
  },
  system: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 16px', margin: '8px 0',
  },
  systemLine: { flex: 1, height: 1, background: '#1a1a1a' },
  systemText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#333',
    whiteSpace: 'nowrap', letterSpacing: '0.05em',
  },
  image: {
    maxWidth: 280, maxHeight: 200,
    display: 'block', borderRadius: 2,
    cursor: 'pointer', objectFit: 'cover',
  },
  fileCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px',
    background: '#111',
    border: '1px solid #2a2a2a',
    textDecoration: 'none',
    borderRadius: 2,
    transition: 'border-color 0.15s',
  },
  fileIcon: { fontSize: 24 },
  fileName: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, color: '#e0e0e0',
    overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', maxWidth: 160,
  },
  fileSize: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#555',
    marginTop: 2,
  },
  fileInfo: { marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  downloadIcon: { color: '#555', fontSize: 16, marginLeft: 'auto' },
  reactions: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 },
  reactionBadge: {
    background: '#111', border: '1px solid #2a2a2a',
    borderRadius: 12, padding: '2px 8px',
    fontSize: 12, cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    color: '#ccc',
  },
  emojiTrigger: { position: 'relative', alignSelf: 'center' },
  emojiBtn: {
    width: 22, height: 22,
    background: 'transparent', border: '1px solid #2a2a2a',
    color: '#444', fontSize: 14,
    cursor: 'pointer', borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
    lineHeight: 1,
  },
  picker: {
    position: 'absolute', bottom: '100%', left: 0,
    background: '#111', border: '1px solid #2a2a2a',
    borderRadius: 4, padding: 8,
    display: 'flex', gap: 4,
    zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  },
  pickerOwn: { left: 'auto', right: 0 },
  pickerEmoji: {
    background: 'transparent', border: 'none',
    fontSize: 18, cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 4,
    transition: 'background 0.1s',
  },
}
