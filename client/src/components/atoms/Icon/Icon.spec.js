import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Icon from './Icon.vue'

vi.unmock('./Icon.vue')

const waitForSvg = (wrapper) =>
  vi.waitFor(() => {
    if (!wrapper.find('svg').exists()) throw new Error('SVG not loaded')
  })

const mountIcon = (props) => {
  const errorHandler = vi.fn()
  const wrapper = mount(Icon, {
    props,
    global: { config: { errorHandler, warnHandler: () => {} } },
  })
  return { wrapper, errorHandler }
}

describe('Icon', () => {
  it('renders the named SVG with the default classes', async () => {
    const { wrapper, errorHandler } = mountIcon({ name: 'coffee-icon' })
    await waitForSvg(wrapper)

    const svg = wrapper.get('svg')
    expect(svg.classes()).toEqual(
      expect.arrayContaining(['fill-current', 'text-current', 'icon']),
    )
    expect(errorHandler).not.toHaveBeenCalled()
  })

  it('applies a custom class and can omit the icon class', async () => {
    const { wrapper } = mountIcon({
      name: 'link-icon',
      className: 'icon small',
      isIcon: false,
    })
    await waitForSvg(wrapper)

    expect(wrapper.get('svg').classes()).toEqual(['icon', 'small'])
  })

  it('reports an error for an unknown icon', async () => {
    const { wrapper, errorHandler } = mountIcon({ name: 'missing-icon' })
    await flushPromises()

    expect(wrapper.find('svg').exists()).toBe(false)
    expect(errorHandler.mock.calls[0][0].message).toContain('Unknown icon path')
  })
})
