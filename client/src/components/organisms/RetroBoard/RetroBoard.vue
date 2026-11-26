<template>
  <section class="retro-board section-layout">
    <div class="retro-toolbar">
      <ButtonSection
        :is-visible="board.revealed"
        :has-votes="hasCards"
        :room-id="room.roomId"
        reveal-event="revealCards"
        reveal-label="Reveal Cards"
        hide-label="Hide Cards"
        clear-label="Clear Board"
        @clear="isConfirmingClear = true"
      />
      <MessageModal
        :open="isConfirmingClear"
        title="Clear board?"
        message="This will remove every card from the board."
        variant="warning"
        close-label="Cancel"
        confirm-label="Clear Board"
        @dismiss="isConfirmingClear = false"
        @confirm="clearBoard"
      />
      <div class="retro-timer">
        <button
          class="icon-only icon-btn-timer"
          @click="$emit('start-timer')"
          :disabled="timer.running || timer.remaining <= 0"
          aria-label="Start timer"
          title="Start"
        >
          ▶
        </button>
        <button
          class="icon-only icon-btn-timer"
          @click="$emit('pause-timer')"
          :disabled="!timer.running"
          aria-label="Pause timer"
          title="Pause"
        >
          ⏸
        </button>
        <button
          class="icon-only icon-btn-timer"
          @click="$emit('reset-timer')"
          aria-label="Reset timer"
          title="Reset"
        >
          ↺
        </button>
        <input
          v-if="isEditingTimer"
          :ref="setTimerInput"
          v-model="timerInputText"
          class="timer-display timer-input"
          type="text"
          inputmode="numeric"
          maxlength="5"
          placeholder="mm:ss"
          aria-label="Timer duration in minutes and seconds"
          @keydown.enter.prevent="commitTimerEdit"
          @keydown.esc.prevent="cancelTimerEdit"
          @blur="commitTimerEdit"
        />
        <button
          v-else
          class="timer-display timer-edit-btn"
          :disabled="timer.running"
          aria-label="Edit timer duration"
          :title="timer.running ? 'Pause to edit the time' : 'Set time'"
          @click="startTimerEdit"
        >
          {{ formattedTime }}
        </button>
      </div>
    </div>

    <div class="columns-container">
      <div v-for="column in board.columns" :key="column.id" class="retro-column">
        <input
          class="column-title"
          :value="column.title"
          aria-label="Board title"
          @change="updateColumnTitle(column.id, $event.target.value)"
          @keydown.enter.prevent="$event.target.blur()"
        />

        <div
          class="cards-list"
          :ref="(element) => setCardsList(column.id, element)"
        >
          <TransitionGroup
            tag="div"
            name="retro-card"
            class="cards-stack"
            :class="{ 'two-columns': twoColumnLists[column.id] }"
            :move-class="isResizingCards ? 'retro-card-resizing' : undefined"
            @before-leave="pinLeavingCard"
          >
            <RetroCard
              v-for="card in cardsForColumn(column.id)"
              :key="card.id"
              :data-card-id="card.id"
              row
              :class="{ 'retro-card-expanded': board.revealed && !card.hidden }"
              :hidden="card.hidden"
              :color="card.color"
              :icon-buttons="rowIconButtons(card)"
              :likes="card.likes"
              :my-likes="card.myLikes"
              :show-like="board.revealed && !card.hidden"
              @like="likeCard(card.id)"
              @unlike="unlikeCard(card.id)"
              @icon-click="(action) => handleCardAction(action, card)"
            >
              <span v-if="card.hidden" class="retro-card-placeholder"></span>
              <span v-else class="card-text">{{ card.text }}</span>
            </RetroCard>
          </TransitionGroup>
        </div>

        <button
          type="button"
          class="icon-only add-card-toggle"
          aria-label="Add card"
          title="Add card"
          :aria-expanded="isAddingCard(column.id)"
          :aria-controls="`card-form-${column.id}`"
          @click="startAddCard(column.id)"
        >
          <svg
            class="add-card-icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>

        <Transition name="card-overlay-backdrop">
          <div
            v-if="composer?.columnId === column.id"
            class="card-overlay-backdrop"
            data-testid="card-overlay-backdrop"
            @click="closeComposer"
          ></div>
        </Transition>

        <Transition name="card-overlay">
          <RetroCard
            v-if="composer?.columnId === column.id"
            :id="`card-form-${column.id}`"
            class="card-overlay"
            :class="editingCard ? 'edit-card-form' : 'add-card-form'"
            :color="editingCard?.color ?? myColor"
            :icon-buttons="editingCard ? saveCardIconButtons : addCardIconButtons"
            :show-like="false"
            @icon-click="submitComposer"
            @keydown.esc="closeComposer"
          >
            <textarea
              v-model="composerText"
              :ref="setComposerInput"
              placeholder="Write a card..."
              :aria-label="editingCard ? 'Card text' : 'New card text'"
              @input="fitTextInput"
              @keydown.enter.exact.prevent="submitComposer"
            ></textarea>
          </RetroCard>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script setup>
