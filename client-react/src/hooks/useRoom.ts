import {useEffect, useState} from "react";
import type {PlayersMap} from "../types.ts";
import socket from "../socket.ts";

export function useRoom() {
    const [players, setPlayers] = useState<PlayersMap>({});

    useEffect(() => {
        const handleUpdate = (data: PlayersMap) => {
            setPlayers(data);
        } ;

        socket.on('updateRoom', handleUpdate);
        return () => {
            socket.off('updateRoom', handleUpdate);
        };
    }, []);
    return {players, setPlayers, socket};
}