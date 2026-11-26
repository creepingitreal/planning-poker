// Retro Board socket event handlers: cards, reveal, and the shared countdown timer.

import {
  rooms,
  retroBoards,
  retroTimers,
  retroTimerIntervals,
  newRetroBoard,
  newRetroTimer,
  nextCardId,
  nextColumnId,
  stopRetroTimerInterval,
  participantForSocket,
  MAX_TIMER_DURATION,
} from './state.js'

export const ensureRetroState = (roomId) => {
  if (!retroBoards[roomId]) retroBoards[roomId] = newRetroBoard()
  if (!retroTimers[roomId]) retroTimers[roomId] = newRetroTimer()
}

// Cards are private to their author until the board is revealed. Each connected
// socket in the room gets its own filtered view: its own cards are visible
// during drafting, and everyone else's cards are hidden until reveal. After a
// board has been revealed, hiding it masks cards for their authors as well, but
// authors still receive their own text so they can expand, edit, or delete them.
const boardForRecipient = (roomId, recipientSocketId) => {
  const board = retroBoards[roomId]
  if (!board) return null

  const recipient = participantForSocket(roomId, recipientSocketId)
  if (!recipient) return null
  const recipientId = recipient.participantId

  const cards = board.cards.map((card) => {
    const likes = normalizeLikes(card.likes)
    card.likes = likes
    const likeTally = totalLikes(likes)
    const myLikes = likes[recipientId] ?? 0
    const isOwn = card.authorId === recipientId
    const authorColor =
      card.color ?? rooms[roomId]?.[card.authorId]?.color ?? null

    if (board.revealed || (isOwn && !board.hasBeenRevealed)) {
      return {
        id: card.id,
        columnId: card.columnId,
        text: card.text,
        isOwn,
        color: authorColor,
        likes: likeTally,
        myLikes,
      }
    }

    return {
      id: card.id,
      columnId: card.columnId,
      text: isOwn ? card.text : null,
      isOwn,
      hidden: true,
      color: authorColor,
      likes: likeTally,
      myLikes,
    }
  })

  return { columns: board.columns, cards, revealed: board.revealed }
}

// Likes are stored as { participantId: count } so a participant can like a
// card more than once and each person's contribution is tallied.
const normalizeLikes = (likes) => {
  if (likes instanceof Set || Array.isArray(likes)) {
    return Object.fromEntries([...likes].map((id) => [id, 1]))
  }
  if (likes && typeof likes === 'object') return likes
  return {}
}

const totalLikes = (likes) =>
  Object.values(likes).reduce((total, count) => total + count, 0)

export const broadcastBoard = (io, roomId) => {
  if (!retroBoards[roomId]) return

  const socketsInRoom = io.sockets.adapter.rooms.get(roomId)
  if (!socketsInRoom) return

  for (const recipientId of socketsInRoom) {
    io.to(recipientId).emit('updateBoard', {
      board: boardForRecipient(roomId, recipientId),
    })
  }
}

export const broadcastTimer = (io, roomId) => {
  if (!retroTimers[roomId]) return
  io.to(roomId).emit('updateTimer', { timer: retroTimers[roomId] })
}

