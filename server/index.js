// server/index.js (converted to ES Module syntax)
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
    

    socket.on('revealVotes', (roomId) => {
        io.to(roomId).emit('revealVotes');
    });

    socket.on('resetVotes', (roomId) => {
        console.log(rooms[roomId]);

        Object.keys(rooms[roomId] || {}).forEach((user) => {
            rooms[roomId][user].vote = null;
        });
        console.log('Votes reset for room:', roomId);
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
});

server.listen(8000, () => {
    console.log('Server is running on port 8000');
});
