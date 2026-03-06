import { useState } from 'react'

export default function CreateRoomModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Room name is required')
    if (trimmed.length < 2) return setError('Name must be at least 2 characters')
    if (isPrivate && !password.trim()) return setError('Password is required for private rooms')

    setLoading(true)
    const result = await onCreate({ name: trimmed, description: description.trim(), isPrivate, password: password.trim() })
    setLoading(false)

    if (result?.error) return setError(result.error)
    onClose()
  }

  const preview = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 24)

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>CREATE ROOM</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>ROOM NAME</label>
            <input
              style={styles.input}
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. design-talk"
              maxLength={32}
              autoFocus
            />
            {preview && (
              <span style={styles.preview}>→ #{preview}</span>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>DESCRIPTION <span style={styles.optional}>(optional)</span></label>
            <input
              style={styles.input}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this room for?"
              maxLength={80}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.toggleRow}>
              <div>
                <div style={styles.label}>PRIVATE ROOM</div>
                <div style={styles.sublabel}>Requires a password to join</div>
              </div>
              <button
                type="button"
                style={{ ...styles.toggle, ...(isPrivate ? styles.toggleOn : {}) }}
                onClick={() => { setIsPrivate(!isPrivate); setPassword('') }}
              >
                <div style={{ ...styles.toggleThumb, ...(isPrivate ? styles.toggleThumbOn : {}) }} />
              </button>
            </label>
          </div>

          {isPrivate && (
            <div style={styles.field}>
              <label style={styles.label}>PASSWORD</label>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Set a room password"
              />
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.createBtn} disabled={loading}>
              {loading ? 'Creating...' : (
                <><span style={styles.createIcon}>{isPrivate ? '🔒' : '#'}</span> Create Room</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    width: 420,
    background: '#111',
    border: '1px solid #2a2a2a',
    boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #1a1a1a',
  },
  title: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, fontWeight: 700,
    color: '#00ff88', letterSpacing: '0.15em',
  },
  closeBtn: {
    background: 'transparent', border: 'none',
    color: '#444', cursor: 'pointer', fontSize: 14,
    padding: 4,
  },
  form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#555', letterSpacing: '0.12em',
  },
  sublabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#3a3a3a', marginTop: 2,
  },
  optional: { color: '#333' },
  input: {
    background: '#0a0a0a', border: '1px solid #2a2a2a',
    color: '#f0f0f0', padding: '12px 14px',
    fontSize: 14, fontFamily: "'Syne', sans-serif",
    outline: 'none', width: '100%',
    transition: 'border-color 0.15s',
  },
  preview: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, color: '#444',
  },
  toggleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer',
  },
  toggle: {
    width: 44, height: 24,
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: 12, position: 'relative',
    cursor: 'pointer', flexShrink: 0,
    transition: 'all 0.2s',
  },
  toggleOn: {
    background: 'rgba(0,255,136,0.15)',
    border: '1px solid rgba(0,255,136,0.4)',
  },
  toggleThumb: {
    position: 'absolute', top: 3, left: 3,
    width: 16, height: 16,
    background: '#333', borderRadius: '50%',
    transition: 'all 0.2s',
  },
  toggleThumbOn: {
    left: 23, background: '#00ff88',
  },
  error: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, color: '#ff3366',
    padding: '10px 14px',
    background: 'rgba(255,51,102,0.08)',
    border: '1px solid rgba(255,51,102,0.2)',
  },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: {
    background: 'transparent', border: '1px solid #2a2a2a',
    color: '#555', padding: '10px 20px',
    fontFamily: "'Space Mono', monospace", fontSize: 11,
    cursor: 'pointer', letterSpacing: '0.05em',
  },
  createBtn: {
    background: '#00ff88', border: 'none',
    color: '#0a0a0a', padding: '10px 20px',
    fontFamily: "'Syne', sans-serif", fontSize: 13,
    fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
    transition: 'opacity 0.15s',
  },
  createIcon: { fontSize: 12 },
}
