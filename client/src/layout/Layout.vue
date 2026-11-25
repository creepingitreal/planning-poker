<template>
  <main>
    <SidePanel
      v-if="currentRoom.roomId"
      :players="roomPlayers"
      :allow-manual="activeTool === 'wheel'"
      :manual-names-arr="wheelManualNames"
      @update:manual-names-arr="updateWheelManualNames"
    />
    <RouterView />
  </main>
</template>

<script setup>
import SidePanel from '../components/SidePanel/SidePanel.vue'
import { onUnmounted } from 'vue'
import socket from '../../socket.js'
import {
  activeTool,
  currentRoom,
  roomPlayers,
  wheelManualNames,
} from '../js/roomNav.js'

const handleUpdateRoom = ({ players = {} }) => {
  roomPlayers.value = players
}

const updateWheelManualNames = (names) => {
  wheelManualNames.value = names
}

socket.on('updateRoom', handleUpdateRoom)
onUnmounted(() => socket.off('updateRoom', handleUpdateRoom))
</script>
