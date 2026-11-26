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

  it('shows the total tally and emits a like each time it is clicked', async () => {
    const wrapper = mount(RetroCard, { props: { likes: 3 } })
    const button = wrapper.get('[aria-label="Like card"]')

    expect(button.text()).toContain('3')
    expect(button.classes()).not.toContain('liked')
    await button.trigger('click')
    await button.trigger('click')
    expect(wrapper.emitted('like')).toEqual([[], []])
    expect(wrapper.props('likes')).toBe(3)
  })

  it('highlights and labels the current users own like count', async () => {
    const wrapper = mount(RetroCard, { props: { likes: 5, myLikes: 1 } })

    expect(wrapper.get('.card-like-button').classes()).toContain('liked')
    expect(
      wrapper.get('[aria-label="Like card again (you liked 1 time)"]').exists(),
    ).toBe(true)
    await wrapper.setProps({ myLikes: 2 })
    expect(
      wrapper.get('[aria-label="Like card again (you liked 2 times)"]').exists(),
    ).toBe(true)
  })

  it('only offers removing a like after the user has liked the card', async () => {
    const wrapper = mount(RetroCard, { props: { likes: 2 } })

    expect(wrapper.find('.card-unlike-button').exists()).toBe(false)
    await wrapper.setProps({ myLikes: 2 })
    await wrapper
      .get('[aria-label="Remove one of your likes"]')
      .trigger('click')
    expect(wrapper.emitted('unlike')).toEqual([[]])
    expect(wrapper.props('myLikes')).toBe(2)
  })

  it('blocks likes on hidden cards and can remove the like control', async () => {
    const wrapper = mount(RetroCard, { props: { hidden: true, myLikes: 1 } })

    expect(wrapper.classes()).toContain('retro-card-hidden')
    await wrapper.get('.card-like-button').trigger('click')
    await wrapper.get('.card-unlike-button').trigger('click')
    expect(wrapper.emitted('like')).toBeUndefined()
    expect(wrapper.emitted('unlike')).toBeUndefined()
    await wrapper.setProps({ showLike: false })
    expect(wrapper.find('.card-like-button').exists()).toBe(false)
  })
})
