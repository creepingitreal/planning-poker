<template>
  <SidePanel
    v-if="currentRoom.roomId"
    :players="roomPlayers"
    :allow-manual="activeTool === 'wheel'"
    :manual-names-arr="wheelManualNames"
    :active-tool="selectedTool"
    @update:manual-names-arr="updateWheelManualNames"
    @select-tool="selectTool"
  />
  <div class="app-frame">
    <div class="app-frame-content">
      <NavBar
        :room-id="currentRoom.roomId"
        :room-name="currentRoom.roomName"
        :active-tool="activeTool"
        :is-room-route="isRoomRoute"
      />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import NavBar from '../components/NavBar/NavBar.vue'
import SidePanel from '../components/SidePanel/SidePanel.vue'
import { computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import socket from '../../socket.js'
import './layout.css'
import {
  activeTool,
  currentRoom,
  roomPlayers,
  wheelManualNames,
} from '../js/roomNav.js'

const route = useRoute()
const router = useRouter()

const isRoomRoute = computed(() => route.path.startsWith('/room/'))
const selectedTool = computed(() => (isRoomRoute.value ? activeTool.value : ''))

const selectTool = (tool) => {
  if (isRoomRoute.value) {
    activeTool.value = tool
    return
  }

  router.push({ path: `/room/${currentRoom.value.roomId}`, query: { tool } })
}

const handleUpdateRoom = ({ players = {} }) => {
  roomPlayers.value = players
}

const updateWheelManualNames = (names) => {
  wheelManualNames.value = names
}

socket.on('updateRoom', handleUpdateRoom)
onUnmounted(() => socket.off('updateRoom', handleUpdateRoom))
</script>
