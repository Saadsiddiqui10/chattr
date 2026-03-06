import { useState } from 'react'

export default function PasswordModal({ roomName, onClose, onSubmit }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return setError('Enter the password')
    setLoading(true)
    const result = await onSubmit(password.trim())
    setLoading(false)
    if (result?.error) {
      setError(result.error)
      setPassword('')
    }
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.icon}>🔒</div>
        <div style={styles.title}>PRIVATE ROOM</div>
        <div style={styles.roomName}>#{roomName}</div>
        <p style={styles.desc}>This room requires a password to join.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Enter password"
            autoFocus
          />
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.joinBtn} disabled={loading}>
              {loading ? 'Joining...' : 'Join Room →'}
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
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  },
  modal: {
    width: 360,
    background: '#111', border: '1px solid #2a2a2a',
    padding: '32px 28px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
  },
  icon: { fontSize: 32, marginBottom: 12 },
  title: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#555',
    letterSpacing: '0.15em', marginBottom: 6,
  },
  roomName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 20, fontWeight: 800,
    color: '#f0f0f0', marginBottom: 8,
  },
  desc: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, color: '#444',
    marginBottom: 20, lineHeight: 1.6,
  },
  form: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    background: '#0a0a0a', border: '1px solid #2a2a2a',
    color: '#f0f0f0', padding: '12px 14px',
    fontSize: 14, fontFamily: "'Space Mono', monospace",
    outline: 'none', width: '100%', textAlign: 'center',
    letterSpacing: '0.1em',
  },
  error: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, color: '#ff3366',
    padding: '8px 12px',
    background: 'rgba(255,51,102,0.08)',
    border: '1px solid rgba(255,51,102,0.2)',
  },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    background: 'transparent', border: '1px solid #2a2a2a',
    color: '#555', padding: '10px',
    fontFamily: "'Space Mono', monospace", fontSize: 11,
    cursor: 'pointer',
  },
  joinBtn: {
    flex: 2,
    background: '#00ff88', border: 'none',
    color: '#0a0a0a', padding: '10px',
    fontFamily: "'Syne', sans-serif", fontSize: 13,
    fontWeight: 700, cursor: 'pointer',
  },
}
