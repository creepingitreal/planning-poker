import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import socket from '../../../socket.js'
import { createTestRouter, receiveSocketEvent } from '../../test/helpers.js'
import { currentRoom } from '../../js/roomNav.js'
import JoinRoom from './JoinRoom.vue'

vi.mock('../../js/generators.js', () => ({
  generateRoomId: () => 'generated-room',
  randomNameGenerator: () => 'Generated Sprint',
}))

const mountJoin = async (path = '/join') => {
  const router = await createTestRouter(path)
  const wrapper = mount(JoinRoom, { global: { plugins: [router] } })
  return { wrapper, router }
}

beforeEach(() => {
  localStorage.setItem('poker_client_id', 'known-client')
  vi.stubGlobal('alert', vi.fn())
})

describe('JoinRoom', () => {
  it.each(['.button-section > button', '.accent'])(
    'requires a username for %s',
    async (selector) => {
      const { wrapper } = await mountJoin()

      await wrapper.get(selector).trigger('click')

      expect(alert).toHaveBeenCalledWith('Please enter your name')
      expect(socket.emit).not.toHaveBeenCalled()
    },
  )

  it('requires a room name when joining without an invite link', async () => {
    const { wrapper } = await mountJoin()
    await wrapper.get('[placeholder="Username *"]').setValue('Alex')

    await wrapper.get('.button-section > button').trigger('click')

    expect(alert).toHaveBeenCalledWith('Please enter a room name')
    expect(socket.emit).not.toHaveBeenCalled()
  })

  it('joins a named room using the persistent browser identity', async () => {
    const { wrapper } = await mountJoin()
    await wrapper.get('[placeholder="Username *"]').setValue('Alex')
    await wrapper.get('[placeholder="Sprint Name"]').setValue('Team Sprint')

    await wrapper.get('.button-section > button').trigger('click')

    expect(socket.emit).toHaveBeenCalledWith('joinRoom', {
      room: { roomId: '', roomName: 'Team Sprint' },
      user: 'Alex',
      clientId: 'known-client',
      fromLink: false,
    })
  })

  it('resolves invite room names and allows joining with enter', async () => {
    const { wrapper } = await mountJoin('/join/room-one?tool=retro')

    expect(socket.emit).toHaveBeenCalledWith('getRoomName', 'room-one')
    await receiveSocketEvent('roomNameResolved', { roomName: 'Team Sprint' })
    expect(wrapper.get('h1').text()).toBe('Team Sprint')
    expect(wrapper.find('[placeholder="Sprint Name"]').exists()).toBe(false)
    await wrapper.get('[placeholder="Username *"]').setValue('Alex')
    await wrapper
      .get('[placeholder="Username *"]')
      .trigger('keyup', { key: 'Enter' })

    expect(socket.emit).toHaveBeenLastCalledWith('joinRoom', {
      room: { roomId: 'room-one', roomName: '' },
      user: 'Alex',
      clientId: 'known-client',
      fromLink: true,
    })
  })

  it.each([
    ['', 'Generated Sprint'],
    ['Team Sprint', 'Team Sprint'],
  ])(
    'creates an invite-only room with name %j',
    async (inputName, expectedName) => {
      const { wrapper, router } = await mountJoin()
      await wrapper.get('[placeholder="Username *"]').setValue('Alex')
      await wrapper.get('[placeholder="Sprint Name"]').setValue(inputName)
      await wrapper.get('#invite-only').setValue(true)
      expect(wrapper.find('.confirmation-text').exists()).toBe(true)

      await wrapper.get('.accent').trigger('click')

      expect(socket.emit).toHaveBeenCalledWith('createRoom', {
        room: {
          roomId: 'generated-room',
          roomName: expectedName,
          locked: true,
        },
        user: 'Alex',
        clientId: 'known-client',
      })
      expect(wrapper.get('#invite-only').element.checked).toBe(false)
      await receiveSocketEvent('roomJoined', {
        roomId: 'generated-room',
        roomName: expectedName,
      })
      await flushPromises()
      expect(router.currentRoute.value.path).toBe('/dashboard')
      expect(router.currentRoute.value.query).toEqual({
        roomId: 'generated-room',
        roomName: expectedName,
      })
    },
  )

  it('saves a joined session and preserves the requested tool in navigation', async () => {
    const { wrapper, router } = await mountJoin('/join/room-one?tool=wheel')
    await wrapper.get('[placeholder="Username *"]').setValue('Alex')
    await wrapper.get('.button-section > button').trigger('click')

    await receiveSocketEvent('roomJoined', {
      roomId: 'room-one',
      roomName: 'Team',
    })
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/room/room-one?tool=wheel')
    expect(currentRoom.value).toEqual({ roomId: 'room-one', roomName: 'Team' })
    expect(JSON.parse(localStorage.getItem('poker_session_room-one'))).toEqual({
      room: { roomId: 'room-one', roomName: 'Team' },
      name: 'Alex',
      clientId: 'known-client',
      savedAt: expect.any(Number),
    })
  })

  it('shows room errors and removes registered listeners on unmount', async () => {
    const { wrapper } = await mountJoin()
    const listeners = [...socket.on.mock.calls]

    await receiveSocketEvent('roomError', { message: 'Room not found.' })
    expect(alert).toHaveBeenCalledWith('Room not found.')
    wrapper.unmount()

    for (const [event, handler] of listeners) {
      expect(socket.off).toHaveBeenCalledWith(event, handler)
    }
  })
})
