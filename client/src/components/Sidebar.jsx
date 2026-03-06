export default function Sidebar({ rooms, currentRoom, onSwitchRoom, users, username, onCreateRoom, onlineUsers, onOpenDm, activeDmUser }) {
  const publicRooms = rooms.filter(r => !r.isPrivate)
  const privateRooms = rooms.filter(r => r.isPrivate)
  const otherUsers = onlineUsers.filter(u => u.username !== username)

  return (
    <div style={s.sidebar}>
      <div style={s.header}>
        <div style={s.brand}>
          <div style={s.brandIcon}>⚡</div>
          <span style={s.brandName}>Chattr</span>
        </div>
        <div style={s.onlineBadge}>
          <div style={s.onlineDotSmall} />
          <span style={s.onlineCount}>{onlineUsers.length}</span>
        </div>
      </div>

      <div style={s.scroll}>
        <Section label="Rooms" action={{ label: '+', onClick: onCreateRoom }}>
          {publicRooms.map(room => (
            <RoomBtn key={room.name} room={room} active={currentRoom === room.name && !activeDmUser} onClick={() => onSwitchRoom(room)} />
          ))}
        </Section>

        {privateRooms.length > 0 && (
          <Section label="Private">
            {privateRooms.map(room => (
              <RoomBtn key={room.name} room={room} active={currentRoom === room.name && !activeDmUser} onClick={() => onSwitchRoom(room)} />
            ))}
          </Section>
        )}

        <Section label="Direct Messages">
          {otherUsers.length === 0
            ? <div style={s.empty}>No one else online</div>
            : otherUsers.map(user => (
              <button
                key={user.username}
                style={{ ...s.dmBtn, ...(activeDmUser === user.username ? s.dmBtnActive : {}) }}
                onClick={() => onOpenDm(user)}
              >
                <div style={s.dmAvatarWrap}>
                  <div style={{ ...s.dmAvatar, background: user.avatar?.color || '#1e2d45' }}>
                    {user.avatar?.initials}
                  </div>
                  <div style={s.onlineDot} />
                </div>
                <span style={s.dmName}>{user.username}</span>
              </button>
            ))
          }
        </Section>

        <Section label={`In Room — ${roomUsers(users).length}`}>
          {roomUsers(users).map(u => (
            <div key={u.username} style={s.memberRow}>
              <div style={{ ...s.memberAvatar, background: u.avatar?.color || '#1e2d45' }}>
                {u.avatar?.initials}
              </div>
              <span style={{ ...s.memberName, ...(u.username === username ? s.memberNameSelf : {}) }}>
                {u.username}{u.username === username ? ' · you' : ''}
              </span>
            </div>
          ))}
        </Section>
      </div>

      <div style={s.footer}>
        <div style={{ ...s.memberAvatar, background: '#1e2d45', width: 32, height: 32, fontSize: 11 }}>
          {username.slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={s.footerName}>{username}</div>
          <div style={s.footerRoom}>#{currentRoom}</div>
        </div>
      </div>
    </div>
  )
}

function roomUsers(users) { return users || [] }

function Section({ label, action, children }) {
  return (
    <div style={ss.section}>
      <div style={ss.sectionHeader}>
        <span style={ss.sectionLabel}>{label}</span>
        {action && (
          <button style={ss.sectionAction} onClick={action.onClick}>{action.label}</button>
        )}
      </div>
      {children}
    </div>
  )
}

function RoomBtn({ room, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...ss.roomBtn, ...(active ? ss.roomBtnActive : {}) }}>
      <span style={ss.roomIcon}>{room.isPrivate ? '🔒' : '#'}</span>
      <span style={ss.roomName}>{room.name}</span>
      {room.userCount > 0 && <span style={ss.roomCount}>{room.userCount}</span>}
    </button>
  )
}

const s = {
  sidebar: {
    width: 240, height: '100dvh',
    background: '#0a0f1e',
    borderRight: '1px solid #1e2d45',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0,
  },
  header: {
    padding: '20px 16px',
    borderBottom: '1px solid #1e2d45',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: 'linear-gradient(135deg, #4f9eff, #4fffb0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14,
  },
  brandName: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#e8edf5' },
  onlineBadge: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: '#111827', borderRadius: 20,
    padding: '4px 10px', border: '1px solid #1e2d45',
  },
  onlineDotSmall: { width: 6, height: 6, borderRadius: '50%', background: '#4fffb0' },
  onlineCount: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#7a8ba8' },
  scroll: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  empty: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#3d4f6a', padding: '4px 16px' },
  dmBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '7px 16px',
    background: 'transparent', border: 'none',
    cursor: 'pointer', borderRadius: 0,
    transition: 'background 0.1s',
  },
  dmBtnActive: { background: 'rgba(79,158,255,0.08)' },
  dmAvatarWrap: { position: 'relative', flexShrink: 0 },
  dmAvatar: {
    width: 28, height: 28, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, fontWeight: 700, color: '#070b14',
    fontFamily: "'Space Mono', monospace",
  },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 8, height: 8, background: '#4fffb0',
    borderRadius: '50%', border: '2px solid #0a0f1e',
  },
  dmName: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#7a8ba8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  memberRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 16px' },
  memberAvatar: {
    width: 26, height: 26, borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, fontWeight: 700, color: '#070b14',
    fontFamily: "'Space Mono', monospace", flexShrink: 0,
  },
  memberName: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#3d4f6a' },
  memberNameSelf: { color: '#4f9eff' },
  footer: {
    padding: '14px 16px', borderTop: '1px solid #1e2d45',
    display: 'flex', alignItems: 'center', gap: 10,
    flexShrink: 0,
  },
  footerName: { fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: '#e8edf5' },
  footerRoom: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#3d4f6a', marginTop: 1 },
}

const ss = {
  section: { padding: '16px 0 4px' },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', marginBottom: 4,
  },
  sectionLabel: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#3d4f6a', letterSpacing: '0.12em', textTransform: 'uppercase' },
  sectionAction: {
    width: 18, height: 18, background: '#111827',
    border: '1px solid #1e2d45', color: '#7a8ba8',
    fontSize: 14, cursor: 'pointer', borderRadius: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
  },
  roomBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '7px 16px',
    background: 'transparent', border: 'none',
    color: '#7a8ba8', cursor: 'pointer',
    textAlign: 'left', transition: 'all 0.1s',
    fontFamily: "'Syne', sans-serif",
  },
  roomBtnActive: { background: 'rgba(79,158,255,0.08)', color: '#4f9eff' },
  roomIcon: { fontSize: 12, flexShrink: 0, opacity: 0.7 },
  roomName: { fontSize: 13, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  roomCount: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#3d4f6a', background: '#111827', padding: '2px 6px', borderRadius: 10 },
}