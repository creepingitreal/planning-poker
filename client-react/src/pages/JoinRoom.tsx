import * as React from "react";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import socket from "../socket.ts";
import {randomNameGenerator} from "../ts/generators.ts";

export const JoinRoom: React.FC = () => {
    const [roomId, setRoomId] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const joinRoom = ()=> {
        if (!roomId) return alert('Please enter a room id');
        if (!name) return alert('Please enter your name');
        socket.emit('joinRoom', { roomId, user: name });

        navigate(`/room/${roomId}`, { state: {name} })
    };

    const createRoom = () => {
        if (!name) return alert('Please enter your name');
        const id = randomNameGenerator();
        setRoomId(id);

        socket.emit('joinRoom', { roomId: id, user: name });
        navigate(`/room/${id}`, { state: { name } });
    };

    return (
        <section>
            <h1>Join a room</h1>
            <input value={roomId}
                   onChange={e => setRoomId(e.target.value)}
                   placeholder="Room ID/Name"
            />
            <input value={name}
                   onChange={e => setName(e.target.value)}
                   placeholder="Name"
            />
            <button onClick={joinRoom}>Join</button>
            <button onClick={createRoom}>Create Room</button>
        </section>
    )
}