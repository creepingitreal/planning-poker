<template>
  <div class="nav-bar">
    <nav class="room-name-wrapper">
      <p v-if="roomName" class="nav-bar-room-name">
        {{ roomName }}
      </p>

      <button v-if="roomName" class="link" @click="copyLink">
        <Icon name="link-icon" class="icon" />
        {{ shareBtnText }}
      </button>
    </nav>
  </div>
</template>

<script setup>
import './nav-bar.css'
import { computed, onUnmounted, ref } from 'vue'

const props = defineProps({
  roomId: {
    type: String,
    default: '',
  },
  roomName: {
    type: String,
    default: '',
  },
  activeTool: {
    type: String,
    default: '',
  },
  isRoomRoute: {
    type: Boolean,
    default: false,
  },
})

const copied = ref(false)
let copiedTimer

const shareBtnText = computed(() =>
  copied.value ? 'Link Copied!' : 'Invite Users',
)

const copyLink = async () => {
  const url = new URL(
    `/room/${encodeURIComponent(props.roomId)}`,
    globalThis.location.origin,
  )
  if (props.isRoomRoute && props.activeTool) {
    url.searchParams.set('tool', props.activeTool)
  }
  await navigator.clipboard.writeText(url.toString())
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 3000)
}

onUnmounted(() => clearTimeout(copiedTimer))
</script>
