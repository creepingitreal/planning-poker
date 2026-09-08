<template>
  <section class="room ">
    <button class="black small share-btn" @click="copyLink">
      {{ copied ? '✓ Copied!' : '🔗 Share Invite Link' }}
    </button>

    <div class="section-title">
      <div>
        <h1>Sprint:
          <strong class="room-name no-wrap">{{ room.roomName }}</strong>
        </h1>
      </div>
    </div>

    <retro-board v-show="activeTool === 'retro'" :room="room" :host-id="hostId" :board="board"></retro-board>
    <game-board v-show="activeTool === 'poker'" :room="room" :players="players"></game-board>
  </section>
</template>

<script setup>
import GameBoard from "./GameBoard.vue";
import RetroBoard from "./RetroBoard.vue";
import {onMounted, onUnmounted, ref} from "vue";
import {activeTool, showToolSubnav} from "../js/roomNav.js";

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
    default: () => ({columns: []})
  }
});

const copied = ref(false);

const copyLink = async () => {
  const url = props.shareUrl || globalThis.location.href;
  await navigator.clipboard.writeText(url);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3000);
};

onMounted(() => {
  activeTool.value = 'poker';
  showToolSubnav.value = true;
});

onUnmounted(() => {
  showToolSubnav.value = false;
});
</script>
