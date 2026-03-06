import { useState } from 'react'

const EMOJI_REACTIONS = ['👍','❤️','😂','🔥','👀','💯']

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function Avatar({ avatar, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: avatar?.color || '#1e2d45',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, color: '#070b14',
      fontFamily: "'Space Mono', monospace", flexShrink: 0,
    }}>
      {avatar?.initials}
    </div>
  )
}

export default function Message({ msg, isOwn, prevMsg }) {
  const [reactions, setReactions] = useState({})
  const [showPicker, setShowPicker] = useState(false)

  if (msg.type === 'system') {
    return (
      <div style={s.system}>
        <span style={s.systemLine} />
        <span style={s.systemText}>{msg.content}</span>
        <span style={s.systemLine} />
      </div>
    )
  }

  const sameUser = prevMsg && prevMsg.username === msg.username && prevMsg.type !== 'system'
  const isImage = msg.type === 'file' && msg.content?.mimetype?.startsWith('image/')

  const addReaction = (emoji) => {
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    setShowPicker(false)
  }

  return (
    <div style={{ ...s.row, ...(isOwn ? s.rowOwn : {}) }}>
      {!isOwn && (
        sameUser ? <div style={{ width: 32, flexShrink: 0 }} /> : <Avatar avatar={msg.avatar} />
      )}

      <div style={{ maxWidth: '72%' }}>
        {!sameUser && !isOwn && (
          <div style={s.meta}>
            <span style={{ ...s.username, color: msg.avatar?.color || '#4f9eff' }}>{msg.username}</span>
            <span style={s.time}>{formatTime(msg.timestamp)}</span>
          </div>
        )}

        <div style={{ ...s.bubble, ...(isOwn ? s.bubbleOwn : s.bubbleOther) }}>
          {msg.type === 'text' && <p style={s.text}>{msg.content}</p>}

          {msg.type === 'file' && isImage && (
            <div>
              <img src={msg.content.url} alt={msg.content.filename} style={s.image}
                onClick={() => window.open(msg.content.url, '_blank')} />
              <div style={s.imageMeta}>{msg.content.filename} · {formatFileSize(msg.content.size)}</div>
            </div>
          )}

          {msg.type === 'file' && !isImage && (
            <a href={msg.content.url} target="_blank" rel="noopener noreferrer" style={s.fileCard}>
              <div style={s.fileIconWrap}>{getFileIcon(msg.content.mimetype)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.fileName}>{msg.content.filename}</div>
                <div style={s.fileSize}>{formatFileSize(msg.content.size)}</div>
              </div>
              <span style={s.downloadArrow}>↓</span>
            </a>
          )}

          {sameUser && isOwn && <div style={s.timeInline}>{formatTime(msg.timestamp)}</div>}
        </div>

        {!sameUser && isOwn && (
          <div style={s.ownMeta}>
            <span style={s.time}>{formatTime(msg.timestamp)}</span>
          </div>
        )}

        {Object.keys(reactions).length > 0 && (
          <div style={s.reactions}>
            {Object.entries(reactions).map(([emoji, count]) => (
              <button key={emoji} style={s.reactionBadge} onClick={() => addReaction(emoji)}>
                {emoji} {count}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={s.reactionTrigger}>
        <button style={s.reactionBtn} onClick={() => setShowPicker(!showPicker)}>＋</button>
        {showPicker && (
          <div style={{ ...s.picker, ...(isOwn ? s.pickerOwn : {}) }}>
            {EMOJI_REACTIONS.map(e => (
              <button key={e} style={s.pickerEmoji} onClick={() => addReaction(e)}>{e}</button>
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
  if (mimetype.includes('zip')) return '🗜️'
  return '📎'
}

const s = {
  row: { display: 'flex', alignItems: 'flex-end', gap: 8, padding: '2px 16px', position: 'relative' },
  rowOwn: { flexDirection: 'row-reverse' },
  meta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, paddingLeft: 2 },
  ownMeta: { display: 'flex', justifyContent: 'flex-end', marginTop: 3, paddingRight: 2 },
  username: { fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700 },
  time: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#3d4f6a' },
  timeInline: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(79,158,255,0.4)', textAlign: 'right', marginTop: 4 },
  bubble: { padding: '10px 14px', borderRadius: 12, position: 'relative' },
  bubbleOther: {
    background: '#111827', border: '1px solid #1e2d45',
    borderBottomLeftRadius: 4,
  },
  bubbleOwn: {
    background: 'linear-gradient(135deg, rgba(79,158,255,0.15), rgba(79,255,176,0.08))',
    border: '1px solid rgba(79,158,255,0.2)',
    borderBottomRightRadius: 4,
  },
  text: { fontSize: 14, lineHeight: 1.55, color: '#e8edf5', wordBreak: 'break-word' },
  system: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', margin: '4px 0' },
  systemLine: { flex: 1, height: 1, background: '#1e2d45' },
  systemText: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#3d4f6a', whiteSpace: 'nowrap' },
  image: { maxWidth: 260, maxHeight: 200, display: 'block', borderRadius: 8, cursor: 'pointer', objectFit: 'cover' },
  imageMeta: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#3d4f6a', marginTop: 6 },
  fileCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', background: '#0d1220',
    border: '1px solid #1e2d45', borderRadius: 8,
    textDecoration: 'none', minWidth: 200,
  },
  fileIconWrap: { fontSize: 22, flexShrink: 0 },
  fileName: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#e8edf5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileSize: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#3d4f6a', marginTop: 2 },
  downloadArrow: { color: '#3d4f6a', fontSize: 14, flexShrink: 0 },
  reactions: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 },
  reactionBadge: {
    background: '#111827', border: '1px solid #1e2d45',
    borderRadius: 20, padding: '2px 8px',
    fontSize: 12, cursor: 'pointer',
    fontFamily: "'Space Mono', monospace", color: '#7a8ba8',
  },
  reactionTrigger: { position: 'relative', alignSelf: 'center' },
  reactionBtn: {
    width: 22, height: 22, background: 'transparent',
    border: '1px solid #1e2d45', color: '#3d4f6a',
    fontSize: 12, cursor: 'pointer', borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  picker: {
    position: 'absolute', bottom: '100%', left: 0,
    background: '#0d1220', border: '1px solid #1e2d45',
    borderRadius: 10, padding: 8,
    display: 'flex', gap: 4, zIndex: 100,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  pickerOwn: { left: 'auto', right: 0 },
  pickerEmoji: { background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', padding: '2px 4px', borderRadius: 6 },
}