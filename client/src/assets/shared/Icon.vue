<template>
  <component :is="icon" :class="class" />
</template>

<script setup>
  import { defineAsyncComponent } from 'vue';

  const props = defineProps({
    name: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      default: 'fill-current',
    },
  });


  const icon = defineAsyncComponent(() =>
    import(`../svg/${props.name}.svg`)
  );
</script>

