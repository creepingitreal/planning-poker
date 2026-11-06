<template>
  <div class="subnav">
    <nav class="subnav tool-tabs" v-if="showTools && hasRoom">
      <button
        v-for="tabName in tabNames"
        :key="tabName"
        class="tool-tab"
        :class="{ active: activeTool === tabName }"
        @click="$emit('update:activeTool', tabName)"
      >
        {{ tabLabels[tabName] ?? tabName }}
      </button>
    </nav>
  </div>
</template>

<script setup>
import './sub-nav.css'

defineProps({
  showTools: {
    type: Boolean,
    required: true,
  },
  hasRoom: {
    type: Boolean,
    default: false,
  },
  activeTool: {
    type: String,
    required: true,
  },
  tabNames: {
    type: Array,
    required: true,
  },
})

defineEmits(['update:activeTool'])

const tabLabels = {
  poker: 'Planning Poker',
  retro: 'Retro Board',
  wheel: 'Spin the Wheel',
}
</script>
