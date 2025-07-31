<template>
  <div v-if="!joined" class="max-w-40px m-auto pt-100px text-center">
    <h1>Join a Room</h1>
    <input
        class="block my-2.5 mx-auto px-4 py-2"
        v-model="roomId"
        placeholder="Room ID"
    />
    <input class="block my-2.5 mx-auto px-4 py-2"
           v-model="name"
           placeholder="Username"
    />
    <button class="m-2 px-5 py-2 text-white border-none rounded cursor-pointer hover:bg-[#cccdcf6e]"
    @click="joinRoom"
    >Join</button>
    <button class="m-2 px-5 py-2 text-white border-none rounded cursor-pointer hover:bg-[#cccdcf6e]"
    @click="createRoom"
    >Create Room
    </button>
  </div>

  <div v-else>
    <Room :room-id="roomId" :name="name" :players="players"/>  
  </div>
</template>

<script setup>
import { ref } from 'vue';
import socket from '../../socket.js'; 
import Room from './Room.vue';
import '../css/join-room.css';

const joined = ref(false);
const name = ref('');
const roomId = ref('');
const players = ref({});

socket.on('connect', () => {
  console.log('Connected to server');
});

const joinRoom = () => {
  if(!name.value || !roomId.value) {
    alert("Please enter a room ID and your name"); return;
  }
  socket.emit('joinRoom', { roomId: roomId.value, user: name.value });
  
  joined.value = true;
  console.log('Joining room:', roomId.value, 'as', name.value);
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
  players.value = data;
  console.log('Local players now:', players.value);
});


</script>