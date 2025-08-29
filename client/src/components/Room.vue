<template>
  <section class="room">
    <div class="section-title">
      <h1>Room Name: <strong>{{ roomId }}</strong></h1>
      <br>
      <h2>Welcome, {{ name }}</h2>
    </div>

    <div class="game-board">
      <span class="players">
        <h3><strong>Players:</strong></h3>
        <div v-for="(player, id) in players || {}" :key="id">
          <h4>{{ player.user }}'s Vote:  </h4>
          <Vote :vote="player.vote" :visible="votesVisible"/>
        </div>
      </span>
      <span>
        <button class="reveal-votes" @click="revealVotes">{{ votesVisible ? "Hide Votes" : "Reveal Votes"}}</button>
        <button class="clear-votes" @click="clearVotes">Clear Votes</button>
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
</section>
</template>

<script setup>
import socket from '../socket.js';
import { ref } from 'vue';
import Vote from './Vote.vue';
import '../css/room.css';

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
  console.log("Clearing votes:", props.roomId);
  socket.emit('clearVotes', {roomId: props.roomId});
}
</script>