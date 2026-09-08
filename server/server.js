import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}));


app.get('/', (req, res) => {
    res.status(200).send('Planning Poker backend is running');
});

app.get('/health', (req, res) => {
    res.sendStatus(200);
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

const rooms = {};
const roomNames = {};
const lockedRooms = new Set();
const roomHosts = {}; // roomId -> socket.id of current host
const joinOrder = {}; // roomId -> array of socket ids in join order (oldest first)

const DEFAULT_RETRO_COLUMNS = () => ([
    {id: 'went-well', title: 'Went Well', cards: []},
    {id: 'to-improve', title: 'To Improve', cards: []},
    {id: 'action-items', title: 'Action Items', cards: []},
]);

const retroBoards = {}; // roomId -> { columns: [...] }

let cardIdCounter = 0;
const nextCardId = () => `card-${Date.now()}-${cardIdCounter++}`;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    const broadcastRoom = (roomId) => {
        const shareUrl = `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173'}/room/${roomId}`;
        io.to(roomId).emit('updateRoom', {
            players: rooms[roomId],
            shareUrl,
            roomName: roomNames[roomId],
            hostId: roomHosts[roomId],
        });
    };

    const broadcastBoard = (roomId) => {
        if (!retroBoards[roomId]) return;
        io.to(roomId).emit('updateBoard', {board: retroBoards[roomId]});
    };

    const addParticipant = (roomId, socketId) => {
        if (!joinOrder[roomId]) joinOrder[roomId] = [];
        joinOrder[roomId].push(socketId);
    };

    socket.on('createRoom', ({room, user}) => {
        if (rooms[room.roomId]) {
            socket.emit('roomError', {message: `Room "${room.roomName}" already exists.`});
            return;
        }

        rooms[room.roomId] = {};
        roomNames[room.roomId] = room.roomName;
        roomHosts[room.roomId] = socket.id;
        joinOrder[room.roomId] = [];
        retroBoards[room.roomId] = {columns: DEFAULT_RETRO_COLUMNS()};

        if (room.locked) {
            lockedRooms.add(room.roomId);
        }

        rooms[room.roomId][socket.id] = {user, vote: null};
        addParticipant(room.roomId, socket.id);

        socket.join(room.roomId);

        socket.emit('roomJoined', {roomId: room.roomId, roomName: room.roomName});

        broadcastRoom(room.roomId);
        broadcastBoard(room.roomId);
    });

    socket.on('getRoomName', (roomId) => {
        const roomName = roomNames[roomId];
        if (roomName) {
            socket.emit('roomNameResolved', {roomName});
        } else {
            socket.emit('roomNameResolved', {error: 'Room not found'});
        }
    });

    socket.on('joinRoom', ({room, user, fromLink = false}) => {
        let roomId = room.roomId;

        if (!roomId && room.roomName) {
            roomId = roomNames[room.roomName];
            if (!roomId) {
                socket.emit('roomError', {message: 'Room not found.'});
                return;
            }
        }

        if (!rooms[roomId]) {
            socket.emit('roomError', {message: 'Room not found.'});
            return;
        }

        if (lockedRooms.has(roomId) && !fromLink) {
            socket.emit('roomError', {message: 'This room is invite-only.'});
            return;
        }

        socket.join(roomId);
        rooms[roomId][socket.id] = {user, vote: null};
        addParticipant(roomId, socket.id);

        socket.emit('roomJoined', {roomId, roomName: roomNames[roomId] ?? roomId});

        broadcastRoom(roomId);
        broadcastBoard(roomId);
    });

    socket.on('castVote', ({roomId, vote}) => {
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

    socket.on('clearVotes', ({roomId}) => {
        Object.keys(rooms[roomId]).forEach(user => {
            rooms[roomId][user].vote = null;
        })

        broadcastRoom(roomId)

        io.to(roomId).emit('toggleVisibility', false);
    });

    // --- Retro board events ---

    const isHost = (roomId) => roomHosts[roomId] === socket.id;

    socket.on('addCard', ({roomId, columnId, text}) => {
        const board = retroBoards[roomId];
        const column = board?.columns.find(c => c.id === columnId);
        if (!column || !text?.trim()) return;

        column.cards.push({
            id: nextCardId(),
            text: text.trim(),
            authorId: socket.id,
            authorName: rooms[roomId]?.[socket.id]?.user ?? 'Unknown',
        });

        broadcastBoard(roomId);
    });

    socket.on('editCard', ({roomId, columnId, cardId, text}) => {
        const board = retroBoards[roomId];
        const column = board?.columns.find(c => c.id === columnId);
        const card = column?.cards.find(c => c.id === cardId);
        if (!card || !text?.trim()) return;

        card.text = text.trim();
        broadcastBoard(roomId);
    });

    socket.on('deleteCard', ({roomId, columnId, cardId}) => {
        const board = retroBoards[roomId];
        const column = board?.columns.find(c => c.id === columnId);
        if (!column) return;

        column.cards = column.cards.filter(c => c.id !== cardId);
        broadcastBoard(roomId);
    });

    socket.on('moveCard', ({roomId, cardId, fromColumnId, toColumnId, toIndex}) => {
        const board = retroBoards[roomId];
        if (!board) return;

        const fromColumn = board.columns.find(c => c.id === fromColumnId);
        const toColumn = board.columns.find(c => c.id === toColumnId);
        if (!fromColumn || !toColumn) return;

        const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        const [card] = fromColumn.cards.splice(cardIndex, 1);
        const insertAt = Math.max(0, Math.min(toIndex ?? toColumn.cards.length, toColumn.cards.length));
        toColumn.cards.splice(insertAt, 0, card);

        broadcastBoard(roomId);
    });

    socket.on('clearBoard', ({roomId}) => {
        if (!retroBoards[roomId]) return;

        if (!isHost(roomId)) {
            socket.emit('roomError', {message: 'Only the host can clear the board.'});
            return;
        }

        retroBoards[roomId] = {columns: DEFAULT_RETRO_COLUMNS()};
        broadcastBoard(roomId);
    });

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            if (rooms[roomId][socket.id]) {
                delete rooms[roomId][socket.id];

                if (joinOrder[roomId]) {
                    joinOrder[roomId] = joinOrder[roomId].filter(id => id !== socket.id);
                }

                // Host handover: transfer to the longest-connected remaining participant.
                if (roomHosts[roomId] === socket.id) {
                    const nextHost = joinOrder[roomId]?.find(id => rooms[roomId][id]);
                    roomHosts[roomId] = nextHost ?? null;
                }

                broadcastRoom(roomId)
            }
        }
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

const PORT = process.env.PORT ?? 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});