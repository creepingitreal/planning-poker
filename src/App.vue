<template>
  <div>
    <nav class="p-4 bg-gray-800 text-white">
      <router-link to="/" class="mr-4">Create Room</router-link>
      <router-link to="/join">Join Room</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>
