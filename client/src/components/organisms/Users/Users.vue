<template>
  <div>
    <ul class="users-list">
      <li v-for="player in roomUsers" :key="player.id" class="users-list-item">
        <span
          class="user-colour-dot"
          :style="{ backgroundColor: participantColours[player.user] }"
        ></span>
        <span>{{ player.user }}{{ player.isCurrentUser ? ' (you)' : '' }}</span>
        <small>In session</small>
      </li>
      <li
        v-for="name in manualNames"
        :key="`manual-${name}`"
        class="users-list-item"
      >
        <span
          class="user-colour-dot"
          :style="{ backgroundColor: participantColours[name] }"
        ></span>
        <span>{{ name }}</span>
        <button
          v-if="allowManual"
          class="icon-only user-icon-btn remove-manual-user"
          type="button"
          :aria-label="`Remove ${name}`"
          @click="removeManualName(name)"
        >
          ×
        </button>
      </li>
      <li v-if="!roomUsers.length && !manualNames.length" class="empty-users">
        No users have joined yet.
      </li>
    </ul>

    <form
      v-if="allowManual"
      class="add-user-form"
      @submit.prevent="addManualName"
    >
      <input
        v-model="newName"
        type="text"
        autocomplete="name"
        class="manual-user-input"
        placeholder="Add someone outside the session"
        aria-label="Add someone outside the session"
      />
      <button
        type="submit"
        class="icon-only user-icon-btn"
        aria-label="Add person"
      >
        +
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import socket from '../../../../socket.js'
import { allocateRoomParticipantColours } from '../../../js/roomNav.js'
import './users.css'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  players: {
    type: Object,
    default: () => ({}),
  },
  allowManual: {
    type: Boolean,
    default: false,
  },
  manualNames: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'update:manualNames'])
const newName = ref('')

const roomUsers = computed(() =>
  Object.entries(props.players).map(([id, player]) => ({
    id,
    user: player.user,
    color: player.color,
    isCurrentUser: id === socket.id,
  })),
)

const participantColours = computed(() => {
  const assignedColours = Object.fromEntries(
    roomUsers.value
      .filter((player) => player.user && player.color)
      .map((player) => [player.user, player.color]),
  )
  const participantNames = [
    ...new Set([
      ...roomUsers.value.map((player) => player.user).filter(Boolean),
      ...props.manualNames,
    ]),
  ]

  return allocateRoomParticipantColours(participantNames, assignedColours)
})

const addManualName = () => {
  const name = newName.value.trim()
  const alreadyIncluded = [...roomUsers.value, ...props.manualNames].some(
    (participant) => {
      const participantName =
        typeof participant === 'string' ? participant : participant.user
      return participantName?.toLowerCase() === name.toLowerCase()
    },
  )

  if (!name || alreadyIncluded) return

  emit('update:manualNames', [...props.manualNames, name])
  newName.value = ''
}

const removeManualName = (name) => {
  emit(
    'update:manualNames',
    props.manualNames.filter((participant) => participant !== name),
  )
}
</script>
