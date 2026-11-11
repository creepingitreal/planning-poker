<template>
  <div>
    <div class="nav-bar">
      <div class="nav-header">
        <nav class="room-name-wrapper">
          <p v-if="currentRoom.roomName" class="nav-bar-room-name">
            {{ currentRoom.roomName }}
          </p>

          <button
            v-if="currentRoom.roomName"
            class="share-btn"
            @click="copyLink"
          >
            <Icon name="link-icon" class="icon" />
            {{ shareBtnText }}
          </button>
        </nav>
      </div>
    </div>
    <main>
      <SidePanel
        v-if="currentRoom.roomId"
        :players="roomPlayers"
        :allow-manual="activeTool === 'wheel'"
        v-model:manual-names-arr="wheelManualNames"
      />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import './style.css'
import SidePanel from './components/SidePanel/SidePanel.vue'
import { computed, onUnmounted, ref } from 'vue'
import socket from '../socket.js'
import {
  activeTool,
  currentRoom,
  roomPlayers,
  wheelManualNames,
} from './js/roomNav.js'

const handleUpdateRoom = ({ players = {} }) => {
  roomPlayers.value = players
}

socket.on('updateRoom', handleUpdateRoom)
onUnmounted(() => socket.off('updateRoom', handleUpdateRoom))

const shareUrl = ref('')
const copied = ref(false)
const shareBtnText = computed(() =>
  copied.value ? 'Link Copied!' : 'Invite Users',
)
const copyLink = async () => {
  const url = shareUrl.value || globalThis.location.href
  await navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 3000)
}

// const logoLink = computed(() =>
//   currentRoom.value.roomId
//     ? {
//         path: "/dashboard",
//         query: {
//           roomId: currentRoom.value.roomId,
//           roomName: currentRoom.value.roomName,
//         },
//       }
//     : { path: "/" },
// );
</script>
