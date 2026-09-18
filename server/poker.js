// Planning Poker socket event handlers.

import {
  rooms,
  roomNames,
  lockedRooms,
  roomHosts,
  joinOrder,
  addParticipant,
  newParticipant,
} from "./state.js";
import { nextParticipantColor } from "./colorAllocation.js";

const ensureParticipantColors = (roomId) => {
  for (const participant of Object.values(rooms[roomId] ?? {})) {
    if (!participant.color) {
      participant.color = nextParticipantColor(rooms, roomId);
    }
  }
};

export const broadcastRoom = (io, roomId) => {
  const shareUrl = `${process.env.PUBLIC_BASE_URL ?? "http://localhost:5173"}/room/${roomId}`;
  ensureParticipantColors(roomId);
  io.to(roomId).emit("updateRoom", {
    players: rooms[roomId],
    shareUrl,
    roomName: roomNames[roomId],
    hostId: roomHosts[roomId],
  });
};

export const registerPokerHandlers = (
  io,
  socket,
  { onRoomCreated, onRoomJoined } = {},
) => {
  socket.on("createRoom", ({ room, user } = {}) => {
    if (!room?.roomId || !room?.roomName || !user?.trim()) {
      socket.emit("roomError", {
        message: "Room name and username are required.",
      });
      return;
    }

    if (rooms[room.roomId]) {
      socket.emit("roomError", {
        message: `Room "${room.roomName}" already exists.`,
      });
      return;
    }

    rooms[room.roomId] = {};
    roomNames[room.roomId] = room.roomName;
    roomHosts[room.roomId] = socket.id;
    joinOrder[room.roomId] = [];

    if (room.locked) {
      lockedRooms.add(room.roomId);
    }

    rooms[room.roomId][socket.id] = newParticipant(
      user,
      nextParticipantColor(rooms, room.roomId),
    );
    addParticipant(room.roomId, socket.id);
    ensureParticipantColors(room.roomId);

    socket.join(room.roomId);

    socket.emit("roomJoined", { roomId: room.roomId, roomName: room.roomName });

    onRoomCreated?.(room.roomId);

    broadcastRoom(io, room.roomId);
  });

  socket.on("getRoomName", (roomId) => {
    const roomName = roomNames[roomId];
    if (roomName) {
      socket.emit("roomNameResolved", { roomName });
    } else {
      socket.emit("roomNameResolved", { error: "Room not found" });
    }
  });

  socket.on("joinRoom", ({ room, user, fromLink = false }) => {
    let roomId = room.roomId;

    if (!roomId && room.roomName) {
      roomId = roomNames[room.roomName];
      if (!roomId) {
        socket.emit("roomError", { message: "Room not found." });
        return;
      }
    }

    if (!rooms[roomId]) {
      socket.emit("roomError", { message: "Room not found." });
      return;
    }

    if (lockedRooms.has(roomId) && !fromLink) {
      socket.emit("roomError", { message: "This room is invite-only." });
      return;
    }

    socket.join(roomId);
    rooms[roomId][socket.id] = newParticipant(
      user,
      nextParticipantColor(rooms, roomId),
    );
    addParticipant(roomId, socket.id);
    ensureParticipantColors(roomId);

    socket.emit("roomJoined", {
      roomId,
      roomName: roomNames[roomId] ?? roomId,
    });

    onRoomJoined?.(roomId);

    broadcastRoom(io, roomId);
  });

  socket.on("castVote", ({ roomId, vote }) => {
    if (rooms[roomId]?.[socket.id]) {
      rooms[roomId][socket.id].vote = vote;
    }

    broadcastRoom(io, roomId);
  });

  socket.on("revealVotes", ({ roomId, visibility }) => {
    if (rooms[roomId]) {
      io.to(roomId).emit("toggleVisibility", visibility);
    }
  });

  socket.on("clearVotes", ({ roomId }) => {
    Object.keys(rooms[roomId]).forEach((user) => {
      rooms[roomId][user].vote = null;
    });

    broadcastRoom(io, roomId);

    io.to(roomId).emit("toggleVisibility", false);
    io.to(roomId).emit("clearVotes");
  });
};

// Handles disconnect cleanup shared by the whole room (not poker-specific data
// only), since host handover affects both tools.
export const registerDisconnectHandler = (
  io,
  socket,
  { onParticipantLeft } = {},
) => {
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        delete rooms[roomId][socket.id];

        if (joinOrder[roomId]) {
          joinOrder[roomId] = joinOrder[roomId].filter(
            (id) => id !== socket.id,
          );
        }

        // Host handover: transfer to the longest-connected remaining participant.
        if (roomHosts[roomId] === socket.id) {
          const nextHost = joinOrder[roomId]?.find((id) => rooms[roomId][id]);
          roomHosts[roomId] = nextHost ?? null;
        }

        broadcastRoom(io, roomId);

        onParticipantLeft?.(roomId);
      }
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
};
