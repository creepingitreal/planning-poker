import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import socket from '../../../socket.js'
import { createTestRouter, receiveSocketEvent } from '../../test/helpers.js'
import {
  activeTool,
  currentRoom,
  roomPlayers,
  showTools,
  wheelManualNames,
} from '../../js/roomNav.js'
import RetroBoard from '../Retro/RetroBoard.vue'
import App from '../../App.vue'
import Room from './Room.vue'

const createSession = (overrides = {}) => ({
  room: { roomId: 'room-one', roomName: 'Team' },
  name: 'Alex',
  clientId: 'saved-client',
  savedAt: Date.now(),
  ...overrides,
})

const mountRoom = async ({
  path = '/room/room-one?tool=retro',
  session = createSession(),
} = {}) => {
  if (session)
    localStorage.setItem('poker_session_room-one', JSON.stringify(session))
  const router = await createTestRouter(path)
  shallowMount(App, { global: { plugins: [router] } })
  const wrapper = shallowMount(Room, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

beforeEach(() => {
  localStorage.setItem('poker_client_id', 'browser-client')
  vi.stubGlobal('alert', vi.fn())
})

describe('Room', () => {
  it('rejoins a saved session with its original participant identity', async () => {
    const { wrapper } = await mountRoom()

    expect(socket.emit).toHaveBeenCalledWith('joinRoom', {
      room: { roomId: 'room-one', roomName: 'Team' },
      user: 'Alex',
      clientId: 'saved-client',
      fromLink: true,
    })
    expect(wrapper.find('.room').exists()).toBe(false)
  })

  it('falls back to the browser identity for older saved sessions', async () => {
    await mountRoom({ session: createSession({ clientId: undefined }) })

    expect(socket.emit).toHaveBeenCalledWith(
      'joinRoom',
      expect.objectContaining({ clientId: 'browser-client' }),
    )
  })

  it.each(['missing', 'expired'])(
    'returns to join when the session is %s',
    async (kind) => {
      const session =
        kind === 'missing'
          ? null
          : createSession({ savedAt: Date.now() - 24 * 60 * 60 * 1000 - 1 })
      const { router } = await mountRoom({ session })

      expect(router.currentRoute.value.fullPath).toBe(
        '/join/room-one?tool=retro',
      )
      expect(localStorage.getItem('poker_session_room-one')).toBeNull()
      expect(socket.emit).not.toHaveBeenCalled()
    },
  )

  it('activates the requested tool only after join confirmation', async () => {
    const { wrapper } = await mountRoom()

    expect(showTools.value).toBe(false)
    await receiveSocketEvent('roomJoined', {
      roomId: 'room-one',
      roomName: 'Team',
    })

    expect(wrapper.find('.room.retro').exists()).toBe(true)
    expect(activeTool.value).toBe('retro')
    expect(showTools.value).toBe(true)
    expect(currentRoom.value).toEqual({ roomId: 'room-one', roomName: 'Team' })
    expect(wrapper.getComponent(RetroBoard).isVisible()).toBe(true)
    expect(
      JSON.parse(localStorage.getItem('poker_session_room-one')).name,
    ).toBe('Alex')
  })

  it('passes server participant, board, and timer updates to the retro tool', async () => {
    const { wrapper } = await mountRoom()
    await receiveSocketEvent('roomJoined', {
      roomId: 'room-one',
      roomName: 'Team',
    })
    const players = {
      'test-socket': { user: 'Alex', color: '#123456', vote: null },
    }
    const board = {
      columns: [{ id: 'well', title: 'Well' }],
      cards: [{ id: 'card-one', text: 'Saved card' }],
      revealed: true,
    }
    const timer = { duration: 300, remaining: 90, running: true }

    await receiveSocketEvent('updateRoom', {
      players,
      roomName: 'Renamed Team',
      hostId: 'test-socket',
    })
    await receiveSocketEvent('updateBoard', { board })
    await receiveSocketEvent('updateTimer', { timer })

    const retro = wrapper.getComponent(RetroBoard)
    expect(retro.props('players')).toEqual(players)
    expect(retro.props('room').roomName).toBe('Renamed Team')
    expect(retro.props('board')).toEqual(board)
    expect(retro.props('timer')).toEqual(timer)

    await receiveSocketEvent('updateBoard', { board: null })
    expect(retro.props('board').cards).toEqual([])
    expect(retro.props('board').columns).toHaveLength(3)
  })

  it('forwards retro timer events with the current room ID', async () => {
    const { wrapper } = await mountRoom()
    await receiveSocketEvent('roomJoined', {
      roomId: 'room-one',
      roomName: 'Team',
    })
    const retro = wrapper.getComponent(RetroBoard)

    for (const [event, command] of [
      ['start-timer', 'startTimer'],
      ['pause-timer', 'pauseTimer'],
      ['reset-timer', 'resetTimer'],
    ]) {
      retro.vm.$emit(event)
      expect(socket.emit).toHaveBeenLastCalledWith(command, {
        roomId: 'room-one',
      })
    }
  })

  it('clears a rejected session and preserves the tool when redirecting to join', async () => {
    const { router } = await mountRoom()

    await receiveSocketEvent('roomError', { message: 'Room not found.' })
    await flushPromises()

    expect(alert).toHaveBeenCalledWith('Room not found.')
    expect(localStorage.getItem('poker_session_room-one')).toBeNull()
    expect(router.currentRoute.value.fullPath).toBe('/join/room-one?tool=retro')
  })

  it('does not discard an active session for subsequent room errors', async () => {
    const { router } = await mountRoom()
    await receiveSocketEvent('roomJoined', {
      roomId: 'room-one',
      roomName: 'Team',
    })

    await receiveSocketEvent('roomError', { message: 'Action failed.' })

    expect(alert).toHaveBeenCalledWith('Action failed.')
    expect(localStorage.getItem('poker_session_room-one')).not.toBeNull()
    expect(router.currentRoute.value.path).toBe('/room/room-one')
  })

  it('removes its listeners but preserves room participants on unmount', async () => {
    const { wrapper } = await mountRoom()
    const listeners = socket.on.mock.calls.slice(1)
    await receiveSocketEvent('roomJoined', {
      roomId: 'room-one',
      roomName: 'Team',
    })
    roomPlayers.value = { alex: { user: 'Alex' } }
    wheelManualNames.value = ['Guest']

    wrapper.unmount()

    for (const [event, handler] of listeners) {
      expect(socket.off).toHaveBeenCalledWith(event, handler)
    }
    expect(roomPlayers.value).toEqual({ alex: { user: 'Alex' } })
    expect(wheelManualNames.value).toEqual(['Guest'])
    expect(showTools.value).toBe(false)
    expect(localStorage.getItem('poker_session_room-one')).not.toBeNull()
  })
})
