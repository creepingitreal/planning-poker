import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createTestRouter, receiveSocketEvent } from '../../../test/helpers.js'
import { currentRoom } from '../../../js/roomNav.js'
import appRouter from '../../../router/index.js'
import App from '../../../App.vue'
import JoinRoom from '../JoinRoom/JoinRoom.vue'
import Dashboard from './Dashboard.vue'

describe('Dashboard', () => {
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

  it.each(['/dashboard', '/dashboard?roomId=unjoined-room', '/join/room-one'])(
    'sends %s to the join screen on "/" without an active session',
    async (path) => {
      const { wrapper, router } = await mountApp(path)

      expect(router.currentRoute.value.fullPath).toBe('/')
      expect(wrapper.findComponent(JoinRoom).exists()).toBe(true)
      expect(wrapper.findComponent(Dashboard).exists()).toBe(false)
    },
  )

  it('routes tools to the current room and preserves the requested tool', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const router = await createTestRouter('/dashboard')
    const wrapper = mount(Dashboard, { global: { plugins: [router] } })

    expect(
      wrapper.findAll('.dashboard-tool').map((link) => link.attributes('href')),
    ).toEqual([
      '/room/room-one?tool=poker',
      '/room/room-one?tool=retro',
      '/room/room-one?tool=wheel',
    ])
    await wrapper.findAll('.dashboard-tool')[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/room/room-one?tool=retro')
  })

  it('leaves for the join screen before clearing the session to start a new one', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const { wrapper, router } = await mountApp('/dashboard')

    const newRoomButton = wrapper.get('.dashboard-new-room')
    expect(newRoomButton.text()).toBe('+ Start a new session')
    await newRoomButton.trigger('click')
    await flushPromises()

    expect(currentRoom.value).toEqual({ roomId: '', roomName: '' })
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.findComponent(JoinRoom).exists()).toBe(true)
  })

  it.each(['create', 'join'])(
    'shows the dashboard tools after a successful %s from the root route',
    async (action) => {
      const { wrapper, router } = await mountApp('/')

      expect(wrapper.findComponent(Dashboard).exists()).toBe(false)
      expect(wrapper.get('.join-welcome').text()).toBe(
        'Welcome to the Scrumble',
      )
      expect(wrapper.findComponent(JoinRoom).exists()).toBe(true)
      expect(wrapper.find('.nav-bar').exists()).toBe(false)
      expect(wrapper.find('.side-panel').exists()).toBe(false)
      await wrapper.get('[placeholder="Username *"]').setValue('Alex')
      await wrapper.get('[placeholder="Sprint Name"]').setValue('Team')
      await wrapper
        .get(action === 'create' ? '.accent' : '.button-section > button')
        .trigger('click')
      await receiveSocketEvent('roomJoined', {
        roomId: 'room-one',
        roomName: 'Team',
      })
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe('/dashboard')
      expect(wrapper.findComponent(JoinRoom).exists()).toBe(false)
      expect(
        wrapper
          .findAll('.dashboard-tool')
          .map((link) => link.attributes('href')),
      ).toEqual([
        '/room/room-one?tool=poker',
        '/room/room-one?tool=retro',
        '/room/room-one?tool=wheel',
      ])
    },
  )
})
