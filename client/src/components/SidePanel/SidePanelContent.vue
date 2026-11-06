<template>
  <div class="content-item">
    <div class="content-title" :class="title.toLowerCase()" @click="$emit('openPanel')">
      <Icon :name="iconName" class-name="icon" />
      <h1 v-if="showPanel">{{title}}</h1>
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
//   openPanel: {
//     type: Boolean,
//     required: true,
//   },
});

const emits = defineEmits(['openPanel']);
</script>
