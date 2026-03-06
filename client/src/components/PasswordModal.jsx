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
    position: 'fixed', inset: 0, background: 'rgba(7,11,20,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(8px)', padding: 16,
  },
  modal: {
    width: '100%', maxWidth: 360,
    background: '#0d1220', border: '1px solid #1e2d45',
    borderRadius: 16, padding: '32px 28px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
  },
  icon: { fontSize: 36, marginBottom: 16 },
  title: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#3d4f6a', letterSpacing: '0.15em', marginBottom: 6 },
  roomName: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#e8edf5', marginBottom: 8 },
  desc: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#7a8ba8', marginBottom: 24, lineHeight: 1.6 },
  form: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    background: '#070b14', border: '1.5px solid #1e2d45',
    color: '#e8edf5', padding: '12px 14px',
    fontSize: 14, fontFamily: "'Space Mono', monospace",
    outline: 'none', width: '100%', textAlign: 'center',
    letterSpacing: '0.1em', borderRadius: 10,
  },
  error: {
    fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#ff4f8b',
    padding: '8px 12px', background: 'rgba(255,79,139,0.08)',
    border: '1px solid rgba(255,79,139,0.2)', borderRadius: 8,
  },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1, background: 'transparent', border: '1.5px solid #1e2d45',
    color: '#7a8ba8', padding: '11px',
    fontFamily: "'Space Mono', monospace", fontSize: 11,
    cursor: 'pointer', borderRadius: 10,
  },
  joinBtn: {
    flex: 2, background: 'linear-gradient(135deg, #4f9eff, #4fffb0)',
    border: 'none', color: '#070b14', padding: '11px',
    fontFamily: "'Syne', sans-serif", fontSize: 13,
    fontWeight: 700, cursor: 'pointer', borderRadius: 10,
  },
}
