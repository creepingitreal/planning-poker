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
  })
})
