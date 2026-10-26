<template>
  <div>
    <div
      class="nav-bar"
      :class="{ 'no-padding-bottom': currentRoom.roomName !== '' }"
    >
      <div class="nav-header">
        <nav class="logo-wrapper">
          <RouterLink :to="logoLink">
            <div class="logo">
              <Icon name="scrumble-logo" />
            </div>
          </RouterLink>
          <p v-if="currentRoom.roomName" class="nav-bar-room-name">
            {{ currentRoom.roomName }}
          </p>
        </nav>
        <button
          v-if="currentRoom.roomId"
          class="icon-only users-drawer-trigger"
          type="button"
          aria-label="Open users drawer"
          title="Open users"
          @click="showUsersDrawer = true"
        >
          <span aria-hidden="true">☰</span>
        </button>
        <UsersDrawer
          :open="showUsersDrawer"
          :players="roomPlayers"
          :allow-manual="activeTool === 'wheel'"
          :manual-names="wheelManualNames"
          @close="showUsersDrawer = false"
          @update:manual-names="wheelManualNames = $event"
        />
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
      <RouterView />
    </main>
  </div>
</template>

<script setup>
  import "./style.css";
  import SubNav from "./components/SubNav/SubNav.vue";
  import UsersDrawer from "./components/UsersDrawer/UsersDrawer.vue";
  import Icon from "./assets/shared/Icon.vue";
  import { computed } from "vue";
  import {
    activeTool,
    showTools,
    currentRoom,
    showUsersDrawer,
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
