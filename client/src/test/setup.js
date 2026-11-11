import { afterEach, beforeEach, vi } from 'vitest'
import { config, enableAutoUnmount } from '@vue/test-utils'
import {
  activeTool,
  clearCurrentRoom,
  roomPlayers,
  showTools,
  wheelManualNames,
} from '../js/roomNav.js'

vi.mock('../../socket.js', () => ({
  default: {
    id: 'test-socket',
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}))

vi.mock('../assets/shared/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['icon'],
    template: '<span :data-icon="icon" />',
  },
}))

enableAutoUnmount(afterEach)
config.global.stubs.Icon = true

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  activeTool.value = 'poker'
  clearCurrentRoom()
  roomPlayers.value = {}
  showTools.value = false
  wheelManualNames.value = []
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
