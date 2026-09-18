# PlanningPoker Handoff

## Current Priorities

1. Fix participant colors.
2. Fix users drawer color dots.
3. Fix Retro card colors and board behavior.
4. Confirm Create Room still works.

## Workspace

```text
/Users/alexandrademetriades/code/PlanningPoker
```

## Runtime

The correct backend container is `planningpoker-server-1` and should mount:

```text
/Users/alexandrademetriades/code/PlanningPoker/server -> /app
```

Start it with:

```bash
cd /Users/alexandrademetriades/code/PlanningPoker
docker compose up -d server
curl http://localhost:8000/health
```

An older container was previously mounted from the lowercase checkout:

```text
/Users/alexandrademetriades/code/planning-poker
```

That container did not contain the current Retro implementation.

## Color State Flow

Participant colors should flow as follows:

```text
server/poker.js
  -> rooms[roomId][socket.id] = { user, vote, color }
  -> updateRoom
  -> client JoinRoom.vue players
  -> Room.vue
  -> UsersDrawer.vue player.color
  -> RetroBoard.vue / RetroCard.vue
```

Relevant files:

- `server/state.js`
  - Participant shape is `{ user, vote, color }`.
  - `newParticipant(user, color)` factory exists.

- `server/colorAllocation.js`
  - Randomly selects from the shared participant palette.

- `server/poker.js`
  - Assigns colors during `createRoom` and `joinRoom`.
  - `ensureParticipantColors()` repairs missing colors.
  - This file was recently edited by the user/formatter. Read it before changing it again.

- `client/src/components/UsersDrawer/UsersDrawer.vue`
  - Displays the participant color with:

    ```vue
    :style="{ backgroundColor: player.color }"
    ```

  - Maps the `players` prop into `roomUsers`.

- `client/src/components/Retro/RetroBoard.vue`
  - New card color:

    ```js
    const myColor = computed(() => props.players?.[socket.id]?.color ?? null);
    ```

  - Existing cards receive `card.color`.

- `client/src/components/Retro/RetroCard.vue`
  - Applies `props.color` directly as `backgroundColor` and `borderColor`.

- `server/retro.js`
  - Retro cards persist the author's color when created:

    ```js
    color: rooms[roomId]?.[socket.id]?.color ?? null
    ```

  - Board broadcasts prefer `card.color`, then fall back to the current participant color.

## Create Room Contract

The server handler expects this payload:

```js
socket.emit("createRoom", {
  room: {
    roomId: "room-id",
    roomName: "Room name",
    locked: false,
  },
  user: "Username",
});
```

The client currently emits this shape from `JoinRoom.vue`.

The server handler validates malformed payloads instead of crashing:

```js
socket.on("createRoom", ({ room, user } = {}) => {
  if (!room?.roomId || !room?.roomName || !user?.trim()) {
    socket.emit("roomError", {
      message: "Room name and username are required.",
    });
    return;
  }
```

A previous direct Socket.IO probe was malformed because it emitted a flat room object and a separate username. That probe is not evidence that the browser payload is wrong.

## Validation Already Passed

```bash
node --check server/state.js
node --check server/poker.js
node --check server/retro.js
cd client && npm run build
```

The backend health endpoint returned `OK` after restarting the current container.

## Recommended Next Debugging Step

Run a correctly shaped Socket.IO probe and inspect the `updateRoom` payload:

```js
socket.emit("createRoom", {
  room: {
    roomId: "probe-room-unique",
    roomName: "Probe",
    locked: false,
  },
  user: "Probe",
});
```

Confirm that the returned payload contains:

```js
players[socket.id].color
```

If the value is missing, the problem is server-side. If it exists but the UI is white, inspect the rendered inline `background-color` styles and CSS overrides in the browser.
