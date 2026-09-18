<template>
  <nav class="subnav tool-tabs" v-if="showToolSubnav">
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
</template>

<script setup>
defineProps({
  showToolSubnav: {
    type: Boolean,
    required: true,
  },
  activeTool: {
    type: String,
    required: true,
  },
  tabNames: {
    type: Array,
    required: true,
  },
});

defineEmits(["update:activeTool"]);

const tabLabels = {
  poker: "Planning Poker",
  retro: "Retro Board",
  wheel: "Spin the Wheel",
};
</script>
