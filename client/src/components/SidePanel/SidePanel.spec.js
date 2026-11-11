import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  activeTool,
  currentRoom,
  roomPlayers,
  showTools,
  wheelManualNames,
} from '../../js/roomNav.js'
import SidePanel from './SidePanel.vue'
import App from '../../App.vue'
import socket from '../../../socket.js'
import { receiveSocketEvent } from '../../test/helpers.js'
import { brand } from '../../brand/index.js'

describe('SidePanel', () => {
  it('shows live room participants without opening a board and cleans up its listener', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const wrapper = mount(App, { global: { stubs: { RouterView: true } } })
    const listener = socket.on.mock.calls.find(
      ([event]) => event === 'updateRoom',
    )[1]
    await wrapper.get('.logo').trigger('click')

    await receiveSocketEvent('updateRoom', {
      players: { alex: { user: 'Alex', color: '#123456' } },
    })
    expect(wrapper.get('.users-list').text()).toContain('Alex')

    await receiveSocketEvent('updateRoom', {
      players: {
        alex: { user: 'Alex', color: '#123456' },
        sam: { user: 'Sam', color: '#abcdef' },
      },
    })
    expect(wrapper.get('.users-list').text()).toContain('Sam')

    await receiveSocketEvent('updateRoom', {
      players: { sam: { user: 'Sam', color: '#abcdef' } },
    })
    expect(wrapper.get('.users-list').text()).not.toContain('Alex')
    expect(wrapper.get('.users-list').text()).toContain('Sam')
    wrapper.unmount()
    expect(socket.off).toHaveBeenCalledWith('updateRoom', listener)
  })

  it('adds and removes wheel-only participants through the app state', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    activeTool.value = 'wheel'
    roomPlayers.value = { alex: { user: 'Alex', color: '#123456' } }
    const wrapper = mount(App, { global: { stubs: { RouterView: true } } })

    await wrapper.get('.logo').trigger('click')
    await wrapper.get('.add-user-form input').setValue('  Guest  ')
    await wrapper.get('.add-user-form').trigger('submit')

    expect(wheelManualNames.value).toEqual(['Guest'])
    expect(
      Object.values(roomPlayers.value).map((player) => player.user),
    ).toEqual(['Alex'])
    expect(wrapper.get('[aria-label="Remove Guest"]').exists()).toBe(true)

    for (const tool of ['poker', 'retro']) {
      activeTool.value = tool
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.add-user-form').exists()).toBe(false)
      expect(wrapper.find('[aria-label="Remove Guest"]').exists()).toBe(false)
      expect(wrapper.get('.users-list').text()).not.toContain('Guest')
      expect(wrapper.get('.users-list').text()).toContain('Alex')
    }

    activeTool.value = 'wheel'
    await wrapper.vm.$nextTick()
    expect(wrapper.get('.users-list').text()).toContain('Guest')
    await wrapper.get('[aria-label="Remove Guest"]').trigger('click')
    expect(wheelManualNames.value).toEqual([])
  })

  it('forwards manual-name updates without mutating its props', async () => {
    const manualNamesArr = ['Guest']
    const wrapper = mount(SidePanel, {
      props: { allowManual: true, manualNamesArr },
    })

    await wrapper.get('.logo').trigger('click')
    await wrapper.get('.add-user-form input').setValue('Sam')
    await wrapper.get('.add-user-form').trigger('submit')

    expect(wrapper.emitted('update:manualNamesArr')).toEqual([
      [['Guest', 'Sam']],
    ])
    expect(manualNamesArr).toEqual(['Guest'])
  })

  it('uses the brand mark and full logo without the generic icon renderer', async () => {
    const wrapper = mount(SidePanel)

    expect(wrapper.get('.brand-logo').attributes('src')).toBe(brand.logoMarkUrl)
    expect(wrapper.get('.brand-logo').attributes('alt')).toBe(brand.logoAlt)
    expect(wrapper.get('.logo').attributes('aria-label')).toContain(brand.name)
    expect(wrapper.get('.logo').attributes('aria-expanded')).toBe('false')
    await wrapper.get('.logo').trigger('click')
    expect(wrapper.get('.brand-logo').attributes('src')).toBe(brand.logoUrl)
    expect(wrapper.get('.logo').attributes('aria-expanded')).toBe('true')
  })

  it('opens from the logo and closes from the backdrop', async () => {
    const wrapper = mount(SidePanel)

    expect(wrapper.get('aside').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.side-panel-backdrop').exists()).toBe(false)
    await wrapper.get('.logo').trigger('click')
    expect(wrapper.get('aside').classes()).toContain('open')
    expect(wrapper.get('aside').attributes('aria-hidden')).toBe('false')
    await wrapper.get('.side-panel-backdrop').trigger('click')
    expect(wrapper.get('aside').attributes('aria-hidden')).toBe('true')
  })

  it('opens from a section trigger and supports the close button', async () => {
    const wrapper = mount(SidePanel)

    await wrapper.get('.content-title.users').trigger('click')
    expect(wrapper.get('aside').classes()).toContain('open')
    await wrapper.get('[aria-label="Close side panel"]').trigger('click')
    expect(wrapper.get('aside').classes()).not.toContain('open')
  })

  it('integrates tool selection with shared room navigation', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    showTools.value = true
    const wrapper = mount(SidePanel)

    await wrapper.get('.logo').trigger('click')
    const wheel = wrapper
      .findAll('.tool-tab')
      .find((button) => button.text() === 'Spin the Wheel')
    await wheel.trigger('click')

    expect(activeTool.value).toBe('wheel')
    expect(wrapper.get('.tool-tab.active').text()).toBe('Spin the Wheel')
  })
})
