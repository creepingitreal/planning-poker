import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import socket from '../../../../socket.js'
import RetroBoard from './RetroBoard.vue'

const ownCard = {
  id: 'card-one',
  columnId: 'well',
  text: 'Good collaboration',
  isOwn: true,
  color: '#123456',
  likes: 2,
  myLikes: 0,
}
const otherCard = {
  id: 'card-two',
  columnId: 'well',
  text: 'Clear goals',
  isOwn: false,
  color: '#abcdef',
  likes: 3,
  myLikes: 1,
}
const mountBoard = (props = {}, options = {}) =>
  mount(RetroBoard, {
    ...options,
    props: {
      room: { roomId: 'room-one' },
      players: { 'test-socket': { color: '#123456' } },
      board: {
        columns: [
          { id: 'well', title: 'Went Well' },
          { id: 'improve', title: 'Improve' },
        ],
        cards: [ownCard],
        revealed: false,
      },
      ...props,
    },
  })

const revealedBoard = (cards) => ({
  columns: [{ id: 'well', title: 'Went Well' }],
  cards,
  revealed: true,
})
const firstRow = (wrapper) => wrapper.get('.cards-list .retro-card')
const clickRowTool = async (wrapper, label) => {
  await firstRow(wrapper).get(`[aria-label="${label}"]`).trigger('click')
}

describe('RetroBoard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists cards as rows per column with author tools and no likes while hidden', () => {
    const wrapper = mountBoard()
    const columns = wrapper.findAll('.retro-column')
    const row = firstRow(wrapper)

    expect(row.classes()).toContain('retro-card-row')
    expect(row.classes()).not.toContain('retro-card-expanded')
    expect(row.get('.card-text').text()).toBe('Good collaboration')
    expect(row.find('[aria-label="Expand card"]').exists()).toBe(false)
    expect(row.find('[aria-label="Edit card"]').exists()).toBe(true)
    expect(row.find('[aria-label="Delete card"]').exists()).toBe(true)
    expect(columns[1].find('.retro-card').exists()).toBe(false)
    expect(wrapper.find('.card-like-button').exists()).toBe(false)
    expect(wrapper.get('.reveal-btn').text()).toBe('Reveal Cards')
  })

  it('does not render or offer tools on other authors hidden cards', () => {
    const wrapper = mountBoard({
      board: {
        columns: [{ id: 'well', title: 'Went Well' }],
        cards: [
          { ...ownCard, text: 'Private text', hidden: true, isOwn: false },
        ],
        revealed: false,
      },
    })

    expect(wrapper.text()).not.toContain('Private text')
    expect(wrapper.find('.retro-card-placeholder').exists()).toBe(true)
    expect(wrapper.find('.card-actions').exists()).toBe(false)
  })

  it('keeps author tools once revealed, shows likes, and expands rows to fit their content', () => {
    const wrapper = mountBoard({ board: revealedBoard([ownCard, otherCard]) })
    const [ownRow, otherRow] = wrapper.findAll('.cards-list .retro-card')

    for (const row of [ownRow, otherRow]) {
      expect(row.classes()).toContain('retro-card-expanded')
      expect(row.find('.card-like-button').exists()).toBe(true)
    }
    expect(ownRow.find('[aria-label="Edit card"]').exists()).toBe(true)
    expect(ownRow.find('[aria-label="Delete card"]').exists()).toBe(true)
    expect(otherRow.find('.card-actions').exists()).toBe(false)
  })

  it('keeps author tools on their own masked cards and edits them without exposing text in the row', async () => {
    const wrapper = mountBoard({
      board: {
        columns: [{ id: 'well', title: 'Went Well' }],
        cards: [{ ...ownCard, hidden: true }],
        revealed: false,
      },
    })

    expect(firstRow(wrapper).find('.retro-card-placeholder').exists()).toBe(true)
    expect(firstRow(wrapper).find('.card-text').exists()).toBe(false)

    await clickRowTool(wrapper, 'Edit card')
    expect(wrapper.get('.edit-card-form textarea').element.value).toBe(
      'Good collaboration',
    )
    await clickRowTool(wrapper, 'Delete card')
    expect(socket.emit).toHaveBeenLastCalledWith('deleteCard', {
      roomId: 'room-one',
      cardId: 'card-one',
    })
  })

  it('opens edits in the centred card form and saves with enter or the save button', async () => {
    const wrapper = mountBoard({}, { attachTo: document.body })

    await clickRowTool(wrapper, 'Edit card')
    await wrapper.vm.$nextTick()
    const form = wrapper.get('.edit-card-form')
    const input = form.get('textarea')
    expect(form.classes()).toContain('card-overlay')
    expect(wrapper.find('.add-card-form').exists()).toBe(false)
    expect(wrapper.get('.add-card-toggle').attributes('aria-expanded')).toBe(
      'false',
    )
    expect(input.attributes('aria-label')).toBe('Card text')
    expect(input.element.value).toBe('Good collaboration')
    expect(document.activeElement).toBe(input.element)
    const editingPencil = firstRow(wrapper).get('[aria-label="Editing card"]')
    expect(editingPencil.classes()).toContain('is-editing')
    expect(editingPencil.attributes('title')).toBe('Being edited')
    expect(firstRow(wrapper).find('[aria-label="Edit card"]').exists()).toBe(false)
    expect(firstRow(wrapper).find('[aria-label="Delete card"]').exists()).toBe(true)

    await input.setValue('   ')
    await form.get('[aria-label="Save card"]').trigger('click')
    expect(socket.emit).not.toHaveBeenCalled()

    await input.setValue('Updated feedback')
    await input.trigger('keydown', { key: 'Enter' })
    expect(socket.emit).toHaveBeenCalledTimes(1)
    expect(socket.emit).toHaveBeenCalledWith('editCard', {
      roomId: 'room-one',
      cardId: 'card-one',
      text: 'Updated feedback',
    })
    expect(wrapper.find('.card-overlay').exists()).toBe(false)
    expect(firstRow(wrapper).find('.is-editing').exists()).toBe(false)
    expect(firstRow(wrapper).get('.card-text').text()).toBe('Good collaboration')

    await clickRowTool(wrapper, 'Edit card')
    await wrapper.get('.edit-card-form textarea').setValue('Via button')
    await wrapper.get('[aria-label="Save card"]').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('editCard', {
      roomId: 'room-one',
      cardId: 'card-one',
      text: 'Via button',
    })
    wrapper.unmount()
  })

  it('exits an edit without saving when clicking outside or pressing escape', async () => {
    const wrapper = mountBoard()

    await clickRowTool(wrapper, 'Edit card')
    await wrapper.get('.edit-card-form textarea').setValue('Abandoned')
    await wrapper.get('[data-testid="card-overlay-backdrop"]').trigger('click')
    expect(wrapper.find('.card-overlay').exists()).toBe(false)

    await clickRowTool(wrapper, 'Edit card')
    expect(wrapper.get('.edit-card-form textarea').element.value).toBe(
      'Good collaboration',
    )
    await wrapper.get('.edit-card-form textarea').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.card-overlay').exists()).toBe(false)
    expect(socket.emit).not.toHaveBeenCalled()
  })

  it('keeps the add draft separate from edits', async () => {
    const wrapper = mountBoard()

    await wrapper.get('.add-card-toggle').trigger('click')
    await wrapper.get('.add-card-form textarea').setValue('Draft idea')
    await wrapper.get('[data-testid="card-overlay-backdrop"]').trigger('click')
    await clickRowTool(wrapper, 'Edit card')
    expect(wrapper.get('.edit-card-form textarea').element.value).toBe(
      'Good collaboration',
    )
    await wrapper.get('[data-testid="card-overlay-backdrop"]').trigger('click')
    await wrapper.get('.add-card-toggle').trigger('click')
    expect(wrapper.get('.add-card-form textarea').element.value).toBe('Draft idea')
  })

  it('requests deletion without removing a card before the server update', async () => {
    const wrapper = mountBoard()

    await clickRowTool(wrapper, 'Delete card')

    expect(socket.emit).toHaveBeenCalledWith('deleteCard', {
      roomId: 'room-one',
      cardId: 'card-one',
    })
    expect(firstRow(wrapper).get('.card-text').text()).toBe('Good collaboration')
  })

  it('closes the edit form when the card is removed from the board', async () => {
    const wrapper = mountBoard()

    await clickRowTool(wrapper, 'Edit card')
    await wrapper.setProps({
      board: { columns: [{ id: 'well', title: 'Went Well' }], cards: [], revealed: false },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.card-overlay').exists()).toBe(false)
  })

  it('places an icon-only add button in each column', () => {
    const wrapper = mountBoard()
    const buttons = wrapper.findAll('.add-card-toggle')

    expect(buttons).toHaveLength(2)
    expect(buttons[0].classes()).toContain('icon-only')
    expect(buttons[0].attributes('aria-label')).toBe('Add card')
    expect(buttons[0].attributes('aria-expanded')).toBe('false')
    expect(buttons[0].find('svg.add-card-icon').exists()).toBe(true)
  })

  it('opens a composer over the board, rejects blank text, and sends a new card', async () => {
    const wrapper = mountBoard({}, { attachTo: document.body })
    const toggle = wrapper.get('.add-card-toggle')

    await toggle.trigger('click')
    await wrapper.vm.$nextTick()
    expect(toggle.attributes('aria-expanded')).toBe('true')
    const form = wrapper.get('.add-card-form')
    expect(form.classes()).toContain('card-overlay')
    expect(form.attributes('id')).toBe(toggle.attributes('aria-controls'))
    expect(document.activeElement).toBe(form.get('textarea').element)

    await form.get('textarea').setValue('   ')
    await form.get('[aria-label="Add card"]').trigger('click')
    expect(socket.emit).not.toHaveBeenCalled()

    await form.get('textarea').setValue('A useful action')
    await form.get('textarea').trigger('keydown', { key: 'Enter' })

    expect(socket.emit).toHaveBeenLastCalledWith('addCard', {
      roomId: 'room-one',
      columnId: 'well',
      text: 'A useful action',
    })
    expect(wrapper.find('.add-card-form').exists()).toBe(false)
    expect(wrapper.find('.card-overlay-backdrop').exists()).toBe(false)
    expect(wrapper.findAll('.card-text')).toHaveLength(1)
    wrapper.unmount()
  })

  it('exits the composer when clicking outside or pressing escape, keeping the draft', async () => {
    const wrapper = mountBoard()

    await wrapper.findAll('.add-card-toggle')[1].trigger('click')
    expect(wrapper.findAll('.retro-column')[1].find('.add-card-form').exists()).toBe(true)
    await wrapper.get('.add-card-form textarea').setValue('Draft idea')
    await wrapper.get('[data-testid="card-overlay-backdrop"]').trigger('click')
    expect(wrapper.find('.add-card-form').exists()).toBe(false)
    expect(socket.emit).not.toHaveBeenCalled()

    await wrapper.findAll('.add-card-toggle')[1].trigger('click')
    expect(wrapper.get('.add-card-form textarea').element.value).toBe('Draft idea')
    await wrapper.get('.add-card-form textarea').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.add-card-form').exists()).toBe(false)
  })

  it('wraps rows into two columns only when they no longer fit the height', async () => {
    const observers = []
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback) {
          this.callback = callback
          this.observe = vi.fn()
          this.unobserve = vi.fn()
          this.disconnect = vi.fn()
          observers.push(this)
        }
      },
    )
    const cards = Array.from({ length: 5 }, (_, index) => ({
      ...otherCard,
      id: `card-${index}`,
    }))
    let listHeight = 1000
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(300)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(
      () => listHeight,
    )
    const wrapper = mountBoard({
      board: {
        columns: [
          { id: 'well', title: 'Went Well' },
          { id: 'improve', title: 'Improve' },
        ],
        cards,
        revealed: false,
      },
    })
    await wrapper.vm.$nextTick()
    const [list, emptyList] = wrapper.findAll('.cards-list')
    const stack = list.get('.cards-stack')

    expect(observers[0].observe).toHaveBeenCalledWith(list.element)
    expect(stack.classes()).not.toContain('two-columns')

    listHeight = 100
    observers[0].callback()
    await wrapper.vm.$nextTick()
    expect(stack.classes()).toContain('two-columns')
    expect(emptyList.get('.cards-stack').classes()).not.toContain('two-columns')

    listHeight = 1000
    observers[0].callback()
    await wrapper.vm.$nextTick()
    expect(stack.classes()).not.toContain('two-columns')

    wrapper.unmount()
    expect(observers[0].disconnect).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('sends likes for revealed cards and supports board reveal and clear', async () => {
    const wrapper = mountBoard({
      board: {
        columns: [{ id: 'well', title: 'Well' }],
        cards: [ownCard, otherCard],
        revealed: true,
      },
    })
    const [ownLike, otherLike] = wrapper.findAll('.card-like-button')

    expect(ownLike.text()).toContain('2')
    await ownLike.trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('likeCard', {
      roomId: 'room-one',
      cardId: 'card-one',
    })

    expect(otherLike.text()).toContain('3')
    expect(otherLike.classes()).toContain('liked')
    await otherLike.trigger('click')
    await otherLike.trigger('click')
    expect(socket.emit).toHaveBeenCalledTimes(3)
    expect(socket.emit).toHaveBeenLastCalledWith('likeCard', {
      roomId: 'room-one',
      cardId: 'card-two',
    })
    await wrapper.get('.card-unlike-button').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('unlikeCard', {
      roomId: 'room-one',
      cardId: 'card-two',
    })
    await wrapper.get('.reveal-btn').trigger('click')
    expect(socket.emit).toHaveBeenLastCalledWith('revealCards', {
      roomId: 'room-one',
      visibility: false,
    })
    await wrapper.get('.button-section .accent').trigger('click')
    const dialog = document.querySelector('dialog')
    expect(dialog.open).toBe(true)
    expect(dialog.querySelector('h2').textContent).toBe('Clear board?')
    expect(socket.emit).not.toHaveBeenCalledWith('clearBoard', expect.anything())

    dialog.querySelector('button').click()
    await wrapper.vm.$nextTick()
    expect(dialog.open).toBe(false)
    expect(socket.emit).not.toHaveBeenCalledWith('clearBoard', expect.anything())

    await wrapper.get('.button-section .accent').trigger('click')
    dialog.querySelector('.message-modal-confirm').click()
    await wrapper.vm.$nextTick()
    expect(dialog.open).toBe(false)
    expect(socket.emit).toHaveBeenLastCalledWith('clearBoard', {
      roomId: 'room-one',
    })
  })

  it('sends column title changes', async () => {
    const wrapper = mountBoard()

    await wrapper.get('.column-title').setValue('Successes')

    expect(socket.emit).toHaveBeenCalledWith('updateColumnTitle', {
      roomId: 'room-one',
      columnId: 'well',
      title: 'Successes',
    })
  })

  it('formats time, emits timer commands, and disables invalid actions', async () => {
    const wrapper = mountBoard({
      timer: { duration: 300, remaining: 65, running: false },
    })

    expect(wrapper.get('.timer-display').text()).toBe('1:05')
    expect(wrapper.get('[aria-label="Pause timer"]').element.disabled).toBe(
      true,
    )
    await wrapper.get('[aria-label="Start timer"]').trigger('click')
    await wrapper.get('[aria-label="Reset timer"]').trigger('click')
    expect(wrapper.emitted('start-timer')).toEqual([[]])
    expect(wrapper.emitted('reset-timer')).toEqual([[]])

    await wrapper.setProps({
      timer: { duration: 300, remaining: 65, running: true },
    })
    expect(wrapper.get('[aria-label="Start timer"]').element.disabled).toBe(
      true,
    )
    await wrapper.get('[aria-label="Pause timer"]').trigger('click')
    expect(wrapper.emitted('pause-timer')).toEqual([[]])

    await wrapper.setProps({
      timer: { duration: 300, remaining: 0, running: false },
    })
    expect(wrapper.get('[aria-label="Start timer"]').element.disabled).toBe(
      true,
    )
    expect(wrapper.get('.timer-display').text()).toBe('0:00')
  })

  it('lets users type a custom time and emits it in seconds', async () => {
    const wrapper = mountBoard({
      timer: { duration: 300, remaining: 65, running: false },
    })
    const editTimer = async (text, key = 'enter') => {
      await wrapper.get('[aria-label="Edit timer duration"]').trigger('click')
      const input = wrapper.get('.timer-input')
      expect(input.element.value).toBe('1:05')
      await input.setValue(text)
      await input.trigger(`keydown.${key}`)
    }

    await editTimer('10')
    await editTimer('7:30')
    await editTimer('0:45')
    expect(wrapper.emitted('set-timer')).toEqual([[600], [450], [45]])

    for (const invalid of ['', 'abc', '0', '1:75', '100', '0:00']) {
      await editTimer(invalid)
    }
    await editTimer('3', 'esc')
    expect(wrapper.emitted('set-timer')).toHaveLength(3)
    expect(wrapper.find('.timer-input').exists()).toBe(false)

    await wrapper.get('[aria-label="Edit timer duration"]').trigger('click')
    await wrapper.get('.timer-input').setValue('2')
    await wrapper.get('.timer-input').trigger('blur')
    expect(wrapper.emitted('set-timer').at(-1)).toEqual([120])
  })

  it('does not allow editing the time while the timer is running', async () => {
    const wrapper = mountBoard({
      timer: { duration: 300, remaining: 65, running: true },
    })
    const editButton = wrapper.get('[aria-label="Edit timer duration"]')

    expect(editButton.element.disabled).toBe(true)
    await editButton.trigger('click')
    expect(wrapper.find('.timer-input').exists()).toBe(false)
  })
})
