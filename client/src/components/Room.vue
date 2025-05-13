<template>
    <div class="room">
       <h1>Room: {{roomId}}</h1>
       <div class="players">
         <h2>Players</h2>
         <ul>
           <li v-for="player in players" :key="player.id">{{ player.name }}</li>
         </ul>
       </div>
   
    </div>
</template>

<script setup>
</script>