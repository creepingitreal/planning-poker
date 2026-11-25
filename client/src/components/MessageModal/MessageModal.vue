<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="message-modal"
      :class="variant"
      :role="
        variant === 'warning' || variant === 'error' ? 'alertdialog' : 'dialog'
      "
      aria-modal="true"
      :aria-labelledby="`${id}-title`"
      :aria-describedby="`${id}-message`"
      @cancel.prevent="dismiss"
    >
      <h2 :id="`${id}-title`" class="message-modal-title">{{ heading }}</h2>
      <p :id="`${id}-message`" class="message-modal-message">{{ message }}</p>
      <div class="message-modal-actions">
        <button ref="closeButton" type="button" @click="dismiss">
          {{ closeLabel }}
        </button>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, useId, watchPostEffect } from 'vue'
import './message-modal.css'

const props = defineProps({
  open: { type: Boolean, default: false },
  message: { type: String, required: true },
  title: { type: String, default: '' },
  variant: {
    type: String,
    default: 'info',
    validator: (value) =>
      ['info', 'success', 'warning', 'error'].includes(value),
  },
  closeLabel: { type: String, default: 'OK' },
})
const emit = defineEmits(['dismiss'])
const dialog = ref(null)
const closeButton = ref(null)
const id = useId()
let previousFocus = null
let previousOverflow = ''

const heading = computed(
  () =>
    props.title ||
    {
      info: 'Message',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
    }[props.variant],
)

const dismiss = () => emit('dismiss')

const closeDialog = () => {
  if (!dialog.value?.open) return
  dialog.value.close()
  document.body.style.overflow = previousOverflow
  if (previousFocus?.isConnected) previousFocus.focus()
}

watchPostEffect(() => {
  if (!props.open) {
    closeDialog()
    return
  }
  if (!dialog.value || dialog.value.open) return
  previousFocus = document.activeElement
  previousOverflow = document.body.style.overflow
  dialog.value.showModal()
  document.body.style.overflow = 'hidden'
  closeButton.value.focus()
})

onBeforeUnmount(closeDialog)
</script>