export const registerRetroHandlers = (io, socket) => {
  socket.on('addCard', ({ roomId, columnId, text }) => {
    const participant = participantForSocket(roomId, socket.id)
    if (!participant) return

    ensureRetroState(roomId)
    const board = retroBoards[roomId]
    const column = board?.columns.find((c) => c.id === columnId)
    if (!column || !text?.trim()) return

    board.cards.push({
      id: nextCardId(),
      columnId,
      text: text.trim(),
      authorId: participant.participantId,
      color: participant.color ?? null,
      likes: {},
    })

    broadcastBoard(io, roomId)
  })

  socket.on('updateColumnTitle', ({ roomId, columnId, title }) => {
    if (!participantForSocket(roomId, socket.id)) return

    const board = retroBoards[roomId]
    const column = board?.columns.find((candidate) => candidate.id === columnId)
    const trimmedTitle = title?.trim()
    if (!column || !trimmedTitle) return

    column.title = trimmedTitle
    broadcastBoard(io, roomId)
  })

  socket.on('addColumn', ({ roomId }) => {
    if (!participantForSocket(roomId, socket.id)) return

    ensureRetroState(roomId)
    const board = retroBoards[roomId]
    board.columns.push({ id: nextColumnId(), title: 'New Board' })
    broadcastBoard(io, roomId)
  })

  const likedCardForParticipant = (roomId, cardId) => {
    const participant = participantForSocket(roomId, socket.id)
    const board = retroBoards[roomId]
    if (!participant || !board?.revealed) return null

    const card = board.cards.find((candidate) => candidate.id === cardId)
    if (!card) return null

    card.likes = normalizeLikes(card.likes)
    return { card, participantId: participant.participantId }
  }

  socket.on('likeCard', ({ roomId, cardId }) => {
    const target = likedCardForParticipant(roomId, cardId)
    if (!target) return

    const { card, participantId } = target
    card.likes[participantId] = (card.likes[participantId] ?? 0) + 1
    broadcastBoard(io, roomId)
  })

  socket.on('unlikeCard', ({ roomId, cardId }) => {
    const target = likedCardForParticipant(roomId, cardId)
    if (!target) return

    const { card, participantId } = target
    const count = card.likes[participantId] ?? 0
    if (count <= 0) return

    if (count === 1) delete card.likes[participantId]
    else card.likes[participantId] = count - 1
    broadcastBoard(io, roomId)
  })

  socket.on('editCard', ({ roomId, cardId, text }) => {
    const board = retroBoards[roomId]
    const participant = participantForSocket(roomId, socket.id)
    const card = board?.cards.find((c) => c.id === cardId)
    if (!card || card.authorId !== participant?.participantId || !text?.trim())
      return

    card.text = text.trim()
    broadcastBoard(io, roomId)
  })

  socket.on('deleteCard', ({ roomId, cardId }) => {
    const board = retroBoards[roomId]
    if (!board) return

    const participant = participantForSocket(roomId, socket.id)
    const card = board.cards.find((c) => c.id === cardId)
    if (!card || card.authorId !== participant?.participantId) return

    board.cards = board.cards.filter((c) => c.id !== cardId)
    broadcastBoard(io, roomId)
  })

  socket.on('revealCards', ({ roomId, visibility }) => {
    const board = retroBoards[roomId]
    if (!board) return

    board.revealed = visibility ?? true
    if (board.revealed) board.hasBeenRevealed = true
    broadcastBoard(io, roomId)
  })

  socket.on('clearBoard', ({ roomId }) => {
    if (!retroBoards[roomId]) return

    retroBoards[roomId] = newRetroBoard()
    broadcastBoard(io, roomId)
  })

  // --- Timer events --- any participant may start/pause/reset the shared timer.

  const tick = (roomId) => {
    const timer = retroTimers[roomId]
    if (!timer) return

    timer.remaining = Math.max(0, timer.remaining - 1)
    broadcastTimer(io, roomId)

    if (timer.remaining === 0) {
      timer.running = false
      stopRetroTimerInterval(roomId)
      broadcastTimer(io, roomId)
    }
  }

  socket.on('startTimer', ({ roomId }) => {
    const timer = retroTimers[roomId]
    if (!timer || timer.running || timer.remaining <= 0) return

    timer.running = true
    stopRetroTimerInterval(roomId)
    retroTimerIntervals[roomId] = setInterval(() => tick(roomId), 1000)

    broadcastTimer(io, roomId)
  })

  socket.on('pauseTimer', ({ roomId }) => {
    const timer = retroTimers[roomId]
    if (!timer) return

    timer.running = false
    stopRetroTimerInterval(roomId)

    broadcastTimer(io, roomId)
  })

  socket.on('resetTimer', ({ roomId, duration }) => {
    const timer = retroTimers[roomId]
    if (!timer) return

    stopRetroTimerInterval(roomId)

    if (
      Number.isInteger(duration) &&
      duration > 0 &&
      duration <= MAX_TIMER_DURATION
    ) {
      timer.duration = duration
    }

    timer.remaining = timer.duration
    timer.running = false

    broadcastTimer(io, roomId)
  })
}

// Called whenever a room becomes empty (no connected participants left) to
// avoid leaking setInterval timers for abandoned rooms.
export const cleanupRetroTimerIfRoomEmpty = (roomId) => {
  const hasConnectedParticipants = Object.values(rooms[roomId] ?? {}).some(
    (participant) => participant.socketId,
  )
  if (!hasConnectedParticipants) {
    stopRetroTimerInterval(roomId)
  }
}
