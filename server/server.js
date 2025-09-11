import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5174',
        methods: ['GET', 'POST'],
    },
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.onAny((event, payload) => {
        console.log('Received event', event, 'with payload', payload)
    });

    socket.on('joinRoom', ({ roomId, user }) => {
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = {};

        rooms[roomId][socket.id] = { user, vote: null };

        io.to(roomId).emit('updateRoom', rooms[roomId]);
        console.log('📢 Room joined, roomUpdate:', rooms[roomId])
    });

    socket.on('castVote', ({ roomId, vote }) => {
        if (rooms[roomId] && rooms[roomId][socket.id]) {
            rooms[roomId][socket.id].vote = vote;
            console.log('Vote updated', rooms[roomId][socket.id]);
        }
        io.to(roomId).emit('updateRoom', rooms[roomId]);
        console.log('📢 Vote cast, roomUpdate:', rooms[roomId]);
    });

    socket.on('revealVotes', ({roomId, visibility}) => {
        console.log('hit');
        if (rooms[roomId]) {
            io.to(roomId).emit('toggleVisibility', visibility)
            console.log('visibility updated', rooms[roomId][socket.id]);
        }
    });

    socket.on('clearVotes', ({ roomId }) => {
        console.log('Clear')
        if (rooms[roomId]) {
            Object.keys(rooms[roomId][socket.id]).forEach(user => {
                rooms[roomId][user].vote = null;
            })
        }
        io.to(roomId).emit('updateRoom', rooms[roomId]);
        io.to(roomId).emit('toggleVisibility',  false);
        console.log('Votes reset for room:', roomId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomId in rooms) {
            if (rooms[roomId][socket.id]) {
                delete rooms[roomId][socket.id];
                io.to(roomId).emit('updateRoom', rooms[roomId]);
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