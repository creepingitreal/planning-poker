import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import socket from '../../../socket.js'
import { receiveSocketEvent } from '../../test/helpers.js'
import Poker from './Poker.vue'

const mountPoker = (players = {}) =>
  mount(Poker, {
    props: { players, room: { roomId: 'room-one' } },
  })

describe('Poker', () => {
  it('renders all voting options and disables reveal without votes', () => {
    const wrapper = mountPoker()

    expect(
      wrapper.findAll('.vote-option').map((button) => button.text()),
    ).toEqual(['1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'])
    expect(wrapper.get('.reveal-btn').element.disabled).toBe(true)
  })

  it('sends the selected vote and highlights its button', async () => {
    const wrapper = mountPoker()
    const option = wrapper
      .findAll('.vote-option')
      .find((button) => button.text() === '8')

    await option.trigger('click')

    expect(socket.emit).toHaveBeenLastCalledWith('castVote', {
      roomId: 'room-one',
      vote: 8,
    })
    expect(option.classes()).toContain('selected')
  })

  it('reveals server votes only after the visibility broadcast', async () => {
    const wrapper = mountPoker({
      alex: { user: 'Alex', vote: 3, color: '#123456' },
    })

    expect(wrapper.get('.vote').text()).toBe('')
    expect(wrapper.get('.reveal-btn').element.disabled).toBe(false)
    await wrapper.get('.reveal-btn').trigger('click')
    expect(wrapper.get('.vote').text()).toBe('')
    await receiveSocketEvent('toggleVisibility', true)
    expect(wrapper.get('.vote').text()).toBe('3')
  })

  it('clears the local selection when the server resets votes', async () => {
    const wrapper = mountPoker()
    await wrapper.get('.vote-option').trigger('click')

    await receiveSocketEvent('clearVotes')

    expect(wrapper.find('.vote-option.selected').exists()).toBe(false)
  })

  it('removes its exact socket listeners when unmounted', () => {
    const wrapper = mountPoker()
    const listeners = [...socket.on.mock.calls]

    wrapper.unmount()

    for (const [event, handler] of listeners) {
      expect(socket.off).toHaveBeenCalledWith(event, handler)
    }
  })
})
