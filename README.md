# Planning Poker Learning Workspace

This repository is being used for a first learning session. The current code and structure are examples and starter material, not a finished product. The existing Vue, Node, and Forge files are here to explore, discuss, and evolve during future sessions.

---

## Current Status

- The current implementation is an example planning poker app used as a learning reference.
- Some folders, especially the Forge app, still contain upstream starter-template content.
- Expect the project to change as concepts are introduced and the examples are adapted.

---

## Example Capabilities In The Current Code

- **Create or join rooms** – Example room creation and join flow.
- **Invite-only rooms** – Example shared-room behaviour.
- **Share link** – Example invite-link generation.
- **Real-time voting** – Example Socket.IO-based vote updates.
- **Fibonacci voting scale** – Example story-point card set.
- **Reveal / hide votes** – Example reveal flow for a voting round.
- **Clear votes** – Example round reset behaviour.
- **Jira integration** – Example issue-key display via the \`?issue=\` query parameter.
- **Session persistence** – Example rejoin behaviour after refresh.

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

## Getting Started For This Learning Session

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

Open [http://localhost:5173](http://localhost:5173) in your browser to inspect the current example UI.

### Docker

Run only the server in Docker (the client is served locally via Vite):

```bash
docker-compose up --build
```

The server will be available at \`http://localhost:8000\`.

---

## Session Goal

Use this workspace to learn how the example app is structured, how the client and server communicate, and how the Forge sample fits alongside the main project.

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
