import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import socket from '../../../../socket.js'
import ButtonSection from './ButtonSection.vue'

const mountControls = (props = {}) =>
  mount(ButtonSection, {
    props: { roomId: 'room-one', isVisible: false, hasVotes: true, ...props },
  })

describe('ButtonSection', () => {
  it('disables reveal until there are votes', async () => {
    const wrapper = mountControls({ hasVotes: false })

    expect(wrapper.get('.reveal-btn').element.disabled).toBe(true)
    await wrapper.get('.reveal-btn').trigger('click')
    expect(socket.emit).not.toHaveBeenCalled()
  })

  it('reveals and hides votes using the current visibility', async () => {
    const wrapper = mountControls()

    await wrapper.get('.reveal-btn').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('revealVotes', {
      roomId: 'room-one',
      visibility: true,
    })

    await wrapper.setProps({ isVisible: true })
    expect(wrapper.get('.reveal-btn').text()).toBe('Hide Votes')
    await wrapper.get('.reveal-btn').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('revealVotes', {
      roomId: 'room-one',
      visibility: false,
    })
  })

  it('supports retro labels and emits clear intent without sending it', async () => {
    const wrapper = mountControls({
      revealEvent: 'revealCards',
      revealLabel: 'Reveal Cards',
      clearLabel: 'Clear Board',
    })

    expect(wrapper.get('.reveal-btn').text()).toBe('Reveal Cards')
    expect(wrapper.get('.accent').text()).toBe('Clear Board')
    await wrapper.get('.reveal-btn').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('revealCards', {
      roomId: 'room-one',
      visibility: true,
    })
    await wrapper.get('.accent').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(socket.emit).toHaveBeenCalledTimes(1)
  })

  it('can hide reveal while keeping clear available', async () => {
    const wrapper = mountControls({ showReveal: false })

    expect(wrapper.find('.reveal-btn').exists()).toBe(false)
    expect(wrapper.get('.accent').text()).toBe('Clear Votes')
    await wrapper.get('.accent').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })
})
