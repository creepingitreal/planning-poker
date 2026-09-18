// Retro Board socket event handlers: cards, reveal, and the shared countdown timer.

import {
  rooms,
  retroBoards,
  retroTimers,
  retroTimerIntervals,
  newRetroBoard,
  newRetroTimer,
  nextCardId,
  stopRetroTimerInterval,
} from "./state.js";

export const ensureRetroState = (roomId) => {
  if (!retroBoards[roomId]) retroBoards[roomId] = newRetroBoard();
  if (!retroTimers[roomId]) retroTimers[roomId] = newRetroTimer();
};

// Cards are private to their author until the board is revealed. Each connected
// socket in the room gets its own filtered view: its own cards always visible,
// everyone else's cards shown as hidden placeholders (or fully, once revealed).
const boardForRecipient = (roomId, recipientId) => {
  const board = retroBoards[roomId];
  if (!board) return null;

  const cards = board.cards.map((card) => {
    const isOwn = card.authorId === recipientId;
    const authorColor =
      card.color ?? rooms[roomId]?.[card.authorId]?.color ?? null;

    if (board.revealed || isOwn) {
      return {
        id: card.id,
        columnId: card.columnId,
        text: card.text,
        isOwn,
        color: authorColor,
      };
    }

    return {
      id: card.id,
      columnId: card.columnId,
      text: null,
      isOwn: false,
      hidden: true,
      color: authorColor,
    };
  });

  return { columns: board.columns, cards, revealed: board.revealed };
};

export const broadcastBoard = (io, roomId) => {
  if (!retroBoards[roomId]) return;

  const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
  if (!socketsInRoom) return;

  for (const recipientId of socketsInRoom) {
    io.to(recipientId).emit("updateBoard", {
      board: boardForRecipient(roomId, recipientId),
    });
  }
};

export const broadcastTimer = (io, roomId) => {
  if (!retroTimers[roomId]) return;
  io.to(roomId).emit("updateTimer", { timer: retroTimers[roomId] });
};

export const registerRetroHandlers = (io, socket) => {
  socket.on("addCard", ({ roomId, columnId, text }) => {
    if (!rooms[roomId]?.[socket.id]) return;

    ensureRetroState(roomId);
    const board = retroBoards[roomId];
    const column = board?.columns.find((c) => c.id === columnId);
    if (!column || !text?.trim()) return;

    board.cards.push({
      id: nextCardId(),
      columnId,
      text: text.trim(),
      authorId: socket.id,
      color: rooms[roomId]?.[socket.id]?.color ?? null,
    });

    broadcastBoard(io, roomId);
  });

  socket.on("editCard", ({ roomId, cardId, text }) => {
    const board = retroBoards[roomId];
    const card = board?.cards.find((c) => c.id === cardId);
    if (!card || card.authorId !== socket.id || !text?.trim()) return;

    card.text = text.trim();
    broadcastBoard(io, roomId);
  });

  socket.on("deleteCard", ({ roomId, cardId }) => {
    const board = retroBoards[roomId];
    if (!board) return;

    const card = board.cards.find((c) => c.id === cardId);
    if (!card || card.authorId !== socket.id) return;

    board.cards = board.cards.filter((c) => c.id !== cardId);
    broadcastBoard(io, roomId);
  });

  socket.on("revealCards", ({ roomId }) => {
    const board = retroBoards[roomId];
    if (!board) return;

    board.revealed = true;
    broadcastBoard(io, roomId);
  });

  socket.on("clearBoard", ({ roomId }) => {
    if (!retroBoards[roomId]) return;

    retroBoards[roomId] = newRetroBoard();
    broadcastBoard(io, roomId);
  });

  // --- Timer events --- any participant may start/pause/reset the shared timer.

  const tick = (roomId) => {
    const timer = retroTimers[roomId];
    if (!timer) return;

    timer.remaining = Math.max(0, timer.remaining - 1);
    broadcastTimer(io, roomId);

    if (timer.remaining === 0) {
      timer.running = false;
      stopRetroTimerInterval(roomId);
      broadcastTimer(io, roomId);
    }
  };

  socket.on("startTimer", ({ roomId }) => {
    const timer = retroTimers[roomId];
    if (!timer || timer.running || timer.remaining <= 0) return;

    timer.running = true;
    stopRetroTimerInterval(roomId);
    retroTimerIntervals[roomId] = setInterval(() => tick(roomId), 1000);

    broadcastTimer(io, roomId);
  });

  socket.on("pauseTimer", ({ roomId }) => {
    const timer = retroTimers[roomId];
    if (!timer) return;

    timer.running = false;
    stopRetroTimerInterval(roomId);

    broadcastTimer(io, roomId);
  });

  socket.on("resetTimer", ({ roomId, duration }) => {
    const timer = retroTimers[roomId];
    if (!timer) return;

    stopRetroTimerInterval(roomId);

    if (Number.isFinite(duration) && duration > 0) {
      timer.duration = duration;
    }

    timer.remaining = timer.duration;
    timer.running = false;

    broadcastTimer(io, roomId);
  });
};

// Called whenever a room becomes empty (no connected participants left) to
// avoid leaking setInterval timers for abandoned rooms.
export const cleanupRetroTimerIfRoomEmpty = (roomId) => {
  if (!rooms[roomId] || Object.keys(rooms[roomId]).length === 0) {
    stopRetroTimerInterval(roomId);
  }
};
