import { computed, ref } from 'vue'

const messages = ref([])

export const currentMessage = computed(() => messages.value[0] ?? null)

export const showMessage = (message, options = {}) => {
  messages.value.push({
    message,
    title: options.title ?? '',
    variant: options.variant ?? 'info',
    closeLabel: options.closeLabel ?? 'OK',
  })
}

export const dismissMessage = () => {
  messages.value.shift()
}
