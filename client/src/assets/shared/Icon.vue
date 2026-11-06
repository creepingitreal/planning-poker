<template>
  <component :is="icon" :class="className" />
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: 'fill-current text-current',
  },
})

const icon = defineAsyncComponent(() => import(`../svg/${props.name}.svg`))
</script>

<style>
/* Ensure the SVG respects the class height */
svg {
  width: auto;
  height: auto;
}
</style>
