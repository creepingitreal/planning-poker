import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MessageModal from './MessageModal.vue'
import App from '../../../App.vue'
import { createTestRouter } from '../../../test/helpers.js'
import { currentMessage, showMessage } from '../../../js/messages.js'

describe('MessageModal', () => {
  it('shows queued messages in order and preserves them across navigation', async () => {
    const router = await createTestRouter('/')
    mount(App, {
      global: {
        plugins: [router],
        stubs: { RouterView: true, SidePanel: true },
      },
    })
    showMessage('First warning', { variant: 'warning' })
    showMessage('Second error', { variant: 'error', title: 'Unable to join' })
    await flushPromises()
    const dialog = document.querySelector('dialog')
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('p').textContent).toBe('First warning')

    await router.push('/dashboard')
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('p').textContent).toBe('First warning')
    dialog.querySelector('button').click()
    await flushPromises()
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('h2').textContent).toBe('Unable to join')
    expect(dialog.querySelector('p').textContent).toBe('Second error')
    expect(document.body.style.overflow).toBe('hidden')

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
    await flushPromises()
    expect(currentMessage.value).toBeNull()
    expect(dialog.open).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('stays closed until requested', () => {
    mount(MessageModal, { props: { message: 'A message' } })
    expect(document.querySelector('dialog').open).toBe(false)
  })

  it('opens with an accessible warning, focuses OK, and emits dismissal', async () => {
    const wrapper = mount(MessageModal, {
      props: {
        open: true,
        message: 'Please enter your name',
        variant: 'warning',
      },
    })
    const dialog = document.querySelector('dialog')
    expect(dialog.open).toBe(true)
    expect(dialog.getAttribute('role')).toBe('alertdialog')
    expect(
      document.getElementById(dialog.getAttribute('aria-labelledby'))
        .textContent,
    ).toBe('Warning')
    expect(
      document.getElementById(dialog.getAttribute('aria-describedby'))
        .textContent,
    ).toBe('Please enter your name')
    expect(document.activeElement).toBe(dialog.querySelector('button'))
    expect(document.body.style.overflow).toBe('hidden')
    dialog.querySelector('button').click()
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
    await wrapper.setProps({ open: false })
    expect(dialog.open).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('supports custom text, safe message rendering, and Escape', () => {
    const wrapper = mount(MessageModal, {
      props: {
        open: true,
        title: 'Unable to join',
        message: '<b>Try again</b>',
        variant: 'error',
        closeLabel: 'Dismiss',
      },
    })
    const dialog = document.querySelector('dialog')
    expect(dialog.querySelector('h2').textContent).toBe('Unable to join')
    expect(dialog.querySelector('p').textContent).toBe('<b>Try again</b>')
    expect(dialog.querySelector('b')).toBeNull()
    expect(dialog.querySelector('button').textContent).toBe('Dismiss')
    const cancel = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('restores focus and scrolling on close and unmount', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    document.body.style.overflow = 'auto'
    const wrapper = mount(MessageModal, { props: { message: 'Saved' } })
    await wrapper.setProps({ open: true })
    await wrapper.setProps({ open: false })
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('auto')
    await wrapper.setProps({ open: true })
    wrapper.unmount()
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('auto')
    document.body.style.overflow = ''
    trigger.remove()
  })
})
