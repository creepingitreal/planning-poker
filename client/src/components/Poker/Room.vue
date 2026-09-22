<template>
  <section>
    <section
      v-if="joined"
      class="room"
      :class="{ retro: activeTool === 'retro' }"
    >
      <button
        class="icon-only users-drawer-trigger"
        type="button"
        aria-label="Open users drawer"
        title="Open users"
        @click="showUsersDrawer = true"
      >
        <span aria-hidden="true">☰</span>
      </button>

      <UsersDrawer
        :open="showUsersDrawer"
        :players="players"
        :allow-manual="activeTool === 'wheel'"
        :manual-names="wheelManualNames"
        @close="showUsersDrawer = false"
        @update:manual-names="wheelManualNames = $event"
      />

      <RetroBoard
        v-show="activeTool === 'retro'"
        class="full-width-section"
        :room="room"
        :players="players"
        :board="board"
        :timer="timer"
        @reveal="revealCards"
        @clear="clearBoard"
        @start-timer="startTimer"
        @pause-timer="pauseTimer"
        @reset-timer="resetTimer"
      />
      <GameBoard
        v-show="activeTool === 'poker'"
        :room="room"
        :players="players"
      />
      <SpinTheWheel
        v-show="activeTool === 'wheel'"
        :players="players"
        :manual-names="wheelManualNames"
      />
    </section>
  </section>
</template>

<script setup>
  import GameBoard from "./Poker.vue";
  import RetroBoard from "../Retro/RetroBoard.vue";
  import SpinTheWheel from "../Wheel/SpinTheWheel.vue";
  import UsersDrawer from "../UsersDrawer/UsersDrawer.vue";
  import "./room.css";
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import {
    activeTool,
    showTools,
    restoreActiveTool,
    persistActiveTool,
    setCurrentRoom,
  } from "../../js/roomNav.js";
  import socket from "../../../socket.js";

  const route = useRoute();
  const router = useRouter();

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
    showTools.value = true;
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

    if (!joined.value) {
      localStorage.removeItem(`poker_session_${route.params.roomId}`);

      const toolQuery = route.query.tool
        ? `?tool=${encodeURIComponent(route.query.tool)}`
        : "";
      router.replace(`/join/${route.params.roomId}${toolQuery}`);
    }
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

  socket.on("roomJoined", handleRoomJoined);
  socket.on("roomError", handleRoomError);
  socket.on("updateRoom", handleUpdateRoom);
  socket.on("updateBoard", handleUpdateBoard);
  socket.on("updateTimer", handleUpdateTimer);

  onMounted(() => {
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
        return;
      }

      localStorage.removeItem(`poker_session_${route.params.roomId}`);
    }

    const toolQuery = route.query.tool
      ? `?tool=${encodeURIComponent(route.query.tool)}`
      : "";
    router.replace(`/join/${route.params.roomId}${toolQuery}`);
  });

  onUnmounted(() => {
    socket.off("roomJoined", handleRoomJoined);
    socket.off("roomError", handleRoomError);
    socket.off("updateRoom", handleUpdateRoom);
    socket.off("updateBoard", handleUpdateBoard);
    socket.off("updateTimer", handleUpdateTimer);
    showTools.value = false;
  });
</script>
