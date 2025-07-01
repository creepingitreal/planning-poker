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
      <button
        v-for="value in voteOptions"
        :key="value"
        @click="castVote(roomId, value)"
      >
        {{ value }}
      </button>
</div>
</template>

<script setup>
import socket from '../../socket.js';  
import { defineProps, ref } from 'vue';
import Vote from './Vote.vue';
import '../css/Room.css';

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

const revealVotes = (roomId) => {
  votesVisible.value = !votesVisible.value;
  socket.emit('revealVotes', { roomId: roomId });
} 

const castVote = (roomId, value) => {
  console.log("VOTED", roomId, value);
  socket.emit('castVote', { roomId: roomId, vote: value });
}

const clearVotes = (roomId) => {
  socket.emit('resetVotes', { roomId: roomId });
  console.log("Clearing votes:", roomId);
}

</script>
   
   <style scoped>
   
   </style>