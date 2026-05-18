<template>
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
  <main>
    <RouterView />
  </main>
</template>

<script setup>
  import './style.css';
  import logoWhite from './svg/procode-logo-white.svg';
</script>