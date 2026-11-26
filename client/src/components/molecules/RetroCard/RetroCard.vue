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

    <div v-if="showLike" class="card-like-controls">
      <button
        v-if="myLikes > 0"
        type="button"
        class="card-unlike-button"
        aria-label="Remove one of your likes"
        title="Remove one of your likes"
        @click="unlikeCard"
      >
        −
      </button>
      <button
        type="button"
        class="card-like-button"
        :class="{ liked: myLikes > 0 }"
        :aria-label="likeLabel"
        :title="likeLabel"
        @click="likeCard"
      >
        <span aria-hidden="true">{{ myLikes > 0 ? '♥' : '♡' }}</span>
        <span>{{ likes }}</span>
      </button>
    </div>
  </component>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getContrastingTextColour } from '../../../../../shared/colourAllocation.mjs'
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
  myLikes: {
    type: Number,
    default: 0,
  },
  showLike: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['icon-click', 'like', 'unlike'])

const cardElement = ref(null)

const handleIconClick = (buttonName) => {
  emit('icon-click', buttonName)
}

const likeCard = () => {
  if (!props.showLike || props.hidden) return
  emit('like')
}

const unlikeCard = () => {
  if (!props.showLike || props.hidden || props.myLikes <= 0) return
  emit('unlike')
}

const likeLabel = computed(() => {
  if (!props.myLikes) return 'Like card'
  return `Like card again (you liked ${props.myLikes} ${props.myLikes === 1 ? 'time' : 'times'})`
})

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
