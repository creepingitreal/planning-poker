<template>
  <section class="room ">
  <div class="header">
      <div class="retro-timer" v-if="activeTool === 'retro'">
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
        <button class="icon-only icon-btn-timer" @click="resetTimer" aria-label="Reset timer" title="Reset">
          ↺
        </button>
        <span class="timer-display">{{ formattedTime }}</span>
      </div>

    <div class="section-title">
      <div>
        <h1>Sprint:
          <strong class="room-name no-wrap">{{ room.roomName }}</strong>
        </h1>
      </div>
    </div>

      <div class="room-actions">
        <button v-if="activeTool === 'retro'" class="outline small users-drawer-btn" @click="showUsersDrawer = true">
          Users
        </button>
        <button class="black small share-btn" @click="copyLink">
          {{ copied ? '✓ Copied!' : '🔗 Share Invite Link' }}
        </button>
      </div>
  </div>

    <div
        v-if="activeTool === 'retro' && showUsersDrawer"
        class="users-drawer-backdrop"
        @click="showUsersDrawer = false"
    ></div>
    <aside
        v-if="activeTool === 'retro'"
        class="users-drawer"
        :class="{ open: showUsersDrawer }"
        aria-label="Retro room users"
        :aria-hidden="!showUsersDrawer"
    >
      <div class="users-drawer-header">
        <h2>Users</h2>
        <button class="icon-only users-drawer-close" @click="showUsersDrawer = false" aria-label="Close users drawer">
          ✕
        </button>
      </div>
      <ul class="users-list">
        <li v-for="player in retroUsers" :key="player.id" class="users-list-item">
          <span class="user-colour-dot" :style="{ backgroundColor: player.color }"></span>
          <span>{{ player.user }}</span>
        </li>
      </ul>
    </aside>

    <retro-board class="full-width-section" v-show="activeTool === 'retro'" :room="room" :players="players" :host-id="hostId" :board="board"></retro-board>
    <game-board v-show="activeTool === 'poker'" :room="room" :players="players"></game-board>
  </section>
</template>

<script setup>
import GameBoard from "./GameBoard.vue";
import RetroBoard from "./RetroBoard.vue";
import {computed, onMounted, onUnmounted, ref} from "vue";
import {activeTool, showToolSubnav, restoreActiveTool, persistActiveTool} from "../js/roomNav.js";
import socket from "../../socket.js";
import '../css/room.css';

const props = defineProps({
  room: {
    type: Object,
    required: true
  },
  players: {
    type: Object,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  shareUrl: {
    type: String,
    default: ''
  },
  hostId: {
    type: String,
    default: null
  },
  board: {
    type: Object,
    default: () => ({columns: [], cards: [], revealed: false})
  },
  timer: {
    type: Object,
    default: () => ({duration: 300, remaining: 300, running: false})
  }
});

const copied = ref(false);
const showUsersDrawer = ref(false);

const formattedTime = computed(() => {
  const total = Math.max(0, props.timer?.remaining ?? 0);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
});

const retroUsers = computed(() => Object.entries(props.players ?? {}).map(([id, player]) => ({
  id,
  user: player.user,
  color: player.color,
})));

const startTimer = () => {
  socket.emit('startTimer', {roomId: props.room.roomId});
};

const pauseTimer = () => {
  socket.emit('pauseTimer', {roomId: props.room.roomId});
};

const resetTimer = () => {
  socket.emit('resetTimer', {roomId: props.room.roomId});
};

const copyLink = async () => {
  const url = props.shareUrl || globalThis.location.href;
  await navigator.clipboard.writeText(url);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3000);
};

onMounted(() => {
  restoreActiveTool(props.room.roomId);
  persistActiveTool(props.room.roomId);
  showToolSubnav.value = true;
});

onUnmounted(() => {
  showToolSubnav.value = false;
});
</script>
