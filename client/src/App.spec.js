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

  it('links back to the dashboard from the side panel', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const { wrapper, router } = await mountApp('/room/room-one?tool=wheel')

    expect(wrapper.find('.nav-bar .icon.xlarge').exists()).toBe(false)
    const dashboardLink = wrapper.get('.side-panel a.content-item.dashboard')
    expect(dashboardLink.attributes('href')).toBe('/dashboard')
    expect(dashboardLink.attributes('title')).toBe('Go to dashboard')

    await dashboardLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('hides the session chrome on the join screen', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const { wrapper } = await mountApp('/')

    expect(wrapper.find('.nav-bar').exists()).toBe(false)
    expect(wrapper.find('.side-panel').exists()).toBe(false)
  })
})
