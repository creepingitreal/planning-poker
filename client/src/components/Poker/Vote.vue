<template>
  <div
    class="vote"
    :class="isVisible ? 'visible' : ''"
    :style="color ? { backgroundColor: color } : {}"
    v-if="vote !== null"
  >
    <p v-if="isVisible">{{ vote }}</p>
  </div>
</template>

<script setup>
import './vote.css'
const props = defineProps({
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
