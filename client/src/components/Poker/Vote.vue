<template>
  <component
    :is="selectable ? 'button' : 'div'"
    v-if="vote !== null"
    :type="selectable ? 'button' : undefined"
    :class="cardClass"
    :style="cardStyle"
    @click="selectVote"
  >
    <template v-if="isVisible">
      <Icon
        v-if="vote === COFFEE_VOTE"
        name="coffee-icon"
        class="icon"
        role="img"
        aria-label="Coffee break"
      />
      <span v-else>{{ vote }}</span>
    </template>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { getContrastingTextColour } from '../../../../shared/colourAllocation.mjs'
import { COFFEE_VOTE } from '../../js/votes.js'
import './vote.css'

const props = defineProps({
  vote: {
    type: [Number, String, null],
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
  selectable: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const cardClass = computed(() =>
  props.selectable
    ? ['vote-option', { selected: props.selected }]
    : ['vote', { visible: props.isVisible }],
)

const cardStyle = computed(() => {
  if (!props.color) return {}

  const textColour = getContrastingTextColour(props.color)
  // Options use variables so the stylesheet's hover state still applies.
  return props.selectable
    ? { '--vote-bg': props.color, '--vote-fg': textColour }
    : { backgroundColor: props.color, color: textColour }
})

const selectVote = () => {
  if (props.selectable) emit('select', props.vote)
}
</script>
