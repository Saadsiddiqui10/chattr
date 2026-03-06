import { useState, useRef, useCallback } from 'react'

const EMOJI_GRID = ['😀','😂','😍','🥰','😎','🤔','😅','🙈','🔥','💯','👍','❤️','🎉','✨','💪','🚀','🎯','👀','🤝','💡','⚡','🎸','🌊','🌙','⭐','🦊','🐧','🍕','☕','🎮']
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export default function ChatInput({ onSend, onSendFile, onTyping, disabled }) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const typingTimer = useRef()

  const handleTextChange = (e) => {
    setText(e.target.value)
    onTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => onTyping(false), 1500)
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    onTyping(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji)
    setShowEmoji(false)
  }

const uploadFile = useCallback(async (file) => {
  if (!file) return
  alert('📎 File sharing is not available in this version.')
}, [onSendFile])

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  return (
    <div
      style={{ ...s.container, ...(dragOver ? s.dragOver : {}) }}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {dragOver && (
        <div style={s.dropOverlay}>
          <span style={s.dropText}>📎 Drop to upload</span>
        </div>
      )}

      <div style={s.inputRow}>
        <button style={s.iconBtn} onClick={() => fileRef.current?.click()} disabled={uploading} title="Attach file">
          {uploading ? <span style={s.spinner}>⏳</span> : <span style={s.iconBtnIcon}>📎</span>}
        </button>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => uploadFile(e.target.files[0])} />

        <button
          style={{ ...s.iconBtn, ...(showEmoji ? s.iconBtnActive : {}) }}
          onClick={() => setShowEmoji(!showEmoji)}
          title="Emoji"
        >
          <span style={s.iconBtnIcon}>😊</span>
        </button>

        <textarea
          style={s.textarea}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Connecting...' : 'Write a message...'}
          disabled={disabled}
          rows={1}
        />

        <button
          style={{ ...s.sendBtn, ...(text.trim() ? s.sendBtnActive : {}) }}
          onClick={handleSend}
          disabled={!text.trim() || disabled}
        >
          <span style={s.sendIcon}>↑</span>
        </button>
      </div>

      {showEmoji && (
        <div style={s.picker}>
          <div style={s.emojiGrid}>
            {EMOJI_GRID.map(e => (
              <button key={e} style={s.emojiCell} onClick={() => insertEmoji(e)}>{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  container: {
    padding: '10px 16px 16px',
    borderTop: '1px solid #1e2d45',
    background: '#0a0f1e',
    position: 'relative',
    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
  },
  dragOver: { background: 'rgba(79,158,255,0.04)' },
  dropOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(79,158,255,0.05)',
    border: '2px dashed rgba(79,158,255,0.3)',
    borderRadius: 12, zIndex: 10, pointerEvents: 'none',
  },
  dropText: { fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#4f9eff' },
  inputRow: {
    display: 'flex', alignItems: 'flex-end', gap: 6,
    background: '#111827', border: '1.5px solid #1e2d45',
    borderRadius: 14, padding: '8px 8px 8px 10px',
    transition: 'border-color 0.2s',
  },
  iconBtn: {
    width: 32, height: 32, background: 'transparent', border: 'none',
    cursor: 'pointer', fontSize: 16, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.1s',
  },
  iconBtnActive: { background: 'rgba(79,158,255,0.1)' },
  iconBtnIcon: { fontSize: 16 },
  spinner: { fontSize: 14 },
  textarea: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#e8edf5', fontSize: 14, fontFamily: "'Syne', sans-serif",
    resize: 'none', lineHeight: 1.5, padding: '5px 0',
    minHeight: 24, maxHeight: 120,
  },
  sendBtn: {
    width: 34, height: 34, background: '#1e2d45',
    border: 'none', color: '#3d4f6a',
    cursor: 'pointer', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.15s',
  },
  sendBtnActive: {
    background: 'linear-gradient(135deg, #4f9eff, #4fffb0)',
    color: '#070b14',
    boxShadow: '0 4px 12px rgba(79,158,255,0.3)',
  },
  sendIcon: { fontSize: 16, fontWeight: 700 },
  picker: {
    position: 'absolute', bottom: '100%', left: 16, right: 16,
    background: '#0d1220', border: '1px solid #1e2d45',
    borderRadius: 12, padding: 10,
    boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', zIndex: 50,
  },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2 },
  emojiCell: {
    width: 32, height: 32, background: 'transparent', border: 'none',
    fontSize: 18, cursor: 'pointer', borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}