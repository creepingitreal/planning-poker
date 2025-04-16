<template>
  <div class="join-room">
    <h1 class="">Join a Room</h1>
    <input v-model="roomId" type="text" placeholder="Room ID" class="" />
    <button @click="joinRoom" class="">Join Room</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roomId: ''
    };
  },
  methods: {
    joinRoom() {
      // Logic to join a room
      console.log(`Joined room: ${this.roomId}`);
    }
  }
};
</script>
