<template>
  <div class="room">
      <h1>Room: {{ roomId }}</h1>
      <h2>Welcome, {{ name }}!</h2>
      <div class="game-board">
        <h2>Players:</h2>
        <div class="players" v-for="(player, id) in players || {}" :key="id">
          <h3>{{ player.user }}'s Vote:  </h3> <Vote :vote="player.vote" :visible="votesVisible"/>
        </div>
        <button class="reveal-votes" @click="revealVotes">{{ votesVisible ? "Hide Votes" : "Reveal Votes"}}</button>
        <button class="clear-votes" @click="clearVotes">Clear Votes</button>
      </div>
      <button class="card"
        v-for="value in voteOptions"
        :key="value"
        @click="castVote(value)"
      >
        {{ value }}
      </button>
</div>
</template>

<script setup>
import socket from '../../socket.js';  
import { ref } from 'vue';
import Vote from './Vote.vue';
import '../../src/css/room.css';

const props = defineProps({
    roomId: {
        type: String,
        required: true
    },
    players: {
        type: Object,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});
const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];
const votesVisible = ref(false);

const revealVotes = () => {
  votesVisible.value = !votesVisible.value;
  socket.emit('revealVotes', { roomId: props.roomId });
} 

const castVote = (value) => {
  console.log("VOTED", props.roomId, value);
  socket.emit('castVote', { roomId: props.roomId, vote: value });
}

const clearVotes = () => {
  // console.log("Clearing votes:", props.roomId);
  socket.emit('resetVotes', { roomId: props.roomId });
}
</script>