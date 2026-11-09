import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Vote from './Vote.vue'

describe('Vote', () => {
  it('does not render a card for an uncast vote', () => {
    const wrapper = mount(Vote, { props: { vote: null } })

    expect(wrapper.find('.vote').exists()).toBe(false)
  })

  it('renders a coloured card without exposing a hidden vote', () => {
    const wrapper = mount(Vote, {
      props: { vote: 8, isVisible: false, color: '#123456' },
    })

    expect(wrapper.get('.vote').text()).toBe('')
    expect(wrapper.get('.vote').classes()).not.toContain('visible')
    expect(wrapper.get('.vote').element.style.backgroundColor).toBe(
      'rgb(18, 52, 86)',
    )
  })

  it('shows the vote when revealed and hides it again when requested', async () => {
    const wrapper = mount(Vote, { props: { vote: 5 } })

    expect(wrapper.get('.vote').text()).toBe('5')
    expect(wrapper.get('.vote').classes()).toContain('visible')
    await wrapper.setProps({ isVisible: false })
    expect(wrapper.get('.vote').text()).toBe('')
  })
})
