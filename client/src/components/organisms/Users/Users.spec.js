import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import socket from '../../../../socket.js'
import Users from './Users.vue'

describe('Users', () => {
  it('labels only the current participant, even when names match', () => {
    const wrapper = mount(Users, {
      props: {
        players: {
          [socket.id]: { user: 'Alex', color: '#123456' },
          other: { user: 'Alex', color: '#abcdef' },
        },
        manualNames: ['Guest'],
      },
    })

    const names = wrapper
      .findAll('.users-list-item')
      .map((row) => row.findAll('span')[1].text())
    expect(names).toEqual(['Alex (you)', 'Alex', 'Guest'])
  })

  it('shows the empty state and hides manual controls by default', () => {
    const wrapper = mount(Users)

    expect(wrapper.get('.empty-users').text()).toBe('No users have joined yet.')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows room participants with their server-assigned colour', () => {
    const wrapper = mount(Users, {
      props: { players: { alex: { user: 'Alex', color: '#123456' } } },
    })

    expect(wrapper.get('.users-list-item').text()).toContain('Alex')
    expect(wrapper.get('.users-list-item').text()).toContain('In session')
    expect(wrapper.get('.user-colour-dot').element.style.backgroundColor).toBe(
      'rgb(18, 52, 86)',
    )
  })

  it('emits a trimmed manual name without mutating its props', async () => {
    const manualNames = ['Guest']
    const wrapper = mount(Users, { props: { allowManual: true, manualNames } })

    await wrapper.get('input').setValue('  Sam  ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('update:manualNames')).toEqual([[['Guest', 'Sam']]])
    expect(manualNames).toEqual(['Guest'])
    expect(wrapper.get('input').element.value).toBe('')
  })

  it.each(['   ', ' alex ', 'GUEST'])(
    'rejects blank or duplicate name %j',
    async (name) => {
      const wrapper = mount(Users, {
        props: {
          allowManual: true,
          players: { alex: { user: 'Alex', color: '#123456' } },
          manualNames: ['Guest'],
        },
      })

      await wrapper.get('input').setValue(name)
      await wrapper.get('form').trigger('submit')

      expect(wrapper.emitted('update:manualNames')).toBeUndefined()
    },
  )

  it('removes only the requested manual participant', async () => {
    const wrapper = mount(Users, {
      props: { allowManual: true, manualNames: ['Alex', 'Sam'] },
    })

    await wrapper.get('[aria-label="Remove Alex"]').trigger('click')

    expect(wrapper.emitted('update:manualNames')).toEqual([[['Sam']]])
  })
})
