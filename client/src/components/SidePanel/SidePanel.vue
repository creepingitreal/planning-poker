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
      <button
        @click="showPanel = !showPanel"
        class="logo"
        type="button"
        :aria-label="`${brand.name}: ${showPanel ? 'Close' : 'Open'} side panel`"
        :aria-expanded="showPanel"
      >
        <img
          class="brand-logo"
          :src="showPanel ? brand.logoUrl : brand.logoMarkUrl"
          :alt="brand.logoAlt"
          :class="{ 'brand-logo-mark': !showPanel }"
        />
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
          :players="players"
          :allow-manual="allowManual"
          :manual-names="allowManual ? manualNamesArr : []"
          @update:manual-names="emit('update:manualNamesArr', $event)"
        />
      </SidePanelContent>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { brand } from '../../brand/index.js'
import Users from '../Users/Users.vue'
import SubNav from '../SubNav/SubNav.vue'
import { activeTool, showTools, currentRoom } from '../../js/roomNav.js'
import './side-panel.css'
import SidePanelContent from './SidePanelContent.vue'

defineProps({
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

const emit = defineEmits(['update:manualNamesArr'])
const showPanel = ref(false)

const tabNames = ['poker', 'retro', 'wheel']
</script>
