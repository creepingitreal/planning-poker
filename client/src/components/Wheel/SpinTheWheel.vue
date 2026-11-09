<template>
  <section class="wheel-tool">
    <VueWheelSpinner
      ref="spinner"
      :slices="slices"
      :slice-font-style="sliceFontStyle"
      :slice-text-position="sliceTextPosition"
      :winner-index="safeWinnerIndex"
      :sounds="silentSounds"
      :cursor-angle="cursorAngle"
      :cursor-position="cursorPosition"
      :cursor-distance="cursorDistance"
      @spin-start="onSpinStart"
      @spin-end="onSpinEnd"
    >
      <template #default>
        <button
          class="spin-button"
          :disabled="isSpinning || !participantNames.length"
          @click="handleSpinButtonClick"
        >
          <Icon name="arrow-icon" class="spinner-arrow" />
        </button>
      </template>
    </VueWheelSpinner>
  </section>
</template>

<script>
import VueWheelSpinner from 'vue-wheel-spinner'
import { allocateParticipantColours } from '../../../../shared/colourAllocation.mjs'
import './spin-the-wheel.css'
import Icon from '../../assets/shared/Icon.vue'

export default {
  components: {
    VueWheelSpinner,
  },
  props: {
    players: {
      type: Object,
      default: () => ({}),
    },
    manualNames: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      winnerResult: null,
      sliceFontStyle: 'bold 16px Arial',
      sliceTextPosition: 'edge',
      isSpinning: false,
      defaultWinner: 0,
      cursorAngle: 0,
      cursorPosition: 'edge',
      cursorDistance: 0,
      silentSounds: {
        spinning: null,
        won: null,
      },
      resizeObserver: null,
    }
  },
  computed: {
    onlineNames() {
      return Object.values(this.players)
        .map((player) => player.user)
        .filter(Boolean)
    },
    participantNames() {
      return [...new Set([...this.onlineNames, ...this.manualNames])]
    },
    assignedColors() {
      return Object.values(this.players).reduce((colors, player) => {
        if (player.user && player.color) colors[player.user] = player.color
        return colors
      }, {})
    },
    participantColors() {
      return allocateParticipantColours(
        this.participantNames,
        this.assignedColors,
      )
    },
    slices() {
      return this.participantNames.map((name, index) => ({
        color: this.participantColors[name],
        text: name,
        textColor: index % 3 === 1 ? '#ffffff' : '#000000',
      }))
    },
    safeWinnerIndex() {
      return Math.min(this.defaultWinner, Math.max(0, this.slices.length - 1))
    },
  },
  methods: {
    handleSpinButtonClick() {
      this.$refs.spinner.spinWheel(this.safeWinnerIndex)
    },
    spinFor(index) {
      this.defaultWinner = index
      this.$refs.spinner.spinWheel(index)
    },
    onSpinStart() {
      this.winnerResult = null
      this.isSpinning = true
    },
    onSpinEnd(winnerIndex) {
      this.isSpinning = false
      this.winnerResult = this.slices[winnerIndex]
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) {
        this.$refs.spinner.drawWheel()
      }
    })
    this.resizeObserver.observe(this.$el)
  },
  beforeUnmount() {
    this.resizeObserver?.disconnect()
  },
}
</script>
