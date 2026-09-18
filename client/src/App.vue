<template>
  <div>
    <div class="nav-bar"
    :class="{'no-padding-bottom': showToolSubnav}"
    >
      <nav>
        <RouterLink to="/">
          <div class="logo">
            <img
                id="logo"
                :src="logoWhite"
                alt="procode-nundrum logo"
            >
          </div>
        </RouterLink>
      </nav>
      <nav class="subnav tool-tabs" v-if="showToolSubnav">
        <button
            class="tool-tab"
            :class="{active: activeTool === 'poker'}"
            @click="activeTool = 'poker'"
        >
          Planning Poker
        </button>
        <button
            class="tool-tab"
            :class="{active: activeTool === 'retro'}"
            @click="activeTool = 'retro'"
        >
          Retro Board
        </button>
        <button
            class="tool-tab"
            :class="{active: activeTool === 'wheel'}"
            @click="activeTool = 'wheel'"
        >
          Spin the Wheel
        </button>
      </nav>
    </div>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
  import './style.css';
  import logoWhite from './svg/procode-logo-white.svg';
</script>