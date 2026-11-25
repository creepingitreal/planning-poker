<template>
  <div class="side-panel-backdrop" v-if="showPanel" @click="closePanel"></div>
  <aside
    class="side-panel"
    :class="{ open: showPanel }"
    aria-label="Room users"
  >
    <div class="side-panel-header">
      <button
        ref="logoButton"
        @click="togglePanel"
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
        @click="closePanel"
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
      <SidePanelContent
        :show-panel="showPanel"
        icon-name="info-icon"
        title="Info"
        @open-panel="showPanel = true"
      >
      <p class="info-text">Find out more about the app</p>
      <ul>
        <li><a href="#" >More about the app</a></li>
        <li><a href="#" >More about the author</a></li>
      </ul>
    </SidePanelContent>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { brand } from '../../brand/index.js'
import { activeTool, currentRoom, showTools } from '../../js/roomNav.js'
import Users from '../Users/Users.vue'
import SubNav from '../SubNav/SubNav.vue'
import './side-panel.css'
import SidePanelContent from './SidePanelContent.vue'
import Icon from '../../assets/shared/Icon.vue'

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
const logoButton = ref(null)

const tabNames = ['poker', 'retro', 'wheel']

function closePanel() {
  logoButton.value?.focus()
  showPanel.value = false
}

function togglePanel() {
  if (showPanel.value) {
    closePanel()
  } else {
    showPanel.value = true
  }
}
</script>
