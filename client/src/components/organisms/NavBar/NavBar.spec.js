import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createTestRouter } from '../../../test/helpers.js'
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
  it('shows the room name and invite button for an active room', async () => {
    const wrapper = await mountNav({ roomId: 'room-one', roomName: 'Team' })

    expect(wrapper.get('.nav-bar-room-name').text()).toBe('Team')
    expect(wrapper.get('button.link').text()).toBe('Invite Users')
    expect(wrapper.find('a.link').exists()).toBe(false)
  })

  it('does not render the brand logo or welcome', async () => {
    const wrapper = await mountNav({ roomId: 'room-one', roomName: 'Team' })

    expect(wrapper.find('.icon.xlarge').exists()).toBe(false)
    expect(wrapper.find('h1').exists()).toBe(false)
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
