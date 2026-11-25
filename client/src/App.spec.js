import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from './App.vue'
import NavBar from './components/NavBar/NavBar.vue'
import { currentRoom } from './js/roomNav.js'
import appRouter from './router/index.js'

const mountApp = async (path) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: appRouter.options.routes,
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('App', () => {
  it('renders the nav bar from the layout with the current room', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const { wrapper } = await mountApp('/dashboard')

    expect(wrapper.findComponent(NavBar).props()).toMatchObject({
      roomId: 'room-one',
      roomName: 'Team',
      isRoomRoute: false,
    })
    expect(wrapper.get('.nav-bar + main').exists()).toBe(true)
  })

  it('links the logo back to the dashboard only on room routes', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const { wrapper, router } = await mountApp('/room/room-one?tool=wheel')

    const logoLink = wrapper.get('.nav-bar a.dashboard-logo-link')
    expect(logoLink.attributes('title')).toBe('Go to dashboard')

    await logoLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/dashboard')
    expect(wrapper.find('.nav-bar a.dashboard-logo-link').exists()).toBe(false)
  })
})
