<template>
  <component
    :is="as"
    ref="cardElement"
    class="retro-card"
    :class="{ 'retro-card-hidden': hidden }"
    :style="retroCardStyle"
  >
    <div v-if="iconButtons.length" class="card-actions">
      <button
        v-for="button in iconButtons"
        :key="button.name"
        type="button"
        class="icon-only card-icon-btn"
        :class="button.class"
        @click="handleIconClick(button.name)"
        :aria-label="button.label"
        :title="button.title"
      >
        {{ button.icon }}
      </button>
    </div>

    <slot />

    <button
      v-if="showLike"
      type="button"
      class="card-like-button"
      :class="{ liked }"
      :aria-label="liked ? 'Unlike card' : 'Like card'"
      :title="liked ? 'Unlike' : 'Like'"
      @click="toggleLike"
    >
      <span aria-hidden="true">♥</span>
      <span>{{ likes }}</span>
    </button>
  </component>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getContrastingTextColour } from '../../../../shared/colourAllocation.mjs'
import './retro-card.css'

const props = defineProps({
  as: {
    type: String,
    default: 'div',
  },
  color: {
    type: String,
    default: null,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  iconButtons: {
    type: Array,
    default: () => [],
  },
  likes: {
    type: Number,
    default: 0,
  },
  liked: {
    type: Boolean,
    default: false,
  },
  showLike: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['icon-click', 'like'])

const cardElement = ref(null)

const handleIconClick = (buttonName) => {
  emit('icon-click', buttonName)
}

const toggleLike = () => {
  if (!props.showLike || props.hidden) return
  emit('like')
}

const retroCardStyle = computed(() => {
  if (!props.color) return {}

  return {
    backgroundColor: props.color,
    borderColor: props.color,
    color: getContrastingTextColour(props.color),
  }
})

defineExpose({
  cardElement,
})
</script>
