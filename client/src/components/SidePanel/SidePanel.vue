<template>
  <div class="side-panel-backdrop" v-if="showPanel" @click="showPanel = false"></div>
  <aside
    class="side-panel"
    :class="{ 'open': showPanel }"
    aria-label="Room users"
    :aria-hidden="!showPanel"
  >
    <div class="side-panel-header">
      <button @click="showPanel = !showPanel"  class="logo">
        <div v-if="showPanel">
          <Icon name="scrumble-logo" />
        </div>
        <div v-else="showPanel">
          <Icon name="scrumble-icon" />
        </div>
      </button>
      <button v-if="showPanel"
        class="icon-only side-panel-close"
        type="button"
        aria-label="Close side panel"
        @click="showPanel = !showPanel"
      >
        ✕
      </button>
    </div>

    <div class="side-panel-content">
        <div class="content-item">
        <button @click="showPanel = true" class="content-title">
          <Icon name="user-icon" class-name="icon"/>
          <h1 v-if="showPanel">Users</h1>
        </button>
        
        <Users v-if="showPanel"
          :open="showPanel"
          :players="roomUsers"
          :manual-names="manualNamesArr"
          @update:manual-names="manualNamesArr = $event" 
        />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from "vue";
import Users from "../Users/Users.vue";
import "./side-panel.css";

const props = defineProps({
  players: {
    type: Object,
    default: () => ({}),
  },
  allowManual: {
    type: Boolean,
    default: false,
  },
  manualNamesArr: {
    type: Array,
    default: () => [],
  },
});

const showPanel = ref(false);

const roomUsers = computed(() =>
  Object.entries(props.players).map(([id, player]) => ({
    id,
    user: player.user,
    color: player.color,
  })),
);
</script>
