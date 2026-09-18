<template>
  <div>
    <div class="nav-bar" :class="{ 'no-padding-bottom': showToolSubnav }">
      <nav>
        <RouterLink to="/">
          <div class="logo">
            <img id="logo" :src="logoWhite" alt="procode-nundrum logo" />
          </div>
        </RouterLink>
      </nav>
      <SubNav
        :show-tool-subnav="showToolSubnav"
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
import { activeTool, showToolSubnav } from "./js/roomNav.js";

const tabNames = ["poker", "retro", "wheel"];
</script>
