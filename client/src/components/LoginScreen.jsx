import { useState } from 'react'

export default function LoginScreen({ onJoin }) {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('general')
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) return setError('Enter a username')
    if (trimmed.length < 2) return setError('At least 2 characters')
    if (trimmed.length > 20) return setError('Max 20 characters')
    onJoin(trimmed, room)
  }

  return (
    <div style={s.container}>
      <div style={s.bg} />
      <div style={s.orb1} />
      <div style={s.orb2} />

      <div style={s.card}>
        <div style={s.cardGlow} />

        <div style={s.brand}>
          <div style={s.logoMark}>
            <span style={s.logoIcon}>⚡</span>
          </div>
          <div>
            <div style={s.logo}>Chattr</div>
            <div style={s.tagline}>Real-time messaging</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Your username</label>
            <div style={{ ...s.inputWrap, ...(focused ? s.inputWrapFocused : {}) }}>
              <span style={s.inputIcon}>@</span>
              <input
                style={s.input}
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="your_handle"
                maxLength={20}
                autoFocus
              />
            </div>
            {error && <span style={s.error}>⚠ {error}</span>}
          </div>

          <div style={s.field}>
            <label style={s.label}>Start in room</label>
            <div style={s.roomGrid}>
              {['general', 'random', 'tech'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoom(r)}
                  style={{ ...s.roomBtn, ...(room === r ? s.roomBtnActive : {}) }}
                >
                  <span style={s.roomHash}>#</span>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" style={s.submitBtn}>
            <span>Join Chat</span>
            <span style={s.submitArrow}>→</span>
          </button>
        </form>

        <div style={s.pills}>
          {[['⚡', 'WebSockets'], ['📎', 'File sharing'], ['💬', 'Private DMs'], ['🔒', 'Private rooms']].map(([icon, label]) => (
            <div key={label} style={s.pill}>
              <span>{icon}</span>
              <span style={s.pillText}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  container: {
    height: '100dvh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#070b14', position: 'relative',
    overflow: 'hidden', padding: 16,
  },
  bg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,158,255,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb1: {
    position: 'absolute', width: 400, height: 400,
    borderRadius: '50%', top: '-10%', right: '-15%',
    background: 'radial-gradient(circle, rgba(79,158,255,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', width: 300, height: 300,
    borderRadius: '50%', bottom: '5%', left: '-10%',
    background: 'radial-gradient(circle, rgba(79,255,176,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: 420,
    background: 'rgba(13,18,32,0.95)',
    border: '1px solid #1e2d45',
    borderRadius: 20,
    padding: '36px 32px',
    position: 'relative',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,158,255,0.05)',
  },
  cardGlow: {
    position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(79,158,255,0.4), transparent)',
    pointerEvents: 'none',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 },
  logoMark: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg, #4f9eff, #4fffb0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoIcon: { fontSize: 20 },
  logo: { fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#e8edf5' },
  tagline: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#3d4f6a', letterSpacing: '0.05em', marginTop: 2 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#7a8ba8', letterSpacing: '0.1em', textTransform: 'uppercase' },
  inputWrap: {
    display: 'flex', alignItems: 'center',
    background: '#070b14', border: '1.5px solid #1e2d45',
    borderRadius: 10, overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputWrapFocused: {
    borderColor: '#4f9eff',
    boxShadow: '0 0 0 3px rgba(79,158,255,0.1)',
  },
  inputIcon: { padding: '0 12px', color: '#3d4f6a', fontSize: 14, fontFamily: "'Space Mono', monospace" },
  input: {
    flex: 1, background: 'transparent', border: 'none',
    color: '#e8edf5', padding: '13px 14px 13px 0',
    fontSize: 15, outline: 'none',
    fontFamily: "'Syne', sans-serif",
  },
  error: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#ff4f8b' },
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  roomBtn: {
    background: '#070b14', border: '1.5px solid #1e2d45',
    color: '#7a8ba8', padding: '10px 8px',
    fontSize: 13, fontFamily: "'Space Mono', monospace",
    cursor: 'pointer', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    transition: 'all 0.15s',
  },
  roomBtnActive: {
    borderColor: '#4f9eff', color: '#4f9eff',
    background: 'rgba(79,158,255,0.08)',
    boxShadow: '0 0 0 3px rgba(79,158,255,0.08)',
  },
  roomHash: { opacity: 0.5, fontSize: 11 },
  submitBtn: {
    background: 'linear-gradient(135deg, #4f9eff, #4fffb0)',
    color: '#070b14', border: 'none',
    padding: '15px 24px', fontSize: 15,
    fontWeight: 800, fontFamily: "'Syne', sans-serif",
    cursor: 'pointer', borderRadius: 10,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4,
    boxShadow: '0 8px 24px rgba(79,158,255,0.25)',
    transition: 'transform 0.1s, box-shadow 0.15s',
  },
  submitArrow: { fontSize: 18 },
  pills: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 8, marginTop: 28,
    paddingTop: 24, borderTop: '1px solid #1e2d45',
  },
  pill: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: '#111827', borderRadius: 8, padding: '8px 10px',
  },
  pillText: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#3d4f6a' },
}