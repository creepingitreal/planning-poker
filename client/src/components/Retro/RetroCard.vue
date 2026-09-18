<template>
  <component
    :is="as"
    ref="cardElement"
    class="retro-card"
    :class="{ 'retro-card-hidden': hidden }"
    :style="retroCardStyle"
  >
    <div class="card-actions" v-if="iconButtons.length">
      <button
        v-for="button in iconButtons"
        :key="button.name"
        type="button"
        class="icon-only card-icon-btn"
        :class="button.class"
        @click="$emit('icon-click', button.name)"
        :aria-label="button.label"
        :title="button.title"
      >
        {{ button.icon }}
      </button>
    </div>

    <slot />
  </component>
</template>

<script setup>
import { computed, ref } from "vue";
import "./retro-card.css";

const props = defineProps({
  as: {
    type: String,
    default: "div",
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
});

defineEmits(["icon-click"]);

const cardElement = ref(null);
const pastelCardColor = computed(() =>
  props.color ? `color-mix(in srgb, ${props.color} 80%, white)` : null,
);
const retroCardStyle = computed(() => {
  if (!pastelCardColor.value) return {};

  return {
    backgroundColor: pastelCardColor.value,
    borderColor: pastelCardColor.value,
  };
});

defineExpose({
  cardElement,
});
</script>
