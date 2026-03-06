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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji)
    setShowEmoji(false)
  }

  const uploadFile = useCallback(async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return alert('File must be under 5MB')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${SERVER_URL}/upload`, { method: 'POST', body: form })
      const data = await res.json()
      onSendFile(data)
    } catch (e) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onSendFile])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  return (
    <div
      style={{ ...styles.container, ...(dragOver ? styles.dragOver : {}) }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {dragOver && (
        <div style={styles.dropOverlay}>
          <span style={styles.dropText}>DROP FILE TO UPLOAD</span>
        </div>
      )}

      <div style={styles.inputRow}>
        <div style={styles.actions}>
          <button
            style={styles.actionBtn}
            onClick={() => fileRef.current?.click()}
            title="Attach file"
            disabled={uploading}
          >
            {uploading ? '⏳' : '📎'}
          </button>
          <input
            ref={fileRef}
            type="file"
            style={{ display: 'none' }}
            onChange={e => uploadFile(e.target.files[0])}
          />
          <button
            style={{ ...styles.actionBtn, ...(showEmoji ? styles.actionBtnActive : {}) }}
            onClick={() => setShowEmoji(!showEmoji)}
            title="Emoji"
          >
            😊
          </button>
        </div>

        <textarea
          style={styles.textarea}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${disabled ? '...' : 'room'}`}
          disabled={disabled}
          rows={1}
        />

        <button
          style={{ ...styles.sendBtn, ...(text.trim() ? styles.sendBtnActive : {}) }}
          onClick={handleSend}
          disabled={!text.trim() || disabled}
        >
          →
        </button>
      </div>

      {showEmoji && (
        <div style={styles.emojiPicker}>
          <div style={styles.emojiGrid}>
            {EMOJI_GRID.map(e => (
              <button key={e} style={styles.emojiCell} onClick={() => insertEmoji(e)}>{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '12px 16px 16px',
    borderTop: '1px solid #1a1a1a',
    background: '#0f0f0f',
    position: 'relative',
    transition: 'background 0.15s',
  },
  dragOver: { background: 'rgba(0,255,136,0.04)' },
  dropOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,255,136,0.05)',
    border: '2px dashed rgba(0,255,136,0.4)',
    zIndex: 10,
    pointerEvents: 'none',
  },
  dropText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12, color: '#00ff88',
    letterSpacing: '0.15em',
  },
  inputRow: {
    display: 'flex', alignItems: 'flex-end', gap: 8,
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 4, padding: '8px',
  },
  actions: { display: 'flex', gap: 4, paddingBottom: 2 },
  actionBtn: {
    width: 32, height: 32,
    background: 'transparent', border: 'none',
    cursor: 'pointer', fontSize: 16,
    borderRadius: 4, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.1s',
    flexShrink: 0,
  },
  actionBtnActive: { background: 'rgba(0,255,136,0.1)' },
  textarea: {
    flex: 1, background: 'transparent',
    border: 'none', outline: 'none',
    color: '#e0e0e0', fontSize: 14,
    fontFamily: "'Syne', sans-serif",
    resize: 'none', lineHeight: 1.5,
    padding: '4px 0',
    minHeight: 24, maxHeight: 120,
  },
  sendBtn: {
    width: 36, height: 36,
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    color: '#444', fontSize: 18,
    cursor: 'pointer', borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  sendBtnActive: {
    background: '#00ff88',
    color: '#0a0a0a',
    border: '1px solid #00ff88',
  },
  emojiPicker: {
    position: 'absolute', bottom: '100%', left: 16,
    background: '#111', border: '1px solid #2a2a2a',
    borderRadius: 4, padding: 8,
    boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
    zIndex: 50,
  },
  emojiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
    gap: 2,
  },
  emojiCell: {
    width: 32, height: 32,
    background: 'transparent', border: 'none',
    fontSize: 18, cursor: 'pointer',
    borderRadius: 4, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.1s',
  },
}
