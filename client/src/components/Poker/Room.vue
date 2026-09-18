<template>
  <section>
    <div class="room" v-if="!joined">
      <div class="section-title">
        <h1 class="title">
          Joining room: <strong>{{ room.roomName }}</strong>
        </h1>

        <input v-model="name" type="text" placeholder="Username *" />
      </div>

      <div class="button-section">
        <button @click="joinRoom">Join room now</button>
      </div>
    </div>

    <section v-else class="room" :class="{ retro: activeTool === 'retro' }">
      <button
        v-if="activeTool === 'retro' || activeTool === 'wheel'"
        class="icon-only users-drawer-trigger"
        type="button"
        aria-label="Open users drawer"
        title="Open users"
        @click="showUsersDrawer = true"
      >
        <span aria-hidden="true">☰</span>
      </button>

      <div class="section-title">
        <div>
          <h1>
            Sprint:
            <strong class="room-name no-wrap">{{ room.roomName }}</strong>
          </h1>
        </div>
      </div>

      <div class="room-controls">
        <div class="room-actions retro" v-if="activeTool === 'retro'">
          <div class="retro-toolbar">
            <div class="button-section">
              <button
                v-if="!board.revealed"
                @click="revealCards"
                class="secondary-blue"
              >
                Reveal Cards
              </button>
              <button @click="clearBoard" class="white">Clear Board</button>
            </div>

            <div class="retro-timer">
              <button
                class="icon-only icon-btn-timer"
                @click="startTimer"
                :disabled="timer.running || timer.remaining <= 0"
                aria-label="Start timer"
                title="Start"
              >
                ▶
              </button>
              <button
                class="icon-only icon-btn-timer"
                @click="pauseTimer"
                :disabled="!timer.running"
                aria-label="Pause timer"
                title="Pause"
              >
                ⏸
              </button>
              <button
                class="icon-only icon-btn-timer"
                @click="resetTimer"
                aria-label="Reset timer"
                title="Reset"
              >
                ↺
              </button>
              <span class="timer-display">{{ formattedTime }}</span>
            </div>
          </div>
        </div>

        <div class="room-actions">
          <button class="black small share-btn" @click="copyLink">
            {{ copied ? "✓ Copied!" : "🔗 Share Invite Link" }}
          </button>
        </div>
      </div>

      <UsersDrawer
        v-if="activeTool === 'retro' || activeTool === 'wheel'"
        :open="showUsersDrawer"
        :players="players"
        :allow-manual="activeTool === 'wheel'"
        :manual-names="wheelManualNames"
        @close="showUsersDrawer = false"
        @update:manual-names="wheelManualNames = $event"
      />

      <retro-board
        class="full-width-section"
        v-show="activeTool === 'retro'"
        :room="room"
        :players="players"
        :host-id="hostId"
        :board="board"
      ></retro-board>
      <game-board
        v-show="activeTool === 'poker'"
        :room="room"
        :players="players"
      ></game-board>
      <SpinTheWheel
        v-show="activeTool === 'wheel'"
        :players="players"
        :manual-names="wheelManualNames"
      />
    </section>
  </section>
</template>

<script setup>
import GameBoard from "./GameBoard.vue";
import RetroBoard from "../Retro/RetroBoard.vue";
import SpinTheWheel from "../Wheel/SpinTheWheel.vue";
import UsersDrawer from "../UsersDrawer/UsersDrawer.vue";
import "./join-room.css";
import "./room.css";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  activeTool,
  showToolSubnav,
  restoreActiveTool,
  persistActiveTool,
  setCurrentRoom,
} from "../../js/roomNav.js";
import socket from "../../../socket.js";

const route = useRoute();

const joined = ref(false);
const name = ref("");
const room = ref({
  roomId: route.params.roomId,
  roomName: "",
});
const shareUrl = ref("");
const players = ref({});
const hostId = ref(null);
const createEmptyBoard = () => ({
  columns: [
    { id: "went-well", title: "Went Well" },
    { id: "to-improve", title: "To Improve" },
    { id: "action-items", title: "Action Items" },
  ],
  cards: [],
  revealed: false,
});
const board = ref(createEmptyBoard());
const timer = ref({ duration: 300, remaining: 300, running: false });

