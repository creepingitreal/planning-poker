<template>
  <section>
    <div class="room join-room">
      <div class="section-title">
        <h1 class="title">
          {{ roomId ? roomName || 'Join Room' : 'Join or Create a Room' }}
        </h1>

        <input
          v-if="!roomId"
          v-model="roomNameInput"
          placeholder="Sprint Name"
          @keyup.enter="createRoom"
        />

        <input
          v-model="name"
          type="text"
          placeholder="Username *"
          autocomplete="given-name"
          @keyup.enter="roomId ? joinRoom() : createRoom()"
        />
      </div>

      <div class="button-section">
        <div v-if="!roomId" class="container-create-btn">
          <input
            id="invite-only"
            type="checkbox"
            v-model="locked"
            class="checkbox"
          />
          <label for="invite-only"> Invite-only </label>
          <p v-if="locked" class="text-small confirmation-text">
            By checking this box, only users with the share link will be able to
            join the room
          </p>
          <button @click="createRoom" class="accent">Create Room</button>
        </div>
        <button @click="joinRoom">Join</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import socket from '../../../socket.js'
import './join-room.css'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { generateRoomId, randomNameGenerator } from '../../js/generators.js'
import { useRoute, useRouter } from 'vue-router'
import { setCurrentRoom, TOOLS } from '../../js/roomNav.js'
import { showMessage } from '../../js/messages.js'

const route = useRoute(false)
const router = useRouter()

const roomId = computed(() => route.params.roomId || '')
const roomName = ref('')

const name = ref('')
const room = ref({
  roomId: '',
  roomName: '',
})
const roomNameInput = ref('')
const locked = ref(false)
const clientId = localStorage.getItem('poker_client_id') || crypto.randomUUID()
localStorage.setItem('poker_client_id', clientId)

const saveSession = (roomData, userName) => {
  localStorage.setItem(
    `poker_session_${roomData.roomId}`,
    JSON.stringify({
      room: roomData,
      name: userName,
      clientId,
      savedAt: Date.now(),
    }),
  )
}

const joinRoom = () => {
  if (!name.value) {
    showMessage('Please enter your name', { variant: 'warning' })
    return
  }

  if (!roomId.value && !roomNameInput.value) {
    showMessage('Please enter a room name', { variant: 'warning' })
    return
  }

  socket.emit('joinRoom', {
    room: {
      roomId: roomId.value,
      roomName: roomId.value ? '' : roomNameInput.value,
    },
    user: name.value,
    clientId,
    fromLink: !!roomId.value,
  })
}

const createRoom = () => {
  if (!name.value) {
    showMessage('Please enter your name', { variant: 'warning' })
    return
  }

  room.value.roomName = roomNameInput.value || randomNameGenerator()
  room.value.roomId = generateRoomId()

  socket.emit('createRoom', {
    room: { ...room.value, locked: locked.value },
    user: name.value,
    clientId,
  })

  locked.value = false
}

const handleRoomJoined = ({ roomId, roomName }) => {
  room.value.roomId = roomId
  room.value.roomName = roomName

  saveSession(room.value, name.value)
  setCurrentRoom(roomId, roomName)

  const tool = route.query?.tool
  if (TOOLS.includes(tool)) {
    router.push({ path: `/room/${roomId}`, query: { tool } })
    return
  }

  router.push('/dashboard')
}

const handleRoomError = ({ message }) => {
  if (message.includes('Room not found')) {
    localStorage.removeItem(`poker_session_${route.params.roomId}`)
    router.replace('/join')
  }
  showMessage(message, { variant: 'error' })
}

const handleRoomNameResolved = ({ roomName: resolvedName, error }) => {
  if (!error) {
    roomName.value = resolvedName
  }
}

socket.on('roomJoined', handleRoomJoined)
socket.on('roomError', handleRoomError)
socket.on('roomNameResolved', handleRoomNameResolved)

onMounted(() => {
  if (roomId.value) {
    socket.emit('getRoomName', roomId.value)
  }
})

onUnmounted(() => {
  socket.off('roomJoined', handleRoomJoined)
  socket.off('roomError', handleRoomError)
  socket.off('roomNameResolved', handleRoomNameResolved)
})
</script>