import socket from '../../../../socket.js'
import ButtonSection from '../../molecules/ButtonSection/ButtonSection.vue'
import MessageModal from '../../molecules/MessageModal/MessageModal.vue'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'
import RetroCard from '../../molecules/RetroCard/RetroCard.vue'
import './retro-board.css'

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
  players: {
    type: Object,
    default: () => ({}),
  },
  board: {
    type: Object,
    default: () => ({ columns: [], cards: [], revealed: false }),
  },
  timer: {
    type: Object,
    default: () => ({ duration: 300, remaining: 300, running: false }),
  },
})

const emit = defineEmits([
  'start-timer',
  'pause-timer',
  'reset-timer',
  'set-timer',
])

const newCardText = reactive({})
// { columnId, cardId } — cardId is null while composing a new card.
const composer = ref(null)
const composerInput = ref(null)
const editingText = ref('')
const twoColumnLists = reactive({})
const cardsListElements = {}
const isConfirmingClear = ref(false)
const isEditingTimer = ref(false)
const timerInputText = ref('')
const timerInput = ref(null)
const maxTimerSeconds = 99 * 60 + 59

// Take a removed card out of the flow where it stands, so the remaining cards
// can glide into its space while it fades out (works for both list layouts).
const pinLeavingCard = (element) => {
  const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = element
  Object.assign(element.style, {
    position: 'absolute',
    top: `${offsetTop}px`,
    left: `${offsetLeft}px`,
    width: `${offsetWidth}px`,
    height: `${offsetHeight}px`,
  })
}

const clearBoard = () => {
  isConfirmingClear.value = false
  socket.emit('clearBoard', { roomId: props.room.roomId })
}

const cardActionButtons = [
  {
    name: 'edit',
    class: 'icon-btn-edit',
    label: 'Edit card',
    title: 'Edit',
    iconName: 'edit-icon',
  },
  {
    name: 'delete',
    class: 'icon-btn-delete',
    label: 'Delete card',
    title: 'Delete',
    iconName: 'close-icon',
  },
]
const editingCardButton = {
  ...cardActionButtons[0],
  class: 'icon-btn-edit is-editing',
  label: 'Editing card',
  title: 'Being edited',
}
const addCardIconButtons = [
  {
    name: 'add',
    class: 'icon-btn-add add-card-btn',
    label: 'Add card',
    title: 'Add',
    iconName: 'tick-icon',
  },
]
const saveCardIconButtons = [
  {
    name: 'save',
    class: 'icon-btn-add',
    label: 'Save card',
    title: 'Save',
    iconName: 'tick-icon',
  },
]
const maxCardFontSize = 16
const minCardFontSize = 10
let cardsListObserver = null

const myColor = computed(() => props.players?.[socket.id]?.color ?? null)

const cardsForColumn = (columnId) =>
  props.board?.cards?.filter((c) => c.columnId === columnId) ?? []
