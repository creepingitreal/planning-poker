<template>
  <div v-if="!joined" class="join-room">
    <h1>Join a Room</h1>
    <input v-model="roomId" placeholder="Room ID" />
    <input v-model="name" placeholder="Username" />
    <button @click="joinRoom">Join</button>
    <button @click="createRoom">Create Room</button>
  </div>

  <div v-else>
    <Room :room-id="roomId" :name="name" :players="players"/>  
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { io } from 'socket.io-client';
import Room from './Room.vue';

const socket = io('http://localhost:8000');
socket.on('connect', () => {
  console.log('Connected to server');
});

const joined = ref(false);
const name = ref('');
const roomId = ref('');
const players = ref({});

const joinRoom = () => {
  if(!name.value || !roomId.value) {
    if(!name.value) { 
      alert("Please enter a room number and your name"); return;
    } else {
      alert("Please enter a room number"); return;
    }
  }
  socket.emit('joinRoom', { roomId: roomId.value, user: name.value });
  
  joined.value = true;
}

const createRoom = () => {
  if(!name.value) { 
    alert("Please enter your name"); return;
  }
  roomId.value = Math.random().toString(36).substring(2, 6).toUpperCase();

  socket.emit('joinRoom', { roomId: roomId.value, user: name.value });
  
  joined.value = true;
}

socket.on('updateRoom', (data) => {
  console.log('Room updated:', data);
  players.value = data;
});


</script>


<style scoped>
.join-room {
  max-width: 400px;
  margin: auto;
  padding-top: 100px;
  text-align: center;
}

input {
  display: block;
  margin: 10px auto;
}

button {
  margin: 10px;
  padding: 10px 20px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #cccdcf6e;
}
</style>
  