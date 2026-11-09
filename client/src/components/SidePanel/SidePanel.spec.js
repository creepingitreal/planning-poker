import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { activeTool, currentRoom, showTools } from '../../js/roomNav.js'
import SidePanel from './SidePanel.vue'
import { brand } from '../../brand/index.js'

describe('SidePanel', () => {
  it('uses the brand mark and full logo without the generic icon renderer', async () => {
    const wrapper = mount(SidePanel)

    expect(wrapper.get('.brand-logo').attributes('src')).toBe(brand.logoMarkUrl)
    expect(wrapper.get('.brand-logo').attributes('alt')).toBe(brand.logoAlt)
    expect(wrapper.get('.logo').attributes('aria-label')).toContain(brand.name)
    expect(wrapper.get('.logo').attributes('aria-expanded')).toBe('false')
    await wrapper.get('.logo').trigger('click')
    expect(wrapper.get('.brand-logo').attributes('src')).toBe(brand.logoUrl)
    expect(wrapper.get('.logo').attributes('aria-expanded')).toBe('true')
  })

  it('opens from the logo and closes from the backdrop', async () => {
    const wrapper = mount(SidePanel)

    expect(wrapper.get('aside').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.side-panel-backdrop').exists()).toBe(false)
    await wrapper.get('.logo').trigger('click')
    expect(wrapper.get('aside').classes()).toContain('open')
    expect(wrapper.get('aside').attributes('aria-hidden')).toBe('false')
    await wrapper.get('.side-panel-backdrop').trigger('click')
    expect(wrapper.get('aside').attributes('aria-hidden')).toBe('true')
  })

  it('opens from a section trigger and supports the close button', async () => {
    const wrapper = mount(SidePanel)

    await wrapper.get('.content-title.users').trigger('click')
    expect(wrapper.get('aside').classes()).toContain('open')
    await wrapper.get('[aria-label="Close side panel"]').trigger('click')
    expect(wrapper.get('aside').classes()).not.toContain('open')
  })

  it('integrates tool selection with shared room navigation', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    showTools.value = true
    const wrapper = mount(SidePanel)

    await wrapper.get('.logo').trigger('click')
    const wheel = wrapper
      .findAll('.tool-tab')
      .find((button) => button.text() === 'Spin the Wheel')
    await wheel.trigger('click')

    expect(activeTool.value).toBe('wheel')
    expect(wrapper.get('.tool-tab.active').text()).toBe('Spin the Wheel')
  })
})
