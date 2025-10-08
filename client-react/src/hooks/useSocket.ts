import {useEffect} from "react";
import socket from "../socket.ts";

export function useSocket() {
    useEffect(() => {
        const onConnect = () =>
            console.log('socket connected', socket.id);
        socket.on('connect', onConnect);

        return () => {
            socket.off('connect', onConnect);
        };
    }, []);

    return socket;
}