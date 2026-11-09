import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SpinTheWheel from './SpinTheWheel.vue'
import { getContrastingTextColour } from '../../../../shared/colourAllocation.mjs'

const spinnerApi = vi.hoisted(() => ({
  spinWheel: vi.fn(),
  drawWheel: vi.fn(),
}))

vi.mock('vue-wheel-spinner', () => ({
  default: {
    name: 'VueWheelSpinner',
    props: ['slices', 'winnerIndex', 'sounds', 'sliceFontStyle'],
    emits: ['spin-start', 'spin-end'],
    methods: spinnerApi,
    template: '<div class="wheel-spinner"><slot /></div>',
  },
}))

let resizeObserver

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback) {
        this.callback = callback
        this.observe = vi.fn()
        this.disconnect = vi.fn()
        resizeObserver = this
      }
    },
  )
})

describe('SpinTheWheel', () => {
  it.each([
    ['#000000', '#ffffff'],
    ['#ffffff', '#000000'],
    ['#123456', '#ffffff'],
    ['#abcdef', '#000000'],
    ['#777777', '#000000'],
    ['#000', '#ffffff'],
    ['#FFF', '#000000'],
    [null, '#000000'],
    ['invalid', '#000000'],
  ])('chooses the highest contrast text for %s', (background, foreground) => {
    expect(getContrastingTextColour(background)).toBe(foreground)
  })

  it('reads the canvas font from the brand token', async () => {
    vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => 'Georgia, serif',
    })
    const wrapper = mount(SpinTheWheel)
    await nextTick()

    expect(
      wrapper.getComponent({ name: 'VueWheelSpinner' }).props('sliceFontStyle'),
    ).toBe('bold 16px Georgia, serif')
  })

  it('disables spinning when there are no participants', async () => {
    const wrapper = mount(SpinTheWheel)
    const spinner = wrapper.getComponent({ name: 'VueWheelSpinner' })

    expect(spinner.props('slices')).toEqual([])
    expect(spinner.props('winnerIndex')).toBe(0)
    expect(spinner.props('sounds')).toEqual({ spinning: null, won: null })
    expect(wrapper.get('.spin-button').element.disabled).toBe(true)
    await wrapper.get('.spin-button').trigger('click')
    expect(spinnerApi.spinWheel).not.toHaveBeenCalled()
  })

  it('combines unique room and manual participants while preserving assigned colours', () => {
    const wrapper = mount(SpinTheWheel, {
      props: {
        players: {
          alex: { user: 'Alex', color: '#123456' },
          duplicate: { user: 'Alex', color: '#123456' },
          sam: { user: 'Sam', color: '#abcdef' },
          empty: { user: '' },
        },
        manualNames: ['Alex', 'Guest'],
      },
    })
    const slices = wrapper
      .getComponent({ name: 'VueWheelSpinner' })
      .props('slices')

    expect(slices.map((slice) => slice.text)).toEqual(['Alex', 'Sam', 'Guest'])
    expect(slices[0].color).toBe('#123456')
    expect(slices[1].color).toBe('#abcdef')
    expect(slices[0].textColor).toBe('#ffffff')
    expect(slices[1].textColor).toBe('#000000')
    expect(new Set(slices.map((slice) => slice.color)).size).toBe(3)
    expect(wrapper.get('.spin-button').element.disabled).toBe(false)
  })

  it('clamps the configured winner to the available slices before spinning', async () => {
    const wrapper = mount(SpinTheWheel, {
      props: { manualNames: ['Alex', 'Sam'] },
    })
    await wrapper.setData({ defaultWinner: 20 })

    expect(
      wrapper.getComponent({ name: 'VueWheelSpinner' }).props('winnerIndex'),
    ).toBe(1)
    await wrapper.get('.spin-button').trigger('click')
    expect(spinnerApi.spinWheel).toHaveBeenCalledWith(1)
  })

  it('prevents additional spins during animation and records the reported winner', async () => {
    const wrapper = mount(SpinTheWheel, {
      props: { manualNames: ['Alex', 'Sam'] },
    })
    const spinner = wrapper.getComponent({ name: 'VueWheelSpinner' })
    await wrapper.setData({ winnerResult: { text: 'Previous winner' } })

    spinner.vm.$emit('spin-start')
    await nextTick()
    expect(wrapper.vm.winnerResult).toBeNull()
    expect(wrapper.get('.spin-button').element.disabled).toBe(true)
    await wrapper.get('.spin-button').trigger('click')
    expect(spinnerApi.spinWheel).not.toHaveBeenCalled()

    spinner.vm.$emit('spin-end', 1)
    await nextTick()
    expect(wrapper.vm.winnerResult.text).toBe('Sam')
    expect(wrapper.get('.spin-button').element.disabled).toBe(false)
  })

  it('redraws only at a positive width and disconnects its observer on unmount', () => {
    const wrapper = mount(SpinTheWheel)

    expect(resizeObserver.observe).toHaveBeenCalledWith(wrapper.element)
    resizeObserver.callback([{ contentRect: { width: 0 } }])
    expect(spinnerApi.drawWheel).not.toHaveBeenCalled()
    resizeObserver.callback([{ contentRect: { width: 640 } }])
    expect(spinnerApi.drawWheel).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    expect(resizeObserver.disconnect).toHaveBeenCalledTimes(1)
  })
})
