import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createTestRouter, receiveSocketEvent } from '../../test/helpers.js'
import { currentRoom } from '../../js/roomNav.js'
import appRouter from '../../router/index.js'
import App from '../../App.vue'
import JoinRoom from '../Join/JoinRoom.vue'
import Dashboard from './Dashboard.vue'

describe('Dashboard', () => {
  it.each(['/', '/dashboard', '/dashboard?roomId=unjoined-room'])(
    'shows the join form without an active room at %s',
    async (path) => {
      const router = await createTestRouter(path)
      const wrapper = mount(Dashboard, { global: { plugins: [router] } })

      expect(wrapper.get('.dashboard').isVisible()).toBe(true)
      expect(wrapper.get('.dashboard-header > h1').text()).toBe(
        'Welcome to the Scrumble',
      )
      expect(wrapper.findComponent(JoinRoom).exists()).toBe(true)
      expect(wrapper.findAll('.dashboard-tool')).toHaveLength(0)
      expect(wrapper.find('.dashboard-new-room').exists()).toBe(false)
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

  it('clears the current room before navigating to create a new one', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const router = await createTestRouter('/dashboard?roomId=room-one')
    const wrapper = mount(Dashboard, { global: { plugins: [router] } })

    const newRoomButton = wrapper.get('.dashboard-new-room')
    expect(newRoomButton.text()).toBe('+ Start a new session')
    await newRoomButton.trigger('click')
    await flushPromises()

    expect(currentRoom.value).toEqual({ roomId: '', roomName: '' })
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.findComponent(JoinRoom).exists()).toBe(true)
    expect(wrapper.findAll('.dashboard-tool')).toHaveLength(0)
  })

  it.each(['create', 'join'])(
    'shows the dashboard tools after a successful %s from the root route',
    async (action) => {
      const router = createRouter({
        history: createMemoryHistory(),
        routes: appRouter.options.routes,
      })
      await router.push('/')
      await router.isReady()
      const wrapper = mount(App, { global: { plugins: [router] } })

      expect(wrapper.findComponent(Dashboard).exists()).toBe(true)
      expect(wrapper.get('.dashboard-header > h1').text()).toBe(
        'Welcome to the Scrumble',
      )
      expect(wrapper.findComponent(JoinRoom).exists()).toBe(true)
      expect(wrapper.findAll('.dashboard-tool')).toHaveLength(0)
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
