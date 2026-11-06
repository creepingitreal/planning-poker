// Planning Poker socket event handlers.

import {
  rooms,
  roomNames,
  lockedRooms,
  roomHosts,
  joinOrder,
  addParticipant,
  newParticipant,
  participantForSocket,
} from './state.js'
import { nextParticipantColor } from './colorAllocation.js'

const ensureParticipantColors = (roomId) => {
  for (const participant of Object.values(rooms[roomId] ?? {})) {
    if (!participant.color) {
      participant.color = nextParticipantColor(rooms, roomId)
    }
  }
}

export const broadcastRoom = (io, roomId) => {
  const shareUrl = `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173'}/room/${roomId}`
  ensureParticipantColors(roomId)
  const players = Object.values(rooms[roomId] ?? {})
    .filter((participant) => participant.socketId)
    .reduce((result, participant) => {
      result[participant.socketId] = participant
      return result
    }, {})
  const host = rooms[roomId]?.[roomHosts[roomId]]
  io.to(roomId).emit('updateRoom', {
    players,
    shareUrl,
    roomName: roomNames[roomId],
    hostId: host?.socketId ?? null,
  })
}

export const registerPokerHandlers = (
  io,
  socket,
  { onRoomCreated, onRoomJoined } = {},
) => {
  socket.on('createRoom', ({ room, user, clientId } = {}) => {
    if (!room?.roomId || !room?.roomName || !user?.trim()) {
      socket.emit('roomError', {
        message: 'Room name and username are required.',
      })
      return
    }

    if (rooms[room.roomId]) {
      socket.emit('roomError', {
        message: `Room "${room.roomName}" already exists.`,
      })
      return
    }

    const participantId = clientId || socket.id

    rooms[room.roomId] = {}
    roomNames[room.roomId] = room.roomName
    roomHosts[room.roomId] = participantId
    joinOrder[room.roomId] = []

    if (room.locked) {
      lockedRooms.add(room.roomId)
    }

    rooms[room.roomId][participantId] = newParticipant({
      participantId,
      user,
      color: nextParticipantColor(rooms, room.roomId),
      socketId: socket.id,
    })
    addParticipant(room.roomId, participantId)
    ensureParticipantColors(room.roomId)

    socket.join(room.roomId)

    socket.emit('roomJoined', { roomId: room.roomId, roomName: room.roomName })

    onRoomCreated?.(room.roomId)

    broadcastRoom(io, room.roomId)
  })

  socket.on('getRoomName', (roomId) => {
    const roomName = roomNames[roomId]
    if (roomName) {
      socket.emit('roomNameResolved', { roomName })
    } else {
      socket.emit('roomNameResolved', { error: 'Room not found' })
    }
  })

  socket.on('joinRoom', ({ room, user, clientId, fromLink = false }) => {
    let roomId = room.roomId

    if (!roomId && room.roomName) {
      roomId = roomNames[room.roomName]
      if (!roomId) {
        socket.emit('roomError', { message: 'Room not found.' })
        return
      }
    }

    if (!rooms[roomId]) {
      socket.emit('roomError', { message: 'Room not found.' })
      return
    }

    if (lockedRooms.has(roomId) && !fromLink) {
      socket.emit('roomError', { message: 'This room is invite-only.' })
      return
    }

    const participantId = clientId || socket.id

    socket.join(roomId)
    const participant = rooms[roomId][participantId]
    if (participant) {
      participant.socketId = socket.id
    } else {
      rooms[roomId][participantId] = newParticipant({
        participantId,
        user,
        color: nextParticipantColor(rooms, roomId),
        socketId: socket.id,
      })
      addParticipant(roomId, participantId)
    }
    ensureParticipantColors(roomId)

    socket.emit('roomJoined', {
      roomId,
      roomName: roomNames[roomId] ?? roomId,
    })

    onRoomJoined?.(roomId)

    broadcastRoom(io, roomId)
  })

  socket.on('castVote', ({ roomId, vote }) => {
    const participant = participantForSocket(roomId, socket.id)
    if (participant) {
      participant.vote = vote
    }

    broadcastRoom(io, roomId)
  })

  socket.on('revealVotes', ({ roomId, visibility }) => {
    if (rooms[roomId]) {
      io.to(roomId).emit('toggleVisibility', visibility)
    }
  })

  socket.on('clearVotes', ({ roomId }) => {
    Object.values(rooms[roomId] ?? {}).forEach((participant) => {
      participant.vote = null
    })

    broadcastRoom(io, roomId)

    io.to(roomId).emit('toggleVisibility', false)
    io.to(roomId).emit('clearVotes')
  })
}

// Handles disconnect cleanup shared by the whole room (not poker-specific data
// only), since host handover affects both tools.
export const registerDisconnectHandler = (
  io,
  socket,
  { onParticipantLeft } = {},
) => {
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const participant = participantForSocket(roomId, socket.id)
      if (participant) {
        participant.socketId = null

        // Host handover: transfer to the longest-connected remaining participant.
        if (roomHosts[roomId] === participant.participantId) {
          const nextHost = joinOrder[roomId]?.find(
            (id) => rooms[roomId][id]?.socketId,
          )
          roomHosts[roomId] = nextHost ?? null
        }

        broadcastRoom(io, roomId)

        onParticipantLeft?.(roomId)
      }
    }
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })
}
