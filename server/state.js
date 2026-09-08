// In-memory state shared across the poker and retro socket handlers.
// Everything here lives only for the lifetime of the process (no persistence).

export const rooms = {}; // roomId -> { [socketId]: {user, vote} }
export const roomNames = {}; // roomId -> roomName
export const lockedRooms = new Set(); // roomIds that are invite-only
export const roomHosts = {}; // roomId -> socket.id of current host
export const joinOrder = {}; // roomId -> array of socket ids in join order (oldest first)

export const addParticipant = (roomId, socketId) => {
    if (!joinOrder[roomId]) joinOrder[roomId] = [];
    joinOrder[roomId].push(socketId);
};

// Distinct, readable pastel colours handed out at random to participants so
// their retro cards are visually identifiable. No two participants in the same
// room share a colour; falls back to a random pastel HSL colour once the
// curated palette is exhausted.
const PARTICIPANT_COLORS = [
    '#ffd6d6', '#ffd8bd', '#ffe5b4', '#fff3bf', '#dff3c4',
    '#c7f1e4', '#c8eeee', '#d8e4f0', '#c8e6f5', '#e5d5f8',
];

export const nextParticipantColor = (roomId) => {
    const takenColors = new Set(Object.values(rooms[roomId] ?? {}).map(p => p.color));
    const available = PARTICIPANT_COLORS.filter(c => !takenColors.has(c));

    if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
    }

    let color;
    do {
        const hue = Math.floor(Math.random() * 360);
        color = `hsl(${hue}, 80%, 88%)`;
    } while (takenColors.has(color));

    return color;
};

const DEFAULT_RETRO_COLUMNS = () => ([
    {id: 'went-well', title: 'Went Well'},
    {id: 'to-improve', title: 'To Improve'},
    {id: 'action-items', title: 'Action Items'},
]);

// roomId -> { columns: [{id, title}], cards: [{id, columnId, authorId, text}], revealed: bool }
export const retroBoards = {};

export const DEFAULT_TIMER_DURATION = 5 * 60; // 5 minutes, in seconds

// roomId -> { duration, remaining, running }
export const retroTimers = {};
// roomId -> Node interval handle (kept separate so it isn't serialized/broadcast)
export const retroTimerIntervals = {};

export const newRetroBoard = () => ({columns: DEFAULT_RETRO_COLUMNS(), cards: [], revealed: false});
export const newRetroTimer = () => ({duration: DEFAULT_TIMER_DURATION, remaining: DEFAULT_TIMER_DURATION, running: false});

let cardIdCounter = 0;
export const nextCardId = () => `card-${Date.now()}-${cardIdCounter++}`;

export const stopRetroTimerInterval = (roomId) => {
    if (retroTimerIntervals[roomId]) {
        clearInterval(retroTimerIntervals[roomId]);
        delete retroTimerIntervals[roomId];
    }
};

// Called once a room has no connected participants left, to avoid leaking
// timer intervals and unbounded state growth for abandoned rooms.
export const cleanupRoom = (roomId) => {
    stopRetroTimerInterval(roomId);
    delete rooms[roomId];
    delete roomNames[roomId];
    delete roomHosts[roomId];
    delete joinOrder[roomId];
    delete retroBoards[roomId];
    delete retroTimers[roomId];
    lockedRooms.delete(roomId);
};
