<template>
  <div>
    <div class="nav-bar" :class="{ 'no-padding-bottom': showTools }">
      <div>
        <nav class="logo-wrapper">
          <RouterLink :to="logoLink">
            <div class="logo">
              <img id="logo" :src="logoWhite" alt="procode-nundrum logo" />
            </div>
          </RouterLink>
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
      <RouterView />
    </main>
  </div>
</template>

<script setup>
  import "./style.css";
  import logoWhite from "./svg/procode-logo-white.svg";
  import SubNav from "./components/SubNav/SubNav.vue";
  import { computed } from "vue";
  import { activeTool, showTools, currentRoom } from "./js/roomNav.js";

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
