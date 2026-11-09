import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SubNav from './SubNav.vue'

const mountNav = (props = {}) =>
  mount(SubNav, {
    props: {
      showTools: true,
      hasRoom: true,
      activeTool: 'retro',
      tabNames: ['poker', 'retro', 'wheel'],
      ...props,
    },
  })

describe('SubNav', () => {
  it('renders tool labels and marks only the active tool', () => {
    const wrapper = mountNav()

    expect(wrapper.findAll('.tool-tab').map((button) => button.text())).toEqual(
      ['Planning Poker', 'Retro Board', 'Spin the Wheel'],
    )
    expect(wrapper.findAll('.tool-tab.active')).toHaveLength(1)
    expect(wrapper.get('.tool-tab.active').text()).toBe('Retro Board')
  })

  it.each([{ showTools: false }, { hasRoom: false }])(
    'hides tools for %j',
    (props) => {
      expect(mountNav(props).find('nav').exists()).toBe(false)
    },
  )

  it('emits the requested tool without changing the active prop', async () => {
    const wrapper = mountNav()

    await wrapper.findAll('.tool-tab')[2].trigger('click')

    expect(wrapper.emitted('update:activeTool')).toEqual([['wheel']])
    expect(wrapper.get('.tool-tab.active').text()).toBe('Retro Board')
  })
})
