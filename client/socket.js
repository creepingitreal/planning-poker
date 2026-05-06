import io from 'socket.io-client';

const isLocalHost = ['localhost', '127.0.0.1'].includes(globalThis.location.hostname);
const fallbackUrl = isLocalHost ? 'http://localhost:8000' : globalThis.location.origin;

const socket = io(import.meta.env.VITE_SERVER_URL ?? fallbackUrl);

export default socket;