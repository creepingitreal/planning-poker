<template>
  <div class="button-section">
    <button
      v-if="showReveal"
      @click="revealVotes(!isVisible)"
      :disabled="!hasVotes"
      class="reveal-btn"
    >
      {{ isVisible ? hideLabel : revealLabel }}
    </button>
    <button @click="clearVotes" class="secondary-blue">{{ clearLabel }}</button>
  </div>
</template>

<script setup>
  import { defineProps } from "vue";

  const props = defineProps({
    isVisible: {
      type: Boolean,
      required: true,
    },
    hasVotes: {
      type: Boolean,
      required: true,
    },
    revealVotes: {
      type: Function,
      required: true,
    },
    clearVotes: {
      type: Function,
      required: true,
    },
    showReveal: {
      type: Boolean,
      default: true,
    },
    revealLabel: {
      type: String,
      default: "Reveal Votes",
    },
    hideLabel: {
      type: String,
      default: "Hide Votes",
    },
    clearLabel: {
      type: String,
      default: "Clear Votes",
    },
  });
</script>
