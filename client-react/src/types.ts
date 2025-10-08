export interface Player {
    user: string;
    vote: string | number | null;
}

export type PlayersMap = Record<string, Player>;