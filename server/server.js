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
        io.to(roomId).emit('updateRoom', { players: rooms[roomId], shareUrl });
    };

    socket.onAny((event, payload) => {
        // console.log('Received event:', event, payload); // 👈 uncomment/add this
        console.log('locked rooms: ',lockedRooms);
    });

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

        broadcastRoom(room.roomId);
    });

    socket.on('joinRoom', ({ room, user, fromLink = false }) => {
        if (!rooms[room.roomId]) {
            socket.emit('roomError', { message: 'Room not found.' });
            return;
        }

        if (lockedRooms.has(room.roomId) && !fromLink) {
            socket.emit('roomError', { message: 'This room is invite-only.' });
            return;
        }

        socket.join(room.roomId);

        rooms[room.roomId][socket.id] = { user, vote: null };

        broadcastRoom(room.roomId);
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