import * as React from "react";
import socket from "../../socket.ts";

const voteOptions: any[] = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];

const VoteButtons:
    React.FC<{ roomId: string }> = ({ roomId }) => {
    const castVote = (value: number | string) => {
        console.log("VOTED", roomId, value);
        socket.emit('castVote', { roomId, vote: value});
    };

    return (
        <div>
            {voteOptions.map(option => (
                <button key={ String(option) } onClick={() => castVote(option)}>{String(option)}</button>
            )) }
        </div>
    );
};

export default VoteButtons;