<template>
  <section>
    <div class="room" v-if="!joined">
      <div class="section-title">
        <h1 v-if="!route.params.roomId" class="title">Join a Room</h1>
        <div v-if="!route.params.roomId">
          <input v-model="roomNameInput" placeholder="Room Name" class="input"/>
        </div>
        <h1 v-else class="title">Joining room: <strong>{{ room.roomName }}</strong></h1>
      </div>
      <input v-model="name" type="text" placeholder="Username" class="input"/>

      <div class="button-section">
        <button @click="joinRoom">
          {{ route.params.roomId ? 'Join room now' : 'Join' }}
        </button>

        <div v-if="!route.params.roomId" class="container-create-btn">
            <input id="invite-only" type="checkbox" v-model="locked" class="checkbox"/>
            <label for="invite-only">
              Invite-only
            </label>
            <p v-if="locked" class="text-small">
              By checking this box, only users with the share link will be able to join the room
            </p>
          <button @click="createRoom">
            Create Room
          </button>
        </div>
      </div>
    </div>

    <div v-else>
      <Room :room="room" :name="name" :players="players" :share-url="shareUrl" :jira-issue="jiraIssue"/>
    </div>
  </section>
</template>

<script setup>
import socket from '../../socket.js';
import '../css/join-room.css';
import Room from './Room.vue';
import {onMounted, onUnmounted, ref, watch} from 'vue';
import {generateRoomId, randomNameGenerator} from "../js/generators.js";
import {useRoute, useRouter} from "vue-router";

const route = useRoute(false);
const router = useRouter();

const shareUrl = ref('');
const joined = ref(false);
const name = ref('');
const room = ref({
  roomId: '',
  roomName: ''
});
const roomNameInput = ref('');
const locked = ref(false);
const errorMsg = ref('');
const players = ref({});
const jiraIssue = ref('');

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const issue = params.get('issue');
  if (issue) jiraIssue.value = issue;

  if (route.params.roomId) {
    room.value.roomId = route.params.roomId;
    socket.emit('getRoomName', route.params.roomId);

    const saved = sessionStorage.getItem(`poker_session_${route.params.roomId}`);
    if (saved) {
      const session = JSON.parse(saved);
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (Date.now() - session.savedAt < twentyFourHours) {
        room.value = session.room;
        name.value = session.name;

        socket.emit('joinRoom', { room: session.room, user: session.name, fromLink: true });

        joined.value = true;
      } else {
        sessionStorage.removeItem(`poker_session_${route.params.roomId}`);
      }
    }
  }
});


socket.on('roomNameResolved', ({ roomName, error }) => {
  if (!error) {
    room.value.roomName = roomName;
  }
});
const saveSession = (room, name) => {
  sessionStorage.setItem(`poker_session_${room.roomId}`, JSON.stringify({
    room,
    name,
    savedAt: Date.now()
  }));
};

const joinRoom = () => {
  errorMsg.value = '';
  if (!name.value) { alert('Please enter your name'); return; }

  if (route.params.roomId) {

    socket.emit('joinRoom', {
      room: { roomId: route.params.roomId, roomName: '' },
      user: name.value,
      fromLink: true
    });
  } else {

    if (!roomNameInput.value) { alert('Please enter a room name'); return; }
    socket.emit('joinRoom', {
      room: { roomId: '', roomName: roomNameInput.value },
      user: name.value,
      fromLink: false
    });
  }
};


const createRoom = () => {
  errorMsg.value = '';

  if (!name.value) {
    alert('Please enter your name');
    return;
  }

  room.value.roomName = randomNameGenerator();
  room.value.roomId = generateRoomId();

  socket.emit('createRoom', {room: {...room.value, locked: locked.value}, user: name.value});

  joined.value = true;
};

socket.on('roomJoined', ({ roomId, roomName }) => {
  room.value.roomId = roomId;
  room.value.roomName = roomName;

  saveSession(room.value, name.value);

  router.push(`/room/${roomId}`);

  joined.value = true;
});

socket.on('roomError', ({message}) => {
  alert(message)
});

const handleUpdateRoom = ({players: data, shareUrl: url, roomName: roomName}) => {
  players.value = data;

  if (url) shareUrl.value = url;
  if (roomName) room.value.roomName = roomName;
};

socket.on('updateRoom', handleUpdateRoom);

onUnmounted(() => {
  socket.off('updateRoom', handleUpdateRoom);
  socket.off('roomJoined');
  socket.off('roomError');
});


watch(() => route.path, (newPath) => {
  if (newPath === '/') {
    joined.value = false;
    room.value = { roomId: '', roomName: '' };
    name.value = '';
    players.value = {};
  }
});
</script>