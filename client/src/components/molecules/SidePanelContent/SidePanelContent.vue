<template>
  <div class="content-item" :class="[title.toLowerCase(), { active }]">
    <div class="content-title" @click="$emit('openPanel')">
      <Icon :name="iconName" class-name="icon small" />
      <h2 v-if="showPanel" class="title">{{title}}</h2>
    </div>

    <slot v-if="showPanel" />
  </div>
</template>

<script setup>
const props = defineProps({
  showPanel: {
    type: Boolean,
    required: true,
  },
  iconName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  // Highlights sections that represent the screen currently on display.
  active: {
    type: Boolean,
    default: false,
  },
//   openPanel: {
//     type: Boolean,
//     required: true,
//   },
});

const emits = defineEmits(['openPanel']);
</script>
