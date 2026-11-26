<template>
  <component :is="icon" :class="[className, { icon: isIcon }]" />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import './icon.css'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: 'fill-current text-current',
  },
  path: {
    type: String,
    required: false,
  },
  isIcon: {
    type: Boolean,
    default: true,
  },
})

const icons = import.meta.glob('../../../assets/svg/**/*.svg')

const icon = computed(() => {
  const path = props.path || `../../../assets/svg/${props.name}.svg`

  return defineAsyncComponent(async () => {
    const load = icons[path]
    if (!load) throw new Error(`Unknown icon path: ${path}`)
    return load()
  })
})
</script>

