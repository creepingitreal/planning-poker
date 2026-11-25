import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from './App.vue'
import { currentRoom } from './js/roomNav.js'
import { createTestRouter } from './test/helpers.js'

describe('App', () => {
  it('shows a back to dashboard link only on room routes', async () => {
    currentRoom.value = { roomId: 'room-one', roomName: 'Team' }
    const router = await createTestRouter('/room/room-one?tool=wheel')
    const wrapper = mount(App, {
      global: { plugins: [router], stubs: { RouterView: true } },
    })

    const backLink = wrapper.get('a.link')
    expect(backLink.text()).toContain('Back to dashboard')
    expect(backLink.attributes('href')).toBe('/dashboard')

    await backLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/dashboard')
    expect(wrapper.find('a.link').exists()).toBe(false)
  })
})
