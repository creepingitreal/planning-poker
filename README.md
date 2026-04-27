# Planning Poker

A real-time planning poker application for agile teams to estimate work collaboratively. Built with Vue 3 on the frontend and a Node.js/Socket.IO server on the backend.

---

## Features

- **Create or join rooms** – Create a named room or join an existing one by room name.
- **Invite-only rooms** – Lock a room so that only users with the share link can join.
- **Share link** – Copy a direct invite link to your clipboard and send it to teammates.
- **Real-time voting** – All connected players see votes update live via WebSockets.
- **Fibonacci voting scale** – Vote with standard story-point values: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, or ?.
- **Reveal / hide votes** – Reveal all votes simultaneously to avoid anchoring bias, then hide them again.
- **Clear votes** – Reset all votes to begin a new round.
- **Jira integration** – Pass a Jira issue key via the \`?issue=\` query parameter and it will be displayed in the room.
- **Session persistence** – Your session is saved for 24 hours so you can rejoin a room after a page refresh.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (Composition API), Vite |
| Real-time | Socket.IO (client & server) |
| Backend | Node.js, Express 5, Socket.IO |
| Containerisation | Docker, Docker Compose |

---

## Project Structure

```
planning-poker/
├── client/          # Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── JoinRoom.vue   # Room creation & joining flow
│   │   │   ├── Room.vue       # Room wrapper & share link
│   │   │   ├── GameBoard.vue  # Voting controls & player list
│   │   │   └── Vote.vue       # Individual vote card
│   │   ├── router/            # Vue Router configuration
│   │   ├── js/                # Utility generators (room IDs, names)
│   │   └── socket.js          # Socket.IO client instance
└── server/
    └── server.js              # Express + Socket.IO server
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (optional, for containerised setup)

### Local Development

**Server**

```bash
cd server
npm install
npm run dev        # starts with nodemon on port 8000
```

**Client**

```bash
cd client
npm install
npm run dev        # starts Vite dev server on port 5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker

Run only the server in Docker (the client is served locally via Vite):

```bash
docker-compose up --build
```

The server will be available at \`http://localhost:8000\`.

---

## Environment Variables

| Variable | Location | Default | Description |
|---|---|---|---|
| \`PUBLIC_BASE_URL\` | server | \`http://localhost:5173\` | Base URL used to generate room share links |

---

## Usage

1. **Create a room** – Enter your name and click **Create Room**. A unique room name and ID are generated automatically.
2. **Invite teammates** – Click **Invite People** to copy the share link.
3. **Vote** – Each player clicks a card value to cast their vote.
4. **Reveal** – Click **Reveal Votes** to show all votes simultaneously.
5. **Next round** – Click **Clear Votes** to reset and start a new round.

### Jira Integration

Append \`?issue=<ISSUE_KEY>\` to any room URL to display the Jira issue key inside the room, e.g.:

```
http://localhost:5173/room/\<roomId\>\?issue\=PROJ-123
```

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| \`createRoom\` | Client → Server | Create a new room |
| \`joinRoom\` | Client → Server | Join an existing room by ID or name |
| \`getRoomName\` | Client → Server | Resolve a room name from its ID |
| \`castVote\` | Client → Server | Submit a vote |
| \`revealVotes\` | Client → Server | Toggle vote visibility for all players |
| \`clearVotes\` | Client → Server | Reset all votes in a room |
| \`roomJoined\` | Server → Client | Confirms successful room join |
| \`updateRoom\` | Server → Client | Broadcasts current players and votes |
| \`toggleVisibility\` | Server → Client | Broadcasts vote visibility state |
| \`roomNameResolved\` | Server → Client | Returns the room name for a given ID |
| \`roomError\` | Server → Client | Reports a room-level error |
