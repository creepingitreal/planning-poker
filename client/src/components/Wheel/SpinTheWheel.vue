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
import { getContrastingTextColour } from '../../../../shared/colourAllocation.mjs'
import { allocateRoomParticipantColours } from '../../js/roomNav.js'
import './spin-the-wheel.css'

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
      sliceFontStyle: 'bold 16px sans-serif',
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
      return allocateRoomParticipantColours(
        this.participantNames,
        this.assignedColors,
      )
    },
    slices() {
      return this.participantNames.map((name) => ({
        color: this.participantColors[name],
        text: name,
        textColor: getContrastingTextColour(this.participantColors[name]),
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
    const styles = getComputedStyle(this.$el)
    const font =
      styles.getPropertyValue('--font-wheel').trim() ||
      styles.fontFamily ||
      'sans-serif'
    this.sliceFontStyle = `bold 16px ${font}`
    document.fonts?.ready.then(() => this.$refs.spinner?.drawWheel())
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
