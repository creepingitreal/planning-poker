<template>
  <nav>
    <RouterLink to="/">
      <div class="logo">
        <img
            id="logo"
            src="./svg/logo-white.svg"
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
</script>