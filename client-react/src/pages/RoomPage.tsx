import {useLocation, useParams} from "react-router-dom";
import {useRoom} from "../hooks/useRoom.ts";
import * as React from "react";
import GameBoard from "./components/GameBoard.tsx";
import VoteButtons from "./components/VoteButtons.tsx";

const RoomPage: React.FC = () => {
    const { roomId } useParams();
    const { location } = useLocation();
    const { name } = (location.state as any)?.name ?? 'Unknown';
    const { players } = useRoom();
    return (
        <div className="section-title">
            <h1>Room Name: </h1>
            <h1><strong>{ roomId }</strong></h1>
            <br />
            <h2>Welcome, { name }</h2>
            <GameBoard players={ players } />
            <VoteButtons roomId={ roomId } />
        </div>
    );
};

export default RoomPage;