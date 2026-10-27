<template>
  <div>
    <div
      class="nav-bar"
      :class="{ 'no-padding-bottom': currentRoom.roomName !== '' }"
    >
      <div class="nav-header">
        <nav class="logo-wrapper">
          <p v-if="currentRoom.roomName" class="nav-bar-room-name">
            {{ currentRoom.roomName }}
          </p>
        </nav>
      </div>
      <SubNav
        :show-tools="showTools"
        :has-room="currentRoom.roomName !== ''"
        :active-tool="activeTool"
        :tab-names="tabNames"
        @update:active-tool="activeTool = $event"
      />
    </div>
    <main>
      <SidePanel 
          v-if="currentRoom.roomId"
          :open="showSidePanel"
          :players="roomPlayers"
          :manual-names="wheelManualNames"
          @toggle="showSidePanel = !showSidePanel"
          @update:manual-names="wheelManualNames = $event" 
          />  
          
      <RouterView />
    </main>
  </div>
</template>

<script setup>
  import "./style.css";
  import SubNav from "./components/SubNav/SubNav.vue";
  import UsersDrawer from "./components/UsersDrawer/UsersDrawer.vue";
  import SidePanel from "./components/SidePanel/SidePanel.vue";
  import Icon from "./assets/shared/Icon.vue";
  import { computed } from "vue";
  import {
    activeTool,
    showTools,
    currentRoom,
    showSidePanel,
    roomPlayers,
    wheelManualNames,
  } from "./js/roomNav.js";

  const tabNames = ["poker", "retro", "wheel"];

  const logoLink = computed(() =>
    currentRoom.value.roomId
      ? {
          path: "/dashboard",
          query: {
            roomId: currentRoom.value.roomId,
            roomName: currentRoom.value.roomName,
          },
        }
      : { path: "/" },
  );
</script>
