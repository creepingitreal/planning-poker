<template>
  <section class="game-board  section-layout">
    <div class="players-container">
      <h3><strong>Players:</strong></h3>
      <div class="player" v-for="(player, id) in players || {}"
           :key="id"
      >
        <h4>{{ player.user }}'s Vote: </h4>

        <Vote :vote="player.vote" :is-visible="isVisible"/>
      </div>
    </div>

    <div class="button-section">
      <button @click="revealVotes(!isVisible)" :disabled="!hasVotes">
        {{ isVisible ? "Hide Votes" : "Reveal Votes" }}
      </button>
      <button @click="clearVotes">
        Clear Votes
      </button>
    </div>

    <div class="vote-card-section">
      <button class="vote-option"
              v-for="value in voteOptions"
              :key="value"
              @click="castVote(value)"
      >
        {{ value }}
      </button>
    </div>
  </section>
</template>

<script setup>
import socket from "../../socket.js";
import {computed, onUnmounted, ref} from "vue";
import Vote from "./Vote.vue";
import '../css/game-board.css';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];
const isVisible = ref(false);

const props = defineProps({
  players: {
    type: Object,
    required: true
  },
  room: {
    type: Object,
    required: true
  }
})

const hasVotes = computed(() => {
  return Object.values(props.players).some(player => player.vote !== null);
})

const castVote = (value) => {
  socket.emit('castVote', {roomId: props.room.roomId, vote: value});
};

const revealVotes = (visibility) => {
  socket.emit('revealVotes', {roomId: props.room.roomId, visibility: visibility});
};

const clearVotes = () => {
  socket.emit('clearVotes', {roomId: props.room.roomId});
};

const handleToggleVisibility = (visibility) => {
  isVisible.value = visibility;
}

socket.on('toggleVisibility', handleToggleVisibility);

onUnmounted(() => {
  socket.off('toggleVisibility', handleToggleVisibility);
})
</script>