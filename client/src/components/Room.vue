<template>
  <section class="room">
    <div class="section-title">
      <h1>Room Name: </h1>
      <h1><strong>{{ room.roomName }}</strong></h1>
      <br>
      <h2>Welcome, {{ name }}</h2>
      <button class="share-btn" @click="copyLink">
        {{ copied ? '✓ Copied!' : '🔗 Copy Invite Link' }}
      </button>
    </div>
    <div>
      <game-board :room="room" :players="players"></game-board>
    </div>
</section>
</template>

<script setup>
import GameBoard from "./GameBoard.vue";
import {ref} from "vue";

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
  }
});

const copied = ref(false);

const copyLink = async () => {
  const url = props.shareUrl || window.location.href;
  await navigator.clipboard.writeText(url);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
};
</script>