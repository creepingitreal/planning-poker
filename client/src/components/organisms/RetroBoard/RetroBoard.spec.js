import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import socket from '../../../../socket.js'
import RetroBoard from './RetroBoard.vue'

const ownCard = {
  id: 'card-one',
  columnId: 'well',
  text: 'Good collaboration',
  isOwn: true,
  color: '#123456',
  likes: 2,
  likedByMe: false,
}
const mountBoard = (props = {}) =>
  mount(RetroBoard, {
    props: {
      room: { roomId: 'room-one' },
      players: { 'test-socket': { color: '#123456' } },
      board: {
        columns: [
          { id: 'well', title: 'Went Well' },
          { id: 'improve', title: 'Improve' },
        ],
        cards: [ownCard],
        revealed: false,
      },
      ...props,
    },
  })

describe('RetroBoard', () => {
  it('groups cards by column and hides likes before reveal', () => {
    const wrapper = mountBoard()
    const columns = wrapper.findAll('.retro-column')

    expect(columns[0].get('.card-text').text()).toBe('Good collaboration')
    expect(columns[1].find('.retro-card').exists()).toBe(false)
    expect(wrapper.find('.card-like-button').exists()).toBe(false)
    expect(wrapper.get('.reveal-btn').text()).toBe('Reveal Cards')
  })

  it('does not render hidden card text or other authors editing controls', () => {
    const wrapper = mountBoard({
      board: {
        columns: [{ id: 'well', title: 'Went Well' }],
        cards: [
          { ...ownCard, text: 'Private text', hidden: true, isOwn: false },
        ],
        revealed: false,
      },
    })

    expect(wrapper.text()).not.toContain('Private text')
    expect(wrapper.find('.retro-card-placeholder').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Edit card"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Delete card"]').exists()).toBe(false)
  })

  it('opens a composer, rejects blank text, and sends a new card', async () => {
    const wrapper = mountBoard()
    const toggle = wrapper.get('.add-card-toggle')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await wrapper.get('.add-card-form textarea').setValue('   ')
    await wrapper.get('[aria-label="Add card"]').trigger('click')
    expect(socket.emit).not.toHaveBeenCalled()

    await wrapper.get('.add-card-form textarea').setValue('A useful action')
    await wrapper
      .get('.add-card-form textarea')
      .trigger('keydown', { key: 'Enter' })

    expect(socket.emit).toHaveBeenLastCalledWith('addCard', {
      roomId: 'room-one',
      columnId: 'well',
      text: 'A useful action',
    })
    expect(wrapper.find('.add-card-form').exists()).toBe(false)
    expect(wrapper.findAll('.card-text')).toHaveLength(1)
  })

  it('sends an edit once even if enter is followed by blur', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[aria-label="Edit card"]').trigger('click')
    const input = wrapper.get('.cards-list textarea')
    await input.setValue('Updated feedback')
    await input.trigger('keydown', { key: 'Enter' })
    await input.trigger('blur')

    expect(socket.emit).toHaveBeenCalledTimes(1)
    expect(socket.emit).toHaveBeenCalledWith('editCard', {
      roomId: 'room-one',
      cardId: 'card-one',
      text: 'Updated feedback',
    })
    expect(wrapper.get('.card-text').text()).toBe('Good collaboration')
  })

  it('requests deletion without removing a card before the server update', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[aria-label="Delete card"]').trigger('click')

    expect(socket.emit).toHaveBeenCalledWith('deleteCard', {
      roomId: 'room-one',
      cardId: 'card-one',
    })
    expect(wrapper.get('.card-text').text()).toBe('Good collaboration')
  })

  it('sends likes for revealed cards and supports board reveal and clear', async () => {
    const wrapper = mountBoard({
      board: {
        columns: [{ id: 'well', title: 'Well' }],
        cards: [ownCard],
        revealed: true,
      },
    })

    await wrapper.get('.card-like-button').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('toggleCardLike', {
      roomId: 'room-one',
      cardId: 'card-one',
    })
    await wrapper.get('.reveal-btn').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('revealCards', {
      roomId: 'room-one',
      visibility: false,
    })
    await wrapper.get('.button-section .accent').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('clearBoard', {
      roomId: 'room-one',
    })
  })

  it('sends column title changes', async () => {
    const wrapper = mountBoard()

    await wrapper.get('.column-title').setValue('Successes')

    expect(socket.emit).toHaveBeenCalledWith('updateColumnTitle', {
      roomId: 'room-one',
      columnId: 'well',
      title: 'Successes',
    })
  })

  it('formats time, emits timer commands, and disables invalid actions', async () => {
    const wrapper = mountBoard({
      timer: { duration: 300, remaining: 65, running: false },
    })

    expect(wrapper.get('.timer-display').text()).toBe('1:05')
    expect(wrapper.get('[aria-label="Pause timer"]').element.disabled).toBe(
      true,
    )
    await wrapper.get('[aria-label="Start timer"]').trigger('click')
    await wrapper.get('[aria-label="Reset timer"]').trigger('click')
    expect(wrapper.emitted('start-timer')).toEqual([[]])
    expect(wrapper.emitted('reset-timer')).toEqual([[]])

    await wrapper.setProps({
      timer: { duration: 300, remaining: 65, running: true },
    })
    expect(wrapper.get('[aria-label="Start timer"]').element.disabled).toBe(
      true,
    )
    await wrapper.get('[aria-label="Pause timer"]').trigger('click')
    expect(wrapper.emitted('pause-timer')).toEqual([[]])

    await wrapper.setProps({
      timer: { duration: 300, remaining: 0, running: false },
    })
    expect(wrapper.get('[aria-label="Start timer"]').element.disabled).toBe(
      true,
    )
    expect(wrapper.get('.timer-display').text()).toBe('0:00')
  })
})
