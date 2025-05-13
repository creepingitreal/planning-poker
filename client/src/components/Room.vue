<template>
    <div class="room">
       <h1>Room: {{ roomId }}</h1>
       <h2>Welcome, {{ name }}!</h2>
       <div class="players">
         <h2>Players</h2>
         <ul>
           <li v-for="player in players" :key="player.id">{{ player.user }}</li>
           <pre>{{ players }}</pre>
         </ul>
       </div>
       <div class="game-board">
         the game board will go here
       </div>
    </div>
   </template>
   
   <script setup>
   const props = defineProps({
       roomId: {
           type: String,
           required: true
       },
       players: {
           type: Object,
           default: () => [],
           required: true
       },
       name: {
           type: String,
           required: true
       }
   });
   </script>
   
   <style scoped>
   .game-board {
       border: 1px solid #fff;
       padding: 100px;
       
   }
   </style>