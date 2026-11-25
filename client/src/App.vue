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
    <RouterView />
    <MessageModal
      :open="!!currentMessage"
      :message="currentMessage?.message ?? ''"
      :title="currentMessage?.title ?? ''"
      :variant="currentMessage?.variant ?? 'info'"
      :close-label="currentMessage?.closeLabel ?? 'OK'"
      @dismiss="dismissMessage"
    />
  </div>
</template>

<script setup>
import './style.css'
import MessageModal from './components/MessageModal/MessageModal.vue'
import { currentMessage, dismissMessage } from './js/messages.js'
import { computed, ref } from 'vue'
import { currentRoom } from './js/roomNav.js'

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
