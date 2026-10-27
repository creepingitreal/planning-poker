<template>
  <div v-if="open" class="side-panel-backdrop" @click="$emit('close')"></div>
  <aside
    class="side-panel"
    :class="{ open }"
    aria-label="Room users"
    :aria-hidden="!open"
  >
    <div class="side-panel-header">
      <button @click="showSidePanel = !showSidePanel"  class="logo">
        <div v-if="open">
          <Icon name="scrumble-logo" />
        </div>
        <div v-else="open">
          <Icon name="scrumble-icon" />
        </div>
      </button>
      <button v-if="open"
        class="icon-only side-panel-close"
        type="button"
        aria-label="Close side panel"
        @click="showSidePanel = !showSidePanel"
      >
        ✕
      </button>
    </div>

    <div v-if="open" class="side-panel-content">
      <h2>Users</h2>
      <ul class="user-list">
        <li v-for="player in roomUsers" :key="player.id" class="user-list-item">
          <span
            class="user-colour-dot"
            :style="{ backgroundColor: participantColours[player.user] }"
          ></span>
          <span>{{ player.user }}</span>
          <small>In room</small>
        </li>
        <li
          v-for="name in manualNames"
          :key="`manual-${name}`"
          class="side-panel-list-item"
        >
          <span
            class="user-colour-dot"
            :style="{ backgroundColor: participantColours[name] }"
          ></span>
          <span>{{ name }}</span>
          <button
            v-if="allowManual"
            class="remove-manual-user"
            type="button"
            :aria-label="`Remove ${name}`"
            @click="removeManualName(name)"
          >
            ×
          </button>
        </li>
        <li v-if="!roomUsers.length && !manualNames.length" class="empty-users">
          No users have joined yet.
        </li>
      </ul>
  
      <form
        v-if="allowManual"
        class="add-user-form"
        @submit.prevent="addManualName"
      >
        <input
          v-model="newName"
          type="text"
          placeholder="Add someone outside the room"
          aria-label="Add someone outside the room"
        />
        <button type="submit">Add</button>
      </form>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from "vue";
import { allocateParticipantColors } from "../../js/colorAllocation.js";
import { showSidePanel } from "../../js/roomNav.js";
import "./side-panel.css";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  players: {
    type: Object,
    default: () => ({}),
  },
  allowManual: {
    type: Boolean,
    default: false,
  },
  manualNames: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:manualNames"]);
const newName = ref("");

const roomUsers = computed(() =>
  Object.entries(props.players).map(([id, player]) => ({
    id,
    user: player.user,
    color: player.color,
  })),
);

const participantColours = computed(() => {
  const assignedColours = Object.fromEntries(
    roomUsers.value
      .filter((player) => player.user && player.color)
      .map((player) => [player.user, player.color]),
  );
  const participantNames = [
    ...new Set([
      ...roomUsers.value.map((player) => player.user).filter(Boolean),
      ...props.manualNames,
    ]),
  ];

  return allocateParticipantColors(participantNames, assignedColours);
});

const addManualName = () => {
  const name = newName.value.trim();
  const alreadyIncluded = [...roomUsers.value, ...props.manualNames].some(
    (participant) => {
      const participantName =
        typeof participant === "string" ? participant : participant.user;
      return participantName?.toLowerCase() === name.toLowerCase();
    },
  );

  if (!name || alreadyIncluded) return;

  emit("update:manualNames", [...props.manualNames, name]);
  newName.value = "";
};

const removeManualName = (name) => {
  emit(
    "update:manualNames",
    props.manualNames.filter((participant) => participant !== name),
  );
};
</script>
