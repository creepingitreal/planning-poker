import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  activeTool,
  currentRoom,
  roomPlayers,
  wheelManualNames,
} from '../../../js/roomNav.js'
import SidePanel from './SidePanel.vue'
import Layout from '../../templates/Layout/Layout.vue'
import socket from '../../../../socket.js'
import { createTestRouter, receiveSocketEvent } from '../../../test/helpers.js'
import { brand } from '../../../brand/index.js'

// Unit tests of the panel alone don't need real navigation.
const routerLinkStub = { stubs: { RouterLink: true } }

const mountLayout = async (path = '/room/room-one') => {
  const router = await createTestRouter(path)
  const wrapper = mount(Layout, {
    global: { plugins: [router], stubs: { RouterView: true } },
  })
  return Object.assign(wrapper, { router })
}

describe('SidePanel', () => {
  it('shows live room participants without opening a board and cleans up its listener', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const wrapper = await mountLayout()
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
    const wrapper = await mountLayout()

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
      global: routerLinkStub,
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
    const wrapper = mount(SidePanel, { global: routerLinkStub })

    expect(wrapper.get('.brand-logo').attributes('src')).toBe(brand.logoMarkUrl)
    expect(wrapper.get('.brand-logo').attributes('alt')).toBe(brand.logoAlt)
    expect(wrapper.get('.logo').attributes('aria-label')).toContain(brand.name)
    expect(wrapper.get('.logo').attributes('aria-expanded')).toBe('false')
    await wrapper.get('.logo').trigger('click')
    expect(wrapper.get('.brand-logo').attributes('src')).toBe(brand.logoUrl)
    expect(wrapper.get('.logo').attributes('aria-expanded')).toBe('true')
  })

  it('opens from the logo and closes from the backdrop', async () => {
    const wrapper = mount(SidePanel, { global: routerLinkStub })

    expect(wrapper.get('aside').attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.find('.side-panel-backdrop').exists()).toBe(false)
    await wrapper.get('.logo').trigger('click')
    expect(wrapper.get('aside').classes()).toContain('open')
    expect(wrapper.get('aside').attributes('aria-hidden')).toBeUndefined()
    await wrapper.get('.side-panel-backdrop').trigger('click')
    expect(wrapper.get('aside').classes()).not.toContain('open')
    expect(wrapper.get('aside').attributes('aria-hidden')).toBeUndefined()
  })

  it.each(['.logo', '.side-panel-close', '.side-panel-backdrop'])(
    'keeps focus on the accessible logo when closing with %s',
    async (closeSelector) => {
      const wrapper = mount(SidePanel, {
        attachTo: document.body,
        global: routerLinkStub,
      })
      const logo = wrapper.get('.logo')

      logo.element.focus()
      expect(logo.element.closest('[aria-hidden="true"], [inert]')).toBeNull()
      await logo.trigger('click')
      wrapper.get('.side-panel-close').element.focus()
      await wrapper.get(closeSelector).trigger('click')

      expect(document.activeElement).toBe(logo.element)
      expect(logo.attributes('aria-expanded')).toBe('false')
      expect(logo.element.closest('[aria-hidden="true"], [inert]')).toBeNull()
      expect(wrapper.find('.users-list').exists()).toBe(false)
      expect(wrapper.find('.tool-tab').exists()).toBe(false)
    },
  )

  it('opens from a section trigger and supports the close button', async () => {
    const wrapper = mount(SidePanel, { global: routerLinkStub })

    await wrapper.get('.content-item.users .content-title').trigger('click')
    expect(wrapper.get('aside').classes()).toContain('open')
    await wrapper.get('[aria-label="Close side panel"]').trigger('click')
    expect(wrapper.get('aside').classes()).not.toContain('open')
  })

  it('switches tools in place on a room route', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    activeTool.value = 'poker'
    const wrapper = await mountLayout('/room/room-one')

    await wrapper.get('.logo').trigger('click')
    expect(wrapper.get('.tool-tab.active').text()).toBe('Planning Poker')
    const wheel = wrapper
      .findAll('.tool-tab')
      .find((button) => button.text() === 'Spin the Wheel')
    await wheel.trigger('click')
    await flushPromises()

    expect(activeTool.value).toBe('wheel')
    expect(wrapper.get('.tool-tab.active').text()).toBe('Spin the Wheel')
    expect(wrapper.router.currentRoute.value.path).toBe('/room/room-one')
  })

  it('navigates to the dashboard from its sidebar button without expanding a section', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const wrapper = await mountLayout('/room/room-one')

    const dashboard = wrapper.get('a.content-item.dashboard')
    expect(dashboard.attributes('href')).toBe('/dashboard')
    expect(dashboard.find('.title').exists()).toBe(false)
    await wrapper.get('.logo').trigger('click')
    expect(wrapper.get('a.content-item.dashboard .title').text()).toBe(
      'Dashboard',
    )

    await wrapper.get('a.content-item.dashboard').trigger('click')
    await flushPromises()

    expect(wrapper.router.currentRoute.value.path).toBe('/dashboard')
    expect(wrapper.get('aside').classes()).not.toContain('open')
  })

  it.each([
    ['/room/room-one', 'tools'],
    ['/dashboard', 'dashboard'],
  ])(
    'highlights only the screen section on %s',
    async (path, activeSection) => {
      currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
      activeTool.value = 'retro'
      const wrapper = await mountLayout(path)

      const isActive = (section) => {
        const item = wrapper.get(`.content-item.${section}`)
        return (
          item.classes().includes('active') ||
          item.classes().includes('router-link-exact-active')
        )
      }

      expect(['dashboard', 'tools', 'users', 'info'].filter(isActive)).toEqual([
        activeSection,
      ])
    },
  )

  it('keeps tools on the dashboard and opens the chosen tool in the room', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    activeTool.value = 'poker'
    const wrapper = await mountLayout('/dashboard')

    await wrapper.get('.logo').trigger('click')
    expect(wrapper.findAll('.tool-tab')).toHaveLength(3)
    expect(wrapper.find('.tool-tab.active').exists()).toBe(false)

    const retro = wrapper
      .findAll('.tool-tab')
      .find((button) => button.text() === 'Retro Board')
    await retro.trigger('click')
    await flushPromises()

    expect(wrapper.router.currentRoute.value.fullPath).toBe(
      '/room/room-one?tool=retro',
    )
  })
})
