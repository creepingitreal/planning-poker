<template>
  <div>
    <RouterView />
    <MessageModal
      :open="!!currentMessage"
      :message="currentMessage?.message ?? ''"
      :title="currentMessage?.title ?? ''"
      :variant="currentMessage?.variant ?? 'info'"
      :close-label="currentMessage?.closeLabel ?? 'OK'"
      @dismiss="dismissMessage"
    />
  </div>
</template>

<script setup>
import './style.css'
import MessageModal from './components/molecules/MessageModal/MessageModal.vue'
import { currentMessage, dismissMessage } from './js/messages.js'
</script>
