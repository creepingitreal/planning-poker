<template>
  <div
    class="side-panel-backdrop"
    v-if="showPanel"
    @click="showPanel = false"
  ></div>
  <aside
    class="side-panel"
    :class="{ open: showPanel }"
    aria-label="Room users"
    :aria-hidden="!showPanel"
  >
    <div class="side-panel-header">
      <button @click="showPanel = !showPanel" class="logo">
          <Icon v-if="showPanel" name="scrumble-logo" class="icon"/>
          <Icon v-else name="scrumble-icon" class="icon"/>
      </button>
      <button
        v-if="showPanel"
        class="icon-only side-panel-close"
        type="button"
        aria-label="Close side panel"
        @click="showPanel = !showPanel"
      >
        ✕
      </button>
    </div>

    <div class="side-panel-content">
      <SidePanelContent 
        :show-panel="showPanel"
        icon-name="tools-icon"
        title="Tools"
        @open-panel="showPanel = true"
      >
        <SubNav
          :show-tools="showTools"
          :has-room="currentRoom.roomName !== ''"
          :active-tool="activeTool"
          :tab-names="tabNames"
          @update:active-tool="activeTool = $event"
        />
      </SidePanelContent>
      <SidePanelContent
        :show-panel="showPanel"
        icon-name="user-icon"
        title="Users"
        @open-panel="showPanel = true"
      >
        <Users
          :open="showPanel"
          :players="roomUsers"
          :manual-names="manualNamesArr"
          @update:manual-names="manualNamesArr = $event"
        />
      </SidePanelContent>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import Users from '../Users/Users.vue'
import SubNav from '../SubNav/SubNav.vue'
import { activeTool, showTools, currentRoom } from '../../js/roomNav.js'
import './side-panel.css'
import SidePanelContent from './SidePanelContent.vue'

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
})

const showPanel = ref(false)

const roomUsers = computed(() =>
  Object.entries(props.players).map(([id, player]) => ({
    id,
    user: player.user,
    color: player.color,
  })),
)

const tabNames = ['poker', 'retro', 'wheel']
</script>
