<template>
  <div class="room">
      <h1>Room: {{ roomId }}</h1>
      <h2>Welcome, {{ name }}!</h2>
      <div class="players">
        <h2>Players:</h2>
        <ul>
          <li v-for="(player, id) in players" :key="id">{{ player.user }}  VOTE: {{ player.vote }}</li>
        </ul>
      </div>
      <div class="game-board">
        <div v-for="(player, id) in players" :key="id">
          <h3>{{ player.user }}'s Vote:  {{ player.vote }}</h3>
        </div>
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
import  socket  from '../socket.js';  
import { defineProps } from 'vue';

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

const castVote = (roomId, value) => {
  console.log("CLICK", roomId, value);
  socket.emit('castVote', { roomId: roomId, vote: value });
}

</script>
   
   <style scoped>
   .game-board {
    height: 35vw;
    width: auto;
       border: 1px solid #fff;
   }

   button {
       background-color: #4CAF50; /* Green */
       border: #89c68b 2px solid;
       color: white;
       padding: 25px 20px;
       margin: 10px 5px;
       text-decoration: none;
       font-size: 1rem;
       cursor: pointer;
   }
   
    button:hover {
        background-color: #45a049;
        scale: 1.05;
        transition: all 0.3s ease;
        transform: translateY(-2px);
    }
   </style>