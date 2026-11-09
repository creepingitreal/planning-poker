<template>
  <div
    class="vote"
    :class="isVisible ? 'visible' : ''"
    :style="
      color
        ? { backgroundColor: color, color: getContrastingTextColour(color) }
        : {}
    "
    v-if="vote !== null"
  >
    <p v-if="isVisible">{{ vote }}</p>
  </div>
</template>

<script setup>
import { getContrastingTextColour } from '../../../../shared/colourAllocation.mjs'
import './vote.css'
defineProps({
  vote: {
    type: [Number, null],
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  color: {
    type: String,
    default: null,
  },
})
</script>
