import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createTestRouter } from '../../test/helpers.js'
import { currentRoom } from '../../js/roomNav.js'
import Dashboard from './Dashboard.vue'

describe('Dashboard', () => {
  it('routes each tool to the join screen when there is no room', async () => {
    const router = await createTestRouter('/dashboard')
    const wrapper = mount(Dashboard, { global: { plugins: [router] } })

    expect(
      wrapper.findAll('.dashboard-tool').map((link) => link.attributes('href')),
    ).toEqual(['/join?tool=poker', '/join?tool=retro', '/join?tool=wheel'])
    expect(wrapper.find('.dashboard-new-room').exists()).toBe(false)
  })

  it('routes tools to the current room and preserves the requested tool', async () => {
    const router = await createTestRouter(
      '/dashboard?roomId=room-one&roomName=Team',
    )
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

    await wrapper.get('.dashboard-new-room').trigger('click')
    await flushPromises()

    expect(currentRoom.value).toEqual({ roomId: '', roomName: '' })
    expect(router.currentRoute.value.path).toBe('/')
  })
})
