<template>
  <section class="game-board section-layout">
    <div class="players-container">
      <div class="player" v-for="(player, id) in players || {}" :key="id">
        <Vote
          :vote="player.vote"
          :is-visible="isVisible"
          :color="participantColours[player.user]"
        />
      </div>
    </div>

    <ButtonSection
      :is-visible="isVisible"
      :has-votes="hasVotes"
      :room-id="room.roomId"
    />

    <div class="vote-card-section">
      <button
        class="vote-option"
        :class="{ selected: selectedVote === value }"
        v-for="value in voteOptions"
        :key="value"
        @click="castVote(value)"
      >
        {{ value }}
      </button>
    </div>
  </section>
</template>

<script setup>
import ButtonSection from '../ButtonSection/ButtonSection.vue'
import socket from '../../../socket.js'
import { computed, onUnmounted, ref } from 'vue'
import Vote from './Vote.vue'
import { allocateParticipantColours } from '../../../../shared/colourAllocation.mjs'
import './poker.css'

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?']
const isVisible = ref(false)

const props = defineProps({
  players: {
    type: Object,
    required: true,
  },
  room: {
    type: Object,
    required: true,
  },
})

const hasVotes = computed(() => {
  return Object.values(props.players).some((player) => player.vote !== null)
})

const participantColours = computed(() => {
  const players = Object.values(props.players)
  const assignedColours = Object.fromEntries(
    players
      .filter((player) => player.user && player.color)
      .map((player) => [player.user, player.color]),
  )
  const participantNames = [
    ...new Set(players.map((player) => player.user).filter(Boolean)),
  ]

  return allocateParticipantColours(participantNames, assignedColours)
})

const selectedVote = ref(null)

const castVote = (value) => {
  selectedVote.value = value
  socket.emit('castVote', { roomId: props.room.roomId, vote: value })
}

const handleToggleVisibility = (visibility) => {
  isVisible.value = visibility
}

const handleClearVotes = () => {
  selectedVote.value = null
}

socket.on('toggleVisibility', handleToggleVisibility)
socket.on('clearVotes', handleClearVotes)

onUnmounted(() => {
  socket.off('toggleVisibility', handleToggleVisibility)
  socket.off('clearVotes', handleClearVotes)
})
</script>