const editingCard = computed(() => {
  const cardId = composer.value?.cardId
  if (!cardId) return null
  return props.board?.cards?.find((card) => card.id === cardId) ?? null
})
const rowIconButtons = (card) => {
  if (!card.isOwn) return []
  if (composer.value?.cardId !== card.id) return cardActionButtons
  return [editingCardButton, cardActionButtons[1]]
}
const isAddingCard = (columnId) =>
  composer.value?.columnId === columnId && !composer.value?.cardId
const composerText = computed({
  get: () =>
    composer.value?.cardId
      ? editingText.value
      : (newCardText[composer.value?.columnId] ?? ''),
  set: (text) => {
    if (composer.value?.cardId) {
      editingText.value = text
    } else if (composer.value) {
      newCardText[composer.value.columnId] = text
    }
  },
})

const setCardsList = (columnId, element) => {
  const previous = cardsListElements[columnId]
  if (previous === element) return
  if (previous) cardsListObserver?.unobserve(previous)

  if (element) {
    cardsListElements[columnId] = element
    cardsListObserver?.observe(element)
  } else {
    delete cardsListElements[columnId]
  }
}
// Revealed rows grow with their text, so measure the stack as a single column
// before deciding; toggling the class directly keeps the measurement in sync
// with the DOM even when the reactive value does not change.
const updateCardsListLayout = () => {
  Object.entries(cardsListElements).forEach(([columnId, list]) => {
    const stack = list.firstElementChild
    if (!stack) return

    stack.classList.remove('two-columns')
    const needsTwoColumns =
      stack.children.length > 1 && stack.scrollHeight > list.clientHeight
    stack.classList.toggle('two-columns', needsTwoColumns)
    twoColumnLists[columnId] = needsTwoColumns
  })
}

const fitTextElement = (element) => {
  if (!element) return

  element.style.fontSize = `${maxCardFontSize}px`
  element.style.lineHeight = '1.2'

  let fontSize = maxCardFontSize
  while (
    fontSize > minCardFontSize &&
    (element.scrollHeight > element.clientHeight ||
      element.scrollWidth > element.clientWidth)
  ) {
    fontSize -= 1
    element.style.fontSize = `${fontSize}px`
  }
}
const fitTextInput = (event) => {
  fitTextElement(event.target)
}
const setComposerInput = (element) => {
  composerInput.value = element
}

const openComposer = async (columnId, cardId = null) => {
  composer.value = { columnId, cardId }
  await nextTick()
  // Fit the text before focusing so the font never visibly jumps, and don't
  // let focusing scroll the column underneath the overlay.
  fitTextElement(composerInput.value)
  composerInput.value?.focus({ preventScroll: true })
}
const startAddCard = (columnId) => openComposer(columnId)
const startEdit = (card) => {
  editingText.value = card.text ?? ''
  openComposer(card.columnId, card.id)
}
const closeComposer = () => {
  composer.value = null
  editingText.value = ''
}

const hasCards = computed(() => props.board?.cards?.length > 0)

