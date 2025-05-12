const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8000',
        methods: ['GET', 'POST'],
    },
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId][socket.id] = { user, vote: null };
        io.to(roomId).emit('updateRoom', rooms[roomId]);
    });

    socket.on('castVote', ({ roomId, vote }) => {
        if (rooms[roomId] && rooms[roomId][socket.id]) {
            rooms[roomId][socket.id].vote = vote;
            io.to(roomId).emit('updateRoom', rooms[roomId]);
        }
    });

    socket.on('revealVotes', (roomId) => {
        io.to(roomId).emit('revealVotes');
    });

    socket.on('resetVotes', (roomId) => {
        Object.keys(rooms[roomId] || {}).forEach((userId) => {
            rooms[roomId][userId].vote = null;
        });
        io.to(roomId).emit('updateRoom', rooms[roomId]);
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

    io.listen(8000, () => {
        console.log('Server is running on port 8000');
    });
});