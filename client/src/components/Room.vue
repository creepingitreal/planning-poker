<template>
  <section class="room">
    <div class="section-title">
      <h1>Room Name: </h1>
      <h1><strong>{{ roomId }}</strong></h1>
      <br>
      <h2>Welcome, {{ name }}</h2>
    </div>
    <div>
      <game-board :roomId="roomId" :players="players"></game-board>
    </div>
</section>
</template>

<script setup>
import GameBoard from "./GameBoard.vue";

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
</script>