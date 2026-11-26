<template>
  <div class="side-panel-wrapper">
    <Transition name="side-panel-backdrop">
      <div class="side-panel-backdrop" v-if="showPanel" @click="closePanel"></div>
    </Transition>
    <aside
      class="side-panel"
      :class="{ open: showPanel }"
      aria-label="Session users"
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
          <Transition name="side-panel-logo" mode="out-in">
            <img
              :key="showPanel ? 'full' : 'mark'"
              class="brand-logo"
              :src="showPanel ? brand.logoUrl : brand.logoMarkUrl"
              :alt="brand.logoAlt"
              :class="{ 'brand-logo-mark': !showPanel }"
            />
          </Transition>
        </button>
        <Transition name="side-panel-fade">
          <button
            v-if="showPanel"
            class="icon-only side-panel-close"
            type="button"
            aria-label="Close side panel"
            @click="closePanel"
          >
            ✕
          </button>
        </Transition>
      </div>

      <div class="side-panel-content">
        <RouterLink
          to="/dashboard"
          class="content-item dashboard"
          title="Go to dashboard"
          aria-label="Go to dashboard"
          @click="showPanel = false"
        >
          <span class="content-title">
            <Icon name="dashboard-icon" class-name="icon small" />
            <Transition name="side-panel-fade">
              <span v-if="showPanel" class="title">Dashboard</span>
            </Transition>
          </span>
        </RouterLink>
        <SidePanelContent
          :show-panel="showPanel"
          icon-name="tools-icon"
          title="Tools"
          :active="activeTool !== ''"
          @open-panel="showPanel = true"
        >
          <SubNav
            :has-room="currentRoom.roomId !== ''"
            :active-tool="activeTool"
            :tab-names="tabNames"
            @update:active-tool="emit('selectTool', $event)"
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
            <li><a href="#">More about the app</a></li>
            <li><a href="#">More about the author</a></li>
          </ul>
        </SidePanelContent>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { brand } from '../../../brand/index.js'
import { currentRoom } from '../../../js/roomNav.js'
import Users from '../Users/Users.vue'
import SubNav from '../../molecules/SubNav/SubNav.vue'
import './side-panel.css'
import SidePanelContent from '../../molecules/SidePanelContent/SidePanelContent.vue'

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
  activeTool: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:manualNamesArr', 'selectTool'])
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
