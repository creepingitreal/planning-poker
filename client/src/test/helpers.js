import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import socket from '../../socket.js'

export const createTestRouter = async (path = '/', state) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/dashboard', '/room/:roomId'].map((routePath) => ({
      path: routePath,
      component: { template: '<div />' },
    })),
  })

  await router.push(state ? { path, state } : path)
  await router.isReady()
  return router
}

export const receiveSocketEvent = async (event, ...args) => {
  const handlers = socket.on.mock.calls
    .filter(([registeredEvent]) => registeredEvent === event)
    .map(([, handler]) => handler)

  if (!handlers.length) throw new Error(`No socket listener for ${event}`)

  handlers.forEach((handler) => handler(...args))
  await nextTick()
}
