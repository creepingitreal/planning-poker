import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Layout from './Layout.vue'
import NavBar from '../../organisms/NavBar/NavBar.vue'
import SidePanel from '../../organisms/SidePanel/SidePanel.vue'
import socket from '../../../../socket.js'
import { createTestRouter, receiveSocketEvent } from '../../../test/helpers.js'
import {
  activeTool,
  roomPlayers,
  setCurrentRoom,
  wheelManualNames,
} from '../../../js/roomNav.js'

const mountLayout = async (path) => {
  const router = await createTestRouter(path)
  const wrapper = mount(Layout, {
    global: {
      plugins: [router],
      stubs: { NavBar: true, SidePanel: true, RouterView: true },
    },
  })
  return { wrapper, router }
}

describe('Layout', () => {
  it('hides the session chrome without a current room', async () => {
    const { wrapper } = await mountLayout('/dashboard')

    expect(wrapper.findComponent(NavBar).exists()).toBe(false)
    expect(wrapper.findComponent(SidePanel).exists()).toBe(false)
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('hides the session chrome on the join screen', async () => {
    setCurrentRoom('room-one', 'Team')
    const { wrapper } = await mountLayout('/')

    expect(wrapper.findComponent(NavBar).exists()).toBe(false)
  })

  it('passes room state to the nav bar and side panel in a room', async () => {
    setCurrentRoom('room-one', 'Team')
    activeTool.value = 'wheel'
    const { wrapper } = await mountLayout('/room/room-one')

    expect(wrapper.findComponent(NavBar).props()).toMatchObject({
      roomId: 'room-one',
      roomName: 'Team',
      activeTool: 'wheel',
      isRoomRoute: true,
    })
    expect(wrapper.findComponent(SidePanel).props()).toMatchObject({
      allowManual: true,
      activeTool: 'wheel',
    })
  })

  it('switches tools in place on the room route', async () => {
    setCurrentRoom('room-one', 'Team')
    const { wrapper, router } = await mountLayout('/room/room-one')

    wrapper.findComponent(SidePanel).vm.$emit('select-tool', 'retro')

    expect(activeTool.value).toBe('retro')
    expect(router.currentRoute.value.path).toBe('/room/room-one')
  })

  it('navigates to the room with the chosen tool from elsewhere', async () => {
    setCurrentRoom('room-one', 'Team')
    const { wrapper, router } = await mountLayout('/dashboard')

    expect(wrapper.findComponent(SidePanel).props('activeTool')).toBe('')
    wrapper.findComponent(SidePanel).vm.$emit('select-tool', 'wheel')
    await new Promise((resolve) => router.afterEach(resolve))

    expect(router.currentRoute.value.fullPath).toBe('/room/room-one?tool=wheel')
  })

  it('stores manual wheel names emitted by the side panel', async () => {
    setCurrentRoom('room-one', 'Team')
    const { wrapper } = await mountLayout('/room/room-one')

    wrapper
      .findComponent(SidePanel)
      .vm.$emit('update:manual-names-arr', ['Sam', 'Jo'])

    expect(wheelManualNames.value).toEqual(['Sam', 'Jo'])
  })

  it('tracks room players from updates and stops listening on unmount', async () => {
    const { wrapper } = await mountLayout('/dashboard')
    const players = { a: { user: 'Alex' } }

    await receiveSocketEvent('updateRoom', { players })
    expect(roomPlayers.value).toEqual(players)

    await receiveSocketEvent('updateRoom', {})
    expect(roomPlayers.value).toEqual({})

    const [, handler] = socket.on.mock.calls.find(
      ([event]) => event === 'updateRoom',
    )
    wrapper.unmount()
    expect(socket.off).toHaveBeenCalledWith('updateRoom', handler)
  })
})