const formattedTime = computed(() => {
  const total = Math.max(0, props.timer?.remaining ?? 0)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

// Accepts "m", "mm", "m:ss" or "mm:ss"; a bare number is treated as minutes.
const parseTimerInput = (text) => {
  const match = /^\s*(\d{1,2})(?::([0-5]\d))?\s*$/.exec(text ?? '')
  if (!match) return null

  const total = Number(match[1]) * 60 + Number(match[2] ?? 0)
  return total > 0 && total <= maxTimerSeconds ? total : null
}
const setTimerInput = (element) => {
  timerInput.value = element
}
const startTimerEdit = async () => {
  if (props.timer?.running) return
  timerInputText.value = formattedTime.value
  isEditingTimer.value = true
  await nextTick()
  timerInput.value?.focus()
  timerInput.value?.select()
}
const cancelTimerEdit = () => {
  isEditingTimer.value = false
}
const commitTimerEdit = () => {
  if (!isEditingTimer.value) return
  isEditingTimer.value = false

  const duration = parseTimerInput(timerInputText.value)
  if (duration !== null) emit('set-timer', duration)
}

const updateColumnTitle = (columnId, title) => {
  socket.emit('updateColumnTitle', {
    roomId: props.room.roomId,
    columnId,
    title,
  })
}

const addColumn = () => {
  socket.emit('addColumn', { roomId: props.room.roomId })
}

const likeCard = (cardId) => {
  socket.emit('likeCard', { roomId: props.room.roomId, cardId })
}

const unlikeCard = (cardId) => {
  socket.emit('unlikeCard', { roomId: props.room.roomId, cardId })
}

const addCard = (columnId) => {
  const text = newCardText[columnId]
  if (!text?.trim()) return

  socket.emit('addCard', { roomId: props.room.roomId, columnId, text })
  newCardText[columnId] = ''
  closeComposer()
}

const saveEdit = (cardId) => {
  if (!editingText.value.trim()) return

  socket.emit('editCard', {
    roomId: props.room.roomId,
    cardId,
    text: editingText.value,
  })
  closeComposer()
}

const submitComposer = () => {
  if (!composer.value) return
  if (composer.value.cardId) {
    saveEdit(composer.value.cardId)
  } else {
    addCard(composer.value.columnId)
  }
}

const handleCardAction = (action, card) => {
  if (action === 'edit') {
    startEdit(card)
    return
  }

  if (action === 'delete') {
    deleteCard(card.id)
  }
}

const deleteCard = (cardId) => {
  socket.emit('deleteCard', { roomId: props.room.roomId, cardId })
}

onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    cardsListObserver = new ResizeObserver(updateCardsListLayout)
    Object.values(cardsListElements).forEach((list) =>
      cardsListObserver.observe(list),
    )
  }
  nextTick(updateCardsListLayout)
})

onUnmounted(() => {
  cardsListObserver?.disconnect()
  cardsListObserver = null
})

watch(
  () => [props.board?.cards, props.board?.columns, props.board?.revealed],
  () => nextTick(updateCardsListLayout),
  { deep: true, flush: 'post' },
)

// Revealing or hiding changes each row's height. Animate every row from its
// old height to its new one so the list grows and shrinks smoothly, and pause
// the list's move transition meanwhile so the two don't fight each other.
const isResizingCards = ref(false)
const cardRevealState = computed(() =>
  Object.fromEntries(
    (props.board?.cards ?? []).map((card) => [
      card.id,
      Boolean(props.board.revealed && !card.hidden),
    ]),
  ),
)
const cardElements = () =>
  Object.values(cardsListElements).flatMap((list) => [
    ...list.querySelectorAll('[data-card-id]'),
  ])
const readMotion = () => {
  const styles = getComputedStyle(document.documentElement)
  return {
    duration: parseFloat(styles.getPropertyValue('--motion-duration')) || 350,
    easing: styles.getPropertyValue('--motion-ease').trim() || 'ease-in-out',
  }
}

watch(
  cardRevealState,
  async (next, previous = {}) => {
    const revealChanged = Object.keys(next).some(
      (id) => id in previous && previous[id] !== next[id],
    )
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (
      !revealChanged ||
      reduceMotion ||
      typeof Element.prototype.animate !== 'function'
    )
      return

    const oldHeights = new Map(
      cardElements().map((element) => [
        element.dataset.cardId,
        element.offsetHeight,
      ]),
    )
    isResizingCards.value = true
    await nextTick()
    updateCardsListLayout()

    const { duration, easing } = readMotion()
    const animations = cardElements().flatMap((element) => {
      const from = oldHeights.get(element.dataset.cardId)
      const to = element.offsetHeight
      if (from === undefined || from === to) return []
      return element.animate(
        [
          { height: `${from}px`, overflow: 'hidden' },
          { height: `${to}px`, overflow: 'hidden' },
        ],
        { duration, easing },
      )
    })

    await Promise.allSettled(animations.map((animation) => animation.finished))
    isResizingCards.value = false
  },
  { flush: 'pre' },
)

// Close the edit view if the card is deleted or the board is cleared.
watch(editingCard, (card) => {
  if (!card && composer.value?.cardId) closeComposer()
})
</script>
