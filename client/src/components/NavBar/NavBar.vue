<template>
  <div class="nav-bar">
    <div class="nav-header" :class="{ 'no-session': !roomId }">
      <div class="dashboard-header">
        <RouterLink
          v-if="isRoomRoute"
          to="/dashboard"
          class="dashboard-logo-link"
          title="Go to dashboard"
          aria-label="Go to dashboard"
        >
          <BrandLogo class="icon xlarge fill-current text-current" />
        </RouterLink>
        <BrandLogo v-else class="icon xlarge fill-current text-current" />
        <h1>{{ brand.welcome }}</h1>
      </div>
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
  </div>
</template>

<script setup>
import './nav-bar.css'
import BrandLogo from '@brand/logo.svg?component'
import { computed, onUnmounted, ref } from 'vue'
import { brand } from '../../brand/index.js'

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
