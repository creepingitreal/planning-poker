import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RetroCard from './RetroCard.vue'

describe('RetroCard', () => {
  it('renders its chosen element, slot, and participant colour', () => {
    const wrapper = mount(RetroCard, {
      props: { as: 'article', color: '#123456' },
      slots: { default: '<p>Useful feedback</p>' },
    })

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.text()).toContain('Useful feedback')
    expect(wrapper.element.style.backgroundColor).toBe('rgb(18, 52, 86)')
    expect(wrapper.element.style.borderColor).toBe('rgb(18, 52, 86)')
    expect(wrapper.element.style.color).toBe('rgb(255, 255, 255)')
  })

  it('updates text contrast when the participant colour changes', async () => {
    const wrapper = mount(RetroCard, { props: { color: '#123456' } })

    await wrapper.setProps({ color: '#abcdef' })
    expect(wrapper.element.style.color).toBe('rgb(0, 0, 0)')
    await wrapper.setProps({ color: null })
    expect(wrapper.element.style.color).toBe('')
  })

  it('emits the named card action', async () => {
    const wrapper = mount(RetroCard, {
      props: {
        iconButtons: [
          { name: 'edit', label: 'Edit card', title: 'Edit', icon: 'E' },
        ],
      },
    })

    await wrapper.get('[aria-label="Edit card"]').trigger('click')

    expect(wrapper.emitted('icon-click')).toEqual([['edit']])
  })

  it('shows the like count and emits a toggle without changing props', async () => {
    const wrapper = mount(RetroCard, { props: { likes: 3, liked: true } })
    const button = wrapper.get('[aria-label="Unlike card"]')

    expect(button.text()).toContain('3')
    expect(button.classes()).toContain('liked')
    await button.trigger('click')
    expect(wrapper.emitted('like')).toEqual([[]])
    expect(wrapper.props('likes')).toBe(3)
  })

  it('blocks likes on hidden cards and can remove the like control', async () => {
    const wrapper = mount(RetroCard, { props: { hidden: true } })

    expect(wrapper.classes()).toContain('retro-card-hidden')
    await wrapper.get('.card-like-button').trigger('click')
    expect(wrapper.emitted('like')).toBeUndefined()
    await wrapper.setProps({ showLike: false })
    expect(wrapper.find('.card-like-button').exists()).toBe(false)
  })
})
