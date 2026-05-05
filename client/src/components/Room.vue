<template>
  <section class="room ">
    <button class="black small share-btn" @click="copyLink">
      {{ copied ? '✓ Copied!' : '🔗 Share Invite Link' }}
    </button>

    <div class="section-title">
      <div>
        <h1 class="">Welcome to the
          <strong class="no-wrap">{{ room.roomName }}</strong> Room,
          {{ name }}!
        </h1>
      </div>
      <div v-if="jiraIssue">
        <h1>Jira Ticket: </h1>
        <h1><strong>{{ jiraIssue }}</strong></h1>
      </div>
    </div>

    <game-board :room="room" :players="players"></game-board>
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
  },
  jiraIssue: {
    type: String,
    required: false
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
</script>