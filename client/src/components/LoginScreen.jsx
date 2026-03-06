import { useState } from 'react'

export default function LoginScreen({ onJoin }) {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('general')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) return setError('Enter a username')
    if (trimmed.length < 2) return setError('At least 2 characters')
    if (trimmed.length > 20) return setError('Max 20 characters')
    onJoin(trimmed, room)
  }

  return (
    <div style={styles.container}>
      <div style={styles.noise} />
      <div style={styles.grid} />

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoAccent}>///</span>CHATTER
          </div>
          <p style={styles.tagline}>Real-time. No fluff.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>USERNAME</label>
            <input
              style={styles.input}
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="enter_handle"
              maxLength={20}
              autoFocus
            />
            {error && <span style={styles.error}>{error}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>ROOM</label>
            <div style={styles.roomGrid}>
              {['general', 'random', 'tech'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoom(r)}
                  style={{ ...styles.roomBtn, ...(room === r ? styles.roomBtnActive : {}) }}
                >
                  #{r}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>
            <span>CONNECT</span>
            <span style={styles.arrow}>→</span>
          </button>
        </form>

        <div style={styles.features}>
          {['WebSocket powered', 'File sharing', 'Emoji reactions', 'Multiple rooms'].map(f => (
            <div key={f} style={styles.feature}>
              <span style={styles.dot} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    position: 'relative',
    overflow: 'hidden',
  },
  noise: {
    position: 'absolute', inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
    opacity: 0.4, pointerEvents: 'none',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  card: {
    width: 420,
    background: '#111',
    border: '1px solid #2a2a2a',
    padding: '48px 40px',
    position: 'relative',
    boxShadow: '0 0 80px rgba(0,255,136,0.05), 0 40px 80px rgba(0,0,0,0.6)',
  },
  header: { marginBottom: 40 },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 32, fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#f0f0f0',
    marginBottom: 8,
  },
  logoAccent: { color: '#00ff88', marginRight: 4 },
  tagline: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, color: '#555',
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 24 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#555',
    letterSpacing: '0.15em',
  },
  input: {
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    color: '#f0f0f0',
    padding: '14px 16px',
    fontSize: 16,
    fontFamily: "'Space Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  error: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, color: '#ff3366',
  },
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  roomBtn: {
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    color: '#555',
    padding: '10px',
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  roomBtnActive: {
    border: '1px solid #00ff88',
    color: '#00ff88',
    background: 'rgba(0,255,136,0.05)',
  },
  submitBtn: {
    background: '#00ff88',
    color: '#0a0a0a',
    border: 'none',
    padding: '16px 24px',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: '0.1em',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.15s, transform 0.1s',
  },
  arrow: { fontSize: 20 },
  features: {
    marginTop: 40,
    paddingTop: 24,
    borderTop: '1px solid #1a1a1a',
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
  },
  feature: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#444',
    letterSpacing: '0.05em',
  },
  dot: {
    width: 4, height: 4,
    background: '#00ff88', borderRadius: '50%',
    flexShrink: 0,
  },
}
