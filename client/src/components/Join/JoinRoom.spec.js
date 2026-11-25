import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import socket from '../../../socket.js'
import { createTestRouter, receiveSocketEvent } from '../../test/helpers.js'
import {
  clearCurrentRoom,
  currentRoom,
  roomPlayers,
  setCurrentRoom,
  wheelManualNames,
} from '../../js/roomNav.js'
import Layout from '../../layout/Layout.vue'
import JoinRoom from './JoinRoom.vue'
import { currentMessage } from '../../js/messages.js'

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
})

describe('JoinRoom', () => {
  it('keeps the users live on the dashboard immediately after creating a room', async () => {
    const router = await createTestRouter('/join')
    const app = mount(Layout, {
      global: { plugins: [router], stubs: { RouterView: true } },
    })
    const join = mount(JoinRoom, { global: { plugins: [router] } })
    await join.get('[placeholder="Username *"]').setValue('Alex')
    await join.get('.accent').trigger('click')
    await receiveSocketEvent('roomJoined', {
      roomId: 'generated-room',
      roomName: 'Team',
    })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/dashboard')
    join.unmount()

    await receiveSocketEvent('updateRoom', {
      players: { alex: { user: 'Alex', color: '#123456' } },
    })
    await app.get('.logo').trigger('click')
    expect(app.get('.users-list').text()).toContain('Alex')

    wheelManualNames.value = ['Guest']
    setCurrentRoom('generated-room', 'Renamed Team')
    expect(roomPlayers.value.alex.user).toBe('Alex')
    expect(wheelManualNames.value).toEqual(['Guest'])
    setCurrentRoom('other-room', 'Other Team')
    expect(roomPlayers.value).toEqual({})
    expect(wheelManualNames.value).toEqual([])

    roomPlayers.value = { sam: { user: 'Sam' } }
    wheelManualNames.value = ['Guest']
    clearCurrentRoom()
    expect(roomPlayers.value).toEqual({})
    expect(wheelManualNames.value).toEqual([])
  })

  it.each(['.button-section > button', '.accent'])(
    'requires a username for %s',
    async (selector) => {
      const { wrapper } = await mountJoin()

      await wrapper.get(selector).trigger('click')

      expect(currentMessage.value).toMatchObject({
        message: 'Please enter your name',
        variant: 'warning',
      })
      expect(socket.emit).not.toHaveBeenCalled()
    },
  )

  it('requires a room name when joining without an invite link', async () => {
    const { wrapper } = await mountJoin()
    await wrapper.get('[placeholder="Username *"]').setValue('Alex')

    await wrapper.get('.button-section > button').trigger('click')

    expect(currentMessage.value).toMatchObject({
      message: 'Please enter a room name',
      variant: 'warning',
    })
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

  it.each(['[placeholder="Sprint Name"]', '[placeholder="Username *"]'])(
    'creates a room when pressing enter in %s without an invite link',
    async (selector) => {
      const { wrapper } = await mountJoin()
      await wrapper.get('[placeholder="Username *"]').setValue('Alex')
      await wrapper.get('[placeholder="Sprint Name"]').setValue('Team Sprint')

      await wrapper.get(selector).trigger('keyup', { key: 'Enter' })

      expect(socket.emit).toHaveBeenLastCalledWith('createRoom', {
        room: {
          roomId: 'generated-room',
          roomName: 'Team Sprint',
          locked: false,
        },
        user: 'Alex',
        clientId: 'known-client',
      })
    },
  )

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
      expect(router.currentRoute.value.query).toEqual({})
    },
  )

  it('takes invited users straight to the shared tool', async () => {
    const { wrapper, router } = await mountJoin('/join/room-one?tool=wheel')
    await wrapper.get('[placeholder="Username *"]').setValue('Alex')
    await wrapper.get('.button-section > button').trigger('click')

    await receiveSocketEvent('roomJoined', {
      roomId: 'room-one',
      roomName: 'Team',
    })
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/room/room-one?tool=wheel')
  })

  it('saves a joined session and shows the dashboard when no tool is shared', async () => {
    const { wrapper, router } = await mountJoin('/join/room-one')
    await wrapper.get('[placeholder="Username *"]').setValue('Alex')
    await wrapper.get('.button-section > button').trigger('click')

    await receiveSocketEvent('roomJoined', {
      roomId: 'room-one',
      roomName: 'Team',
    })
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/dashboard')
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
    expect(currentMessage.value).toMatchObject({
      message: 'Room not found.',
      variant: 'error',
    })
    wrapper.unmount()

    for (const [event, handler] of listeners) {
      expect(socket.off).toHaveBeenCalledWith(event, handler)
    }
  })
})
