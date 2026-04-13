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

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.onAny((event, payload) => {
        console.log('Received event', event, 'with payload', payload)
    });

    const broadcastRoom = (roomId) => {
        const shareUrl = `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173'}/room/${roomId}`;
        io.to(roomId).emit('updateRoom', { players: rooms[roomId], shareUrl });
    };

    socket.on('joinRoom', ({ room, user }) => {
        socket.join(room.roomId);

        if (!rooms[room.roomId]) rooms[room.roomId] = {};

        rooms[room.roomId][socket.id] = { user, vote: null };

        broadcastRoom(room.roomId)
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