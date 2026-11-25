import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Vote from './Vote.vue'

describe('Vote', () => {
  it.each([
    ['#123456', 'rgb(255, 255, 255)'],
    ['#abcdef', 'rgb(0, 0, 0)'],
  ])('uses contrasting text for participant colour %s', (color, foreground) => {
    const wrapper = mount(Vote, { props: { vote: 8, color } })

    expect(wrapper.get('.vote').element.style.color).toBe(foreground)
  })

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

  it('shows a coffee icon for a revealed coffee vote only', async () => {
    const wrapper = mount(Vote, { props: { vote: 'coffee' } })

    const icon = wrapper.get('[name="coffee-icon"]')
    expect(icon.classes()).toContain('icon')
    expect(icon.attributes()).toMatchObject({
      role: 'img',
      'aria-label': 'Coffee break',
    })
    expect(wrapper.get('.vote').text()).toBe('')
    await wrapper.setProps({ isVisible: false })
    expect(wrapper.find('[name="coffee-icon"]').exists()).toBe(false)
  })

  it('shows non-numeric votes as text', () => {
    const wrapper = mount(Vote, { props: { vote: '?' } })

    expect(wrapper.get('.vote').text()).toBe('?')
  })

  it('ignores clicks on a board card', async () => {
    const wrapper = mount(Vote, { props: { vote: 5 } })

    expect(wrapper.get('.vote').element.tagName).toBe('DIV')
    await wrapper.get('.vote').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  describe('as a selectable option', () => {
    const mountOption = (props) =>
      mount(Vote, { props: { selectable: true, ...props } })

    it('renders an option button instead of a board card', () => {
      const wrapper = mountOption({ vote: 'coffee' })
      const button = wrapper.get('button.vote-option')

      expect(button.attributes('type')).toBe('button')
      expect(button.classes()).not.toContain('selected')
      expect(button.find('[name="coffee-icon"]').exists()).toBe(true)
      expect(wrapper.find('.vote').exists()).toBe(false)
    })

    it('uses the player colour through CSS variables', () => {
      const wrapper = mountOption({ vote: 5, color: '#123456' })
      const { style } = wrapper.get('.vote-option').element

      expect(style.getPropertyValue('--vote-bg')).toBe('#123456')
      expect(style.getPropertyValue('--vote-fg')).toBe('#ffffff')
      expect(style.backgroundColor).toBe('')
    })

    it('marks the selected option', () => {
      const wrapper = mountOption({ vote: 5, selected: true })

      expect(wrapper.get('.vote-option').classes()).toContain('selected')
    })

    it('emits select with its value when clicked', async () => {
      const wrapper = mountOption({ vote: 13 })

      await wrapper.get('.vote-option').trigger('click')

      expect(wrapper.emitted('select')).toEqual([[13]])
    })
  })
})
