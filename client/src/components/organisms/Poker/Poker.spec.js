import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import socket from '../../../../socket.js'
import { receiveSocketEvent } from '../../../test/helpers.js'
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
    ).toEqual(['1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', ''])
    expect(
      wrapper
        .findAll('.vote-option')
        .at(-1)
        .find('[name="coffee-icon"]')
        .exists(),
    ).toBe(true)
    expect(wrapper.get('.reveal-btn').element.disabled).toBe(true)
  })

  it('sends a coffee break vote', async () => {
    const wrapper = mountPoker()
    const option = wrapper.findAll('.vote-option').at(-1)

    await option.trigger('click')

    expect(socket.emit).toHaveBeenLastCalledWith('castVote', {
      roomId: 'room-one',
      vote: 'coffee',
    })
    expect(option.classes()).toContain('selected')
  })

  it('colours the vote options with the current player colour', () => {
    const wrapper = mountPoker({
      'test-socket': { user: 'Alex', vote: null, color: '#123456' },
      other: { user: 'Sam', vote: null, color: '#abcdef' },
    })

    expect(
      wrapper
        .findAll('.vote-option')
        .map((option) => option.element.style.getPropertyValue('--vote-bg')),
    ).toEqual(Array(12).fill('#123456'))
  })

  it('keeps the default option colour before the player joins', () => {
    const wrapper = mountPoker()

    expect(
      wrapper.get('.vote-option').element.style.getPropertyValue('--vote-bg'),
    ).toBe('')
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

  it('asks for confirmation before clearing votes', async () => {
    const wrapper = mountPoker()
    const dialog = document.querySelector('dialog')
    expect(dialog.open).toBe(false)

    await wrapper.get('.button-section .accent').trigger('click')
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('h2').textContent).toBe('Clear votes?')
    expect(socket.emit).not.toHaveBeenCalled()

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
    await wrapper.vm.$nextTick()
    expect(dialog.open).toBe(false)
    expect(socket.emit).not.toHaveBeenCalled()

    await wrapper.get('.button-section .accent').trigger('click')
    dialog.querySelector('.message-modal-confirm').click()
    await wrapper.vm.$nextTick()
    expect(dialog.open).toBe(false)
    expect(socket.emit).toHaveBeenCalledExactlyOnceWith('clearVotes', {
      roomId: 'room-one',
    })
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
