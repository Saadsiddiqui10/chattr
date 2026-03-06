export default function Sidebar({ rooms, currentRoom, onSwitchRoom, users, username, onCreateRoom, onlineUsers, onOpenDm, activeDmUser }) {
  const publicRooms = rooms.filter(r => !r.isPrivate)
  const privateRooms = rooms.filter(r => r.isPrivate)
  const otherUsers = onlineUsers.filter(u => u.username !== username)

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoAccent}>///</span>CHATTR
      </div>

      {/* Public Rooms */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>ROOMS</span>
          <button style={styles.addBtn} onClick={onCreateRoom} title="Create room">+</button>
        </div>
        {publicRooms.map(room => (
          <RoomButton key={room.name} room={room} active={currentRoom === room.name && !activeDmUser} onClick={() => onSwitchRoom(room)} />
        ))}
      </div>

      {/* Private Rooms */}
      {privateRooms.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionLabel}>PRIVATE</span>
          </div>
          {privateRooms.map(room => (
            <RoomButton key={room.name} room={room} active={currentRoom === room.name && !activeDmUser} onClick={() => onSwitchRoom(room)} />
          ))}
        </div>
      )}

      {/* Direct Messages */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>DIRECT MESSAGES</span>
        </div>
        {otherUsers.length === 0 && (
          <div style={styles.noUsers}>No other users online</div>
        )}
        {otherUsers.map(user => (
          <button
            key={user.username}
            style={{ ...styles.dmBtn, ...(activeDmUser === user.username ? styles.dmBtnActive : {}) }}
            onClick={() => onOpenDm(user)}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ ...styles.dmAvatar, background: user.avatar?.color || '#333' }}>
                {user.avatar?.initials}
              </div>
              <div style={styles.onlineDot} />
            </div>
            <span style={styles.dmUsername}>{user.username}</span>
          </button>
        ))}
      </div>

      {/* Current User */}
      <div style={styles.footer}>
        <div style={styles.footerUser}>
          <div style={styles.footerDot} />
          <span style={styles.footerUsername}>{username}</span>
        </div>
        <div style={styles.footerRoom}>in #{currentRoom}</div>
      </div>
    </div>
  )
}

function RoomButton({ room, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ ...styles.roomBtn, ...(active ? styles.roomBtnActive : {}) }}
    >
      <span style={styles.roomHash}>{room.isPrivate ? '🔒' : '#'}</span>
      <span style={styles.roomName}>{room.name}</span>
      {room.userCount > 0 && (
        <span style={styles.roomCount}>{room.userCount}</span>
      )}
    </button>
  )
}

const styles = {
  sidebar: {
    width: 230,
    background: '#0d0d0d',
    borderRight: '1px solid #1a1a1a',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0, overflow: 'hidden',
  },
  logo: {
    padding: '24px 20px 20px',
    fontFamily: "'Syne', sans-serif",
    fontSize: 18, fontWeight: 800,
    letterSpacing: '-0.01em', color: '#f0f0f0',
    borderBottom: '1px solid #1a1a1a',
    flexShrink: 0,
  },
  logoAccent: { color: '#00ff88' },
  section: { padding: '16px 12px 4px', overflowY: 'auto' },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 8px', marginBottom: 6,
  },
  sectionLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, color: '#444', letterSpacing: '0.15em',
  },
  addBtn: {
    background: 'transparent', border: '1px solid #2a2a2a',
    color: '#555', width: 18, height: 18,
    fontSize: 14, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 3, lineHeight: 1,
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  roomBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    width: '100%', padding: '7px 8px',
    background: 'transparent', border: 'none',
    color: '#555', cursor: 'pointer',
    borderRadius: 4, textAlign: 'left',
    transition: 'all 0.15s',
    fontFamily: "'Syne', sans-serif",
  },
  roomBtnActive: { background: 'rgba(0,255,136,0.08)', color: '#00ff88' },
  roomHash: { fontSize: 12, opacity: 0.8, flexShrink: 0 },
  roomName: { fontSize: 13, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  roomCount: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, color: '#444', background: '#1a1a1a',
    padding: '1px 5px', borderRadius: 8,
  },
  noUsers: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, color: '#333',
    padding: '4px 8px', letterSpacing: '0.05em',
  },
  dmBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '6px 8px',
    background: 'transparent', border: 'none',
    color: '#555', cursor: 'pointer',
    borderRadius: 4, textAlign: 'left',
    transition: 'all 0.15s',
  },
  dmBtnActive: { background: 'rgba(0,136,255,0.08)', color: '#0088ff' },
  dmAvatar: {
    width: 26, height: 26, borderRadius: 3,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, fontWeight: 700, color: '#0a0a0a',
    fontFamily: "'Space Mono', monospace",
    flexShrink: 0,
  },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 7, height: 7,
    background: '#00ff88', borderRadius: '50%',
    border: '1.5px solid #0d0d0d',
  },
  dmUsername: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  footer: {
    marginTop: 'auto', padding: '14px 20px',
    borderTop: '1px solid #1a1a1a', flexShrink: 0,
  },
  footerUser: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 },
  footerDot: { width: 7, height: 7, background: '#00ff88', borderRadius: '50%', flexShrink: 0 },
  footerUsername: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12, color: '#666',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  footerRoom: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, color: '#333', letterSpacing: '0.05em', paddingLeft: 15,
  },
}
