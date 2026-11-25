import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createTestRouter } from '../../test/helpers.js'
import NavBar from './NavBar.vue'

const mountNav = async (props = {}) => {
  const router = await createTestRouter('/')
  return mount(NavBar, { props, global: { plugins: [router] } })
}

const stubClipboard = () => {
  const writeText = vi.fn().mockResolvedValue()
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  return writeText
}

describe('NavBar', () => {
  it('shows only the brand header without a room', async () => {
    const wrapper = await mountNav()

    expect(wrapper.get('.dashboard-header > h1').text()).toBe(
      'Welcome to the Scrumble',
    )
    expect(wrapper.get('.nav-header').classes()).toContain('no-session')
    expect(wrapper.find('.nav-bar-room-name').exists()).toBe(false)
    expect(wrapper.find('button.link').exists()).toBe(false)
    expect(wrapper.find('a.link').exists()).toBe(false)
  })

  it('shows the room name and invite button for an active room', async () => {
    const wrapper = await mountNav({ roomId: 'room-one', roomName: 'Team' })

    expect(wrapper.get('.nav-header').classes()).not.toContain('no-session')
    expect(wrapper.get('.nav-bar-room-name').text()).toBe('Team')
    expect(wrapper.get('button.link').text()).toBe('Invite Users')
    expect(wrapper.find('a.link').exists()).toBe(false)
  })

  it('links the logo to the dashboard on room routes', async () => {
    const wrapper = await mountNav({
      roomId: 'room-one',
      roomName: 'Team',
      isRoomRoute: true,
    })

    const logoLink = wrapper.get('a.dashboard-logo-link')
    expect(logoLink.attributes('href')).toBe('/dashboard')
    expect(logoLink.attributes('title')).toBe('Go to dashboard')
    expect(logoLink.attributes('aria-label')).toBe('Go to dashboard')
    expect(wrapper.find('a.link').exists()).toBe(false)
  })

  it('does not link the logo outside room routes', async () => {
    const wrapper = await mountNav({ roomId: 'room-one', roomName: 'Team' })

    expect(wrapper.find('.dashboard-logo-link').exists()).toBe(false)
    expect(wrapper.find('.dashboard-header .icon').exists()).toBe(true)
  })

  it.each([
    [true, 'http://localhost:5173/room/room%20one?tool=retro'],
    [false, 'http://localhost:5173/room/room%20one'],
  ])(
    'copies an invite link (room route: %s) and resets the label',
    async (isRoomRoute, expectedUrl) => {
      vi.useFakeTimers()
      const writeText = stubClipboard()
      const wrapper = await mountNav({
        roomId: 'room one',
        roomName: 'Team',
        activeTool: 'retro',
        isRoomRoute,
      })

      await wrapper.get('button.link').trigger('click')
      await vi.waitFor(() =>
        expect(wrapper.get('button.link').text()).toBe('Link Copied!'),
      )
      expect(writeText).toHaveBeenCalledWith(expectedUrl)

      await vi.advanceTimersByTimeAsync(3000)
      expect(wrapper.get('button.link').text()).toBe('Invite Users')
    },
  )
})
