<template>
  <div class="create-room">
    <h1 class="">Create a Room</h1>
    <input v-model="roomName" type="text" placeholder="Room Name" class="" />
    <button @click="createRoom" class="">Create Room</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roomName: ''
    };
  },
  methods: {
    createRoom() {
      // Logic to create a room
      console.log(`Room created: ${this.roomName}`);
    }
  }
};
</script>