const copied = ref(false);
const showUsersDrawer = ref(false);
const wheelManualNames = ref([]);

const formattedTime = computed(() => {
  const total = Math.max(0, timer.value?.remaining ?? 0);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
});

const saveSession = (roomData, userName) => {
  localStorage.setItem(
    `poker_session_${roomData.roomId}`,
    JSON.stringify({
      room: roomData,
      name: userName,
      savedAt: Date.now(),
    }),
  );
};

const activateRoom = () => {
  restoreActiveTool(room.value.roomId, route.query.tool);
  persistActiveTool(room.value.roomId);
  showToolSubnav.value = true;
};

const joinRoom = () => {
  if (!name.value) {
    alert("Please enter your name");
    return;
  }

  socket.emit("joinRoom", {
    room: { roomId: route.params.roomId, roomName: "" },
    user: name.value,
    fromLink: true,
  });
};

const startTimer = () => {
  socket.emit("startTimer", { roomId: room.value.roomId });
};

const pauseTimer = () => {
  socket.emit("pauseTimer", { roomId: room.value.roomId });
};

const resetTimer = () => {
  socket.emit("resetTimer", { roomId: room.value.roomId });
};

const revealCards = () => {
  socket.emit("revealCards", { roomId: room.value.roomId });
};

const clearBoard = () => {
  socket.emit("clearBoard", { roomId: room.value.roomId });
};

const copyLink = async () => {
  const url = shareUrl.value || globalThis.location.href;
  await navigator.clipboard.writeText(url);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3000);
};

const handleRoomNameResolved = ({ roomName, error }) => {
  if (!error) {
    room.value.roomName = roomName;
  }
};

const handleRoomJoined = ({ roomId, roomName }) => {
  room.value.roomId = roomId;
  room.value.roomName = roomName;

  saveSession(room.value, name.value);
  setCurrentRoom(roomId, roomName);

  joined.value = true;
  activateRoom();
};

const handleRoomError = ({ message }) => {
  alert(message);
};

const handleUpdateRoom = ({
  players: data,
  shareUrl: url,
  roomName,
  hostId: currentHostId,
}) => {
  players.value = data;

  if (url) shareUrl.value = url;
  if (roomName) room.value.roomName = roomName;
  hostId.value = currentHostId ?? null;
};

const handleUpdateBoard = ({ board: boardData }) => {
  board.value = boardData ?? createEmptyBoard();
};

const handleUpdateTimer = ({ timer: timerData }) => {
  if (timerData) timer.value = timerData;
};

socket.on("roomNameResolved", handleRoomNameResolved);
socket.on("roomJoined", handleRoomJoined);
socket.on("roomError", handleRoomError);
socket.on("updateRoom", handleUpdateRoom);
socket.on("updateBoard", handleUpdateBoard);
socket.on("updateTimer", handleUpdateTimer);

onMounted(() => {
  socket.emit("getRoomName", route.params.roomId);

  const saved = localStorage.getItem(`poker_session_${route.params.roomId}`);

  if (saved) {
    const session = JSON.parse(saved);
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (Date.now() - session.savedAt < twentyFourHours) {
      room.value = session.room;
      name.value = session.name;

      socket.emit("joinRoom", {
        room: session.room,
        user: session.name,
        fromLink: true,
      });
    } else {
      localStorage.removeItem(`poker_session_${route.params.roomId}`);
    }
  }
});

onUnmounted(() => {
  socket.off("roomNameResolved", handleRoomNameResolved);
  socket.off("roomJoined", handleRoomJoined);
  socket.off("roomError", handleRoomError);
  socket.off("updateRoom", handleUpdateRoom);
  socket.off("updateBoard", handleUpdateBoard);
  socket.off("updateTimer", handleUpdateTimer);
  showToolSubnav.value = false;
});
</script>
