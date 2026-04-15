import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

const rooms = {};
const roomNames = {};
const lockedRooms = new Set();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    const broadcastRoom = (roomId) => {
        const shareUrl = `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173'}/room/${roomId}`;
        io.to(roomId).emit('updateRoom', {
            players: rooms[roomId],
            shareUrl,
            roomName: roomNames[roomId]
        });
    };

    socket.on('createRoom', ({ room, user }) => {
        if (rooms[room.roomId]) {
            socket.emit('roomError', { message: `Room "${room.roomName}" already exists.` });
            return;
        }

        rooms[room.roomId] = {};
        roomNames[room.roomId] = room.roomName;

        if (room.locked) {
            lockedRooms.add(room.roomId);
        }

        rooms[room.roomId][socket.id] = { user, vote: null };

        socket.join(room.roomId);

        socket.emit('roomJoined', { roomId: room.roomId, roomName: room.roomName });

        broadcastRoom(room.roomId);
    });

    socket.on('getRoomName', (roomId) => {
        const roomName = roomNames[roomId];
        if (roomName) {
            socket.emit('roomNameResolved', { roomName });
        } else {
            socket.emit('roomNameResolved', { error: 'Room not found' });
        }
    });

    socket.on('joinRoom', ({ room, user, fromLink = false }) => {
        let roomId = room.roomId;

        if (!roomId && room.roomName) {
            roomId = roomNames[room.roomName];
            if (!roomId) {
                socket.emit('roomError', { message: 'Room not found.' });
                return;
            }
        }

        if (!rooms[roomId]) {
            socket.emit('roomError', { message: 'Room not found.' });
            return;
        }

        if (lockedRooms.has(roomId) && !fromLink) {
            socket.emit('roomError', { message: 'This room is invite-only.' });
            return;
        }

        socket.join(roomId);
        rooms[roomId][socket.id] = { user, vote: null };

        socket.emit('roomJoined', { roomId, roomName: roomNames[roomId] ?? roomId });

        broadcastRoom(roomId);
    });

    socket.on('castVote', ({ roomId, vote }) => {
        if (rooms[roomId]?.[socket.id]) {
            rooms[roomId][socket.id].vote = vote;
        }

        broadcastRoom(roomId)
    });

    socket.on('revealVotes', ({roomId, visibility}) => {
        if (rooms[roomId]) {
            io.to(roomId).emit('toggleVisibility', visibility)
        }
    });

    socket.on('clearVotes', ({ roomId }) => {
        Object.keys(rooms[roomId]).forEach(user =>{
          rooms[roomId][user].vote = null;
        })

        broadcastRoom(roomId)

        io.to(roomId).emit('toggleVisibility',  false);
    });

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            if (rooms[roomId][socket.id]) {
                delete rooms[roomId][socket.id];
                broadcastRoom(roomId)
            }
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

server.listen(8000, () => {
    console.log('Server is running on port 8000');
});