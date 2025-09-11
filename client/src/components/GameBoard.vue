<template>
  <div class="game-board">
    <div class="players">
      <h3><strong>Players:</strong></h3>
      <div v-for="(player, id) in players || {}" :key="id">
        <h4>{{ player.user }}'s Vote:  </h4>
        <Vote :vote="player.vote" :is-visible="isVisible"/>
      </div>
    </div>
    <span>
        <button class="reveal-votes"
                @click="revealVotes(!isVisible)"
                :disabled="!hasVotes"
        >{{ isVisible ? "Hide Votes" : "Reveal Votes"}}
        </button>
        <button class="clear-votes"
                @click="clearVotes"
        >Clear Votes
        </button>
      </span>
  </div>

  <span>
      <button class="card"
              v-for="value in voteOptions"
              :key="value"
              @click="castVote(value)"
      >
        {{ value }}
      </button>
    </span>
</template>

<script setup>
import Vote from "./Vote.vue";
import socket from "../../socket.js";
import {computed, ref} from "vue";
import '../css/room.css';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];
const isVisible = ref(false);

const props = defineProps({
  players: {
    type: Object,
    required: true
  },
  roomId: {
    type: [String, Number],
    required: true
  }
})

const hasVotes = computed(() => {
  return Object.values(props.players).some(player => player.vote !== null);
})

const castVote = (value) => {
  socket.emit('castVote', { roomId: props.roomId, vote: value });
  console.log("VOTED", props.roomId, value);
};

const revealVotes = (visibility) => {
  socket.emit('revealVotes', {roomId: props.roomId, visibility: visibility});
  console.log("Reveal or Hide");
};

const clearVotes = () => {
  socket.emit('clearVotes', {roomId: props.roomId});
  console.log("Clearing votes:", props.roomId);
};

socket.on('toggleVisibility', (visibility) => {
  isVisible.value = visibility;
  console.log('toggle hit')
});



</script>