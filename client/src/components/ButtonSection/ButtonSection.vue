<template>
  <div class="button-section">
    <button
      v-if="showReveal"
      @click="toggleVisibility"
      :disabled="!hasVotes"
      class="reveal-btn"
    >
      {{ isVisible ? hideLabel : revealLabel }}
    </button>
    <button @click="clearBoard" class="secondary-blue">{{ clearLabel }}</button>
  </div>
</template>

<script setup>
  import socket from "../../../socket.js";

  const props = defineProps({
    isVisible: {
      type: Boolean,
      required: true,
    },
    hasVotes: {
      type: Boolean,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    revealEvent: {
      type: String,
      default: "revealVotes",
    },
    clearEvent: {
      type: String,
      default: "clearVotes",
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

  const toggleVisibility = () => {
    socket.emit(props.revealEvent, {
      roomId: props.roomId,
      visibility: !props.isVisible,
    });
  };

  const clearBoard = () => {
    socket.emit(props.clearEvent, { roomId: props.roomId });
  };
</script>
