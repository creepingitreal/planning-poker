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
      @clear="isConfirmingClear = true"
    />

    <MessageModal
      :open="isConfirmingClear"
      title="Clear votes?"
      message="This will clear everyone's votes for this round."
      variant="warning"
      close-label="Cancel"
      confirm-label="Clear Votes"
      @dismiss="isConfirmingClear = false"
      @confirm="clearVotes"
    />

    <div class="vote-card-section">
      <Vote
        v-for="value in voteOptions"
        :key="value"
        :vote="value"
        :selected="selectedVote === value"
        :color="currentPlayerColour"
        selectable
        @select="castVote"
      />
    </div>
  </section>
</template>

<script setup>
import ButtonSection from '../../molecules/ButtonSection/ButtonSection.vue'
import MessageModal from '../../molecules/MessageModal/MessageModal.vue'
import socket from '../../../../socket.js'
import { computed, onUnmounted, ref } from 'vue'
import Vote from '../../atoms/Vote/Vote.vue'
import { COFFEE_VOTE } from '../../../js/votes.js'
import { allocateParticipantColours } from '../../../../../shared/colourAllocation.mjs'
import './poker.css'

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', COFFEE_VOTE]
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

const currentPlayerColour = computed(
  () => participantColours.value[props.players[socket.id]?.user] ?? null,
)

const selectedVote = ref(null)
const isConfirmingClear = ref(false)

const castVote = (value) => {
  selectedVote.value = value
  socket.emit('castVote', { roomId: props.room.roomId, vote: value })
}

const clearVotes = () => {
  isConfirmingClear.value = false
  socket.emit('clearVotes', { roomId: props.room.roomId })
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
