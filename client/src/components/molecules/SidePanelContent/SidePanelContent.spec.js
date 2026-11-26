import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SidePanelContent from './SidePanelContent.vue'

describe('SidePanelContent', () => {
  it('shows only its trigger while collapsed and requests the panel to open', async () => {
    const wrapper = mount(SidePanelContent, {
      props: { showPanel: false, iconName: 'user-icon', title: 'Users' },
      slots: { default: '<p>Panel content</p>' },
    })

    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Panel content')
    await wrapper.get('.content-title').trigger('click')
    expect(wrapper.emitted('openPanel')).toEqual([[]])
  })

  it('renders its heading and slot when expanded', () => {
    const wrapper = mount(SidePanelContent, {
      props: { showPanel: true, iconName: 'tools-icon', title: 'Tools' },
      slots: { default: '<p>Panel content</p>' },
    })

    expect(wrapper.get('h2').text()).toBe('Tools')
    expect(wrapper.text()).toContain('Panel content')
    expect(wrapper.get('.content-item').classes()).toContain('tools')
    expect(wrapper.get('.content-item').classes()).not.toContain('active')
  })

  it('marks itself active when it represents the current screen', () => {
    const wrapper = mount(SidePanelContent, {
      props: {
        showPanel: false,
        iconName: 'tools-icon',
        title: 'Tools',
        active: true,
      },
    })

    expect(wrapper.get('.content-item').classes()).toContain('active')
  })

  it('animates the body height between 0 and its content height', () => {
    const transitions = []
    const TransitionStub = {
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        transitions.push(attrs)
        return () => slots.default?.()
      },
    }
    mount(SidePanelContent, {
      props: { showPanel: false, iconName: 'tools-icon', title: 'Tools' },
      slots: { default: '<p>Panel content</p>' },
      global: {
        stubs: { transition: TransitionStub },
      },
    })
    const hooks = transitions.find((attrs) => attrs.name === 'side-panel-expand')
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollHeight', { value: 120 })

    hooks.onBeforeEnter(el)
    expect(el.style.height).toBe('0px')
    hooks.onEnter(el)
    expect(el.style.height).toBe('120px')
    hooks.onAfterEnter(el)
    expect(el.style.height).toBe('')
    hooks.onLeave(el)
    expect(el.style.height).toBe('0px')
    hooks.onAfterLeave(el)
    expect(el.style.height).toBe('')
  })
})
