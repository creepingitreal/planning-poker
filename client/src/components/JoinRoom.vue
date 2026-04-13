<template>
  <section>
    <div v-if="!joined" class="max-w-40px m-auto pt-100px text-center">
      <h1>Join a Room</h1>
      <input
          class="block my-2.5 mx-auto px-4 py-2"
          v-model="room.roomId"
          placeholder="Room Name"
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
      <Room :room="room" :name="name" :players="players" :share-url="shareUrl"/>
    </div>
  </section>
</template>

<script setup>
import socket from '../../socket.js';
import '../css/join-room.css';
import Room from './Room.vue';
import {onMounted, ref} from 'vue';
import {generateRoomId, randomNameGenerator} from "../js/generators.js";
import {useRoute} from "vue-router";

const route = useRoute(false);
const shareUrl = ref('');
const joined = ref(false);
const name = ref('');
const room = ref({
  roomId: '',
  roomName: ''
});
const players = ref({});

onMounted(() => {
  if (route.params.roomId) {
    room.value.roomId = route.params.roomId;
  }
})

socket.on('connect', () => {
  console.log('Connected to server');
});

const joinRoom = () => {
  if(!name.value || !room.value.roomId) {
    alert("Please enter a room ID and your name"); return;
  }
  socket.emit('joinRoom', { room: room.value, user: name.value });
  
  joined.value = true;
};

const createRoom = () => {
  if(!name.value) {
    alert("Please enter your name"); return;
  }
  room.value.roomName = randomNameGenerator();
  room.value.roomId = generateRoomId();
  socket.emit('joinRoom', { room: room.value, user: name.value });

  joined.value = true;
}

socket.on('updateRoom', (data) => {
  players.value = data;
  if (url) shareUrl.value = url;
});
</script>