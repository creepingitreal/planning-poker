import io from 'socket.io-client';

const socket = io(
    import.meta.env.VITE_SERVER_URL ?? globalThis.location.origin
);

export default socket;