<template>
  <div class="button-section">
    <button
      v-if="showReveal"
      @click="toggleVisibility"
      :disabled="!hasVotes"
      class="reveal-btn"
    >
      {{ isVisible ? hideLabel : revealLabel }}
    </button>
    <button @click="emit('clear')" class="accent">{{ clearLabel }}</button>
  </div>
</template>

<script setup>
import socket from '../../../../socket.js'

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  hasVotes: {
    type: Boolean,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  revealEvent: {
    type: String,
    default: 'revealVotes',
  },
  showReveal: {
    type: Boolean,
    default: true,
  },
  revealLabel: {
    type: String,
    default: 'Reveal Votes',
  },
  hideLabel: {
    type: String,
    default: 'Hide Votes',
  },
  clearLabel: {
    type: String,
    default: 'Clear Votes',
  },
})
const emit = defineEmits(['clear'])

const toggleVisibility = () => {
  socket.emit(props.revealEvent, {
    roomId: props.roomId,
    visibility: !props.isVisible,
  })
}
</script>
