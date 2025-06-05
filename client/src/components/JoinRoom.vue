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
import  socket  from '../socket.js'; 
import Room from './Room.vue';

const joined = ref(false);
const name = ref('');
const roomId = ref('');
const players = ref({});

socket.on('connect', () => {
  console.log('Connected to server');
});

const joinRoom = () => {
  if(!name.value || !roomId.value) {
    if(!name.value) { 
      alert("Please enter a room ID and your name"); return;
    } else {
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
  console.log('Room Joined:', data);
  players.value = data;
  console.log('Local players now:', players.value);
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
  