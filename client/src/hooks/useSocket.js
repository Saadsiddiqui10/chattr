import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [roomUsers, setRoomUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  // DM state: dmId -> { messages[], typingUsers[] }
  const [dmThreads, setDmThreads] = useState({})
  const [dmTyping, setDmTyping] = useState({}) // username -> bool

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('history', msgs => setMessages(msgs))
    socket.on('message', msg => setMessages(prev => [...prev, msg]))
    socket.on('room_users', users => setRoomUsers(users))
    socket.on('rooms_update', r => setRooms(r))
    socket.on('online_users', users => setOnlineUsers(users))

    socket.on('user_typing', ({ username, isTyping }) => {
      setTypingUsers(prev =>
        isTyping ? (prev.includes(username) ? prev : [...prev, username])
                 : prev.filter(u => u !== username)
      )
    })

    socket.on('dm_message', msg => {
      setDmThreads(prev => {
        const thread = prev[msg.dmId] || []
        return { ...prev, [msg.dmId]: [...thread, msg] }
      })
    })

    socket.on('dm_user_typing', ({ username, isTyping }) => {
      setDmTyping(prev => ({ ...prev, [username]: isTyping }))
    })

    return () => socket.disconnect()
  }, [])

  const join = useCallback((username, room = 'general') => {
    socketRef.current?.emit('join', { username, room })
  }, [])

  const sendMessage = useCallback((content, type = 'text') => {
    socketRef.current?.emit('send_message', { content, type })
  }, [])

  const sendFile = useCallback((fileInfo) => {
    socketRef.current?.emit('send_file', fileInfo)
  }, [])

  const switchRoom = useCallback((room, password) => {
    return new Promise((resolve) => {
      setMessages([])
      socketRef.current?.emit('switch_room', { room, password }, resolve)
    })
  }, [])

  const createRoom = useCallback((roomData) => {
    return new Promise((resolve) => {
      socketRef.current?.emit('create_room', roomData, resolve)
    })
  }, [])

  const setTyping = useCallback((isTyping) => {
    socketRef.current?.emit('typing', { isTyping })
  }, [])

  const sendDm = useCallback((toUsername, content, type = 'text') => {
    return new Promise((resolve) => {
      socketRef.current?.emit('send_dm', { toUsername, content, type }, resolve)
    })
  }, [])

  const sendDmFile = useCallback((toUsername, fileInfo) => {
    return new Promise((resolve) => {
      socketRef.current?.emit('send_dm_file', { toUsername, ...fileInfo }, resolve)
    })
  }, [])

  const getDmHistory = useCallback((withUsername) => {
    return new Promise((resolve) => {
      socketRef.current?.emit('get_dm_history', { withUsername }, (msgs) => {
        const dmId = [socketRef.current?.id, withUsername].sort().join(':')
        // Store by participant name pattern since we know both sides
        resolve(msgs)
      })
    })
  }, [])

  const setDmTypingIndicator = useCallback((toUsername, isTyping) => {
    socketRef.current?.emit('dm_typing', { toUsername, isTyping })
  }, [])

  const getSocket = useCallback(() => socketRef.current, [])

  return {
    connected, messages, roomUsers, rooms, typingUsers,
    onlineUsers, dmThreads, dmTyping,
    join, sendMessage, sendFile, switchRoom, createRoom,
    setTyping, sendDm, sendDmFile, getDmHistory,
    setDmTypingIndicator, getSocket,
  }
}
