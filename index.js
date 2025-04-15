const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const redis = require('redis');

const app = express;
const server = http.createServer(app);
const io = new Server(server);
const redisClient = redis.createClient();

app.get('/', (req, res) => {
    res.send('Server is running')
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('a user disconnected')
    });
});

server.listen(5000, () => {
    console.log('Server started on port 5000')
});
