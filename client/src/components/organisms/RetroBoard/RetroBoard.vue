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
      <div
        class="retro-column-wrapper"
        v-for="column in board.columns"
        :key="column.id"
      >
        <div class="retro-column">
          <input
            class="column-title"
            :value="column.title"
            aria-label="Board title"
            @change="updateColumnTitle(column.id, $event.target.value)"
            @keydown.enter.prevent="$event.target.blur()"
          />

          <div class="cards-list">
            <RetroCard
              v-for="card in cardsForColumn(column.id)"
              :key="card.id"
              :hidden="card.hidden"
              :color="card.color"
              :icon-buttons="cardIconButtons(card)"
              :likes="card.likes"
              :my-likes="card.myLikes"
              :show-like="board.revealed && !card.hidden"
              @like="likeCard(card.id)"
              @unlike="unlikeCard(card.id)"
              @icon-click="(action) => handleCardAction(action, card)"
            >
              <template v-if="card.hidden">
                <div class="retro-card-placeholder"></div>
              </template>

              <template v-else>
                <textarea
                  v-if="editingCardId === card.id"
                  v-model="editingText"
                  @input="fitTextInput"
                  @blur="saveEdit(card.id)"
                  @keydown.enter.exact.prevent="saveEdit(card.id)"
                  :ref="setEditInput"
                ></textarea>
                <p
                  v-else
                  class="card-text"
                  :ref="(element) => setCardTextElement(card.id, element)"
                >
                  {{ card.text }}
                </p>
              </template>
            </RetroCard>
          </div>
        </div>

        <div
          class="write-card-control"
          :ref="(element) => setWriteCardControl(column.id, element)"
        >
          <button
            class="outline small add-card-toggle"
            @click="toggleWriteCard(column.id)"
            :aria-expanded="isWriteCardOpen(column.id)"
            :aria-controls="`add-card-form-${column.id}`"
            :ref="(element) => setWriteCardButton(column.id, element)"
          >
            {{ isWriteCardOpen(column.id) ? '-' : '+' }}
          </button>

          <RetroCard
            class="add-card-form"
            :class="{ 'open-up': writeCardPlacements[column.id] === 'up' }"
            v-if="isWriteCardOpen(column.id)"
            :id="`add-card-form-${column.id}`"
            :ref="(element) => setWriteCardForm(column.id, element)"
            :color="myColor"
            :icon-buttons="addCardIconButtons"
            :show-like="false"
            @icon-click="addCard(column.id)"
          >
            <textarea
              v-model="newCardText[column.id]"
              placeholder="Write a card..."
              @input="fitTextInput"
              @keydown.enter.exact.prevent="addCard(column.id)"
            ></textarea>
          </RetroCard>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import socket from '../../../../socket.js'
import ButtonSection from '../../molecules/ButtonSection/ButtonSection.vue'
import MessageModal from '../../molecules/MessageModal/MessageModal.vue'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
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
const openWriteCards = reactive({})
const writeCardPlacements = reactive({})
const writeCardControls = {}
const writeCardButtons = {}
const writeCardForms = {}
const cardTextElements = {}
const editingCardId = ref(null)
const editingText = ref('')
const editInput = ref(null)
const isConfirmingClear = ref(false)
const isEditingTimer = ref(false)
const timerInputText = ref('')
const timerInput = ref(null)
const maxTimerSeconds = 99 * 60 + 59

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
    icon: '✎',
  },
  {
    name: 'delete',
    class: 'icon-btn-delete',
    label: 'Delete card',
    title: 'Delete',
    icon: '✕',
  },
]
const addCardIconButtons = [
  {
    name: 'add',
    class: 'icon-btn-add add-card-btn',
    label: 'Add card',
    title: 'Add',
    icon: '✓',
  },
]
const maxCardFontSize = 16
const minCardFontSize = 10

const myColor = computed(() => props.players?.[socket.id]?.color ?? null)

const cardsForColumn = (columnId) =>
  props.board?.cards?.filter((c) => c.columnId === columnId) ?? []
const cardIconButtons = (card) =>
  card.isOwn && editingCardId.value !== card.id ? cardActionButtons : []
const setCardTextElement = (cardId, element) => {
  if (element) {
    cardTextElements[cardId] = element
  } else {
    delete cardTextElements[cardId]
  }
}
const setEditInput = (element) => {
  editInput.value = element
  fitTextElement(element)
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
const fitCardText = () =>
  Object.values(cardTextElements).forEach(fitTextElement)
const isWriteCardOpen = (columnId) => openWriteCards[columnId] === true
const setWriteCardControl = (columnId, element) => {
  if (element) {
    writeCardControls[columnId] = element
  } else {
    delete writeCardControls[columnId]
  }
}
const setWriteCardButton = (columnId, element) => {
  if (element) {
    writeCardButtons[columnId] = element
  } else {
    delete writeCardButtons[columnId]
  }
}
const setWriteCardForm = (columnId, element) => {
  const cardElement =
    element?.cardElement?.value ??
    element?.cardElement ??
    element?.$el ??
    element

  if (cardElement) {
    writeCardForms[columnId] = cardElement
  } else {
    delete writeCardForms[columnId]
  }
}
const positionWriteCard = (columnId) => {
  const control = writeCardControls[columnId]
  const form = writeCardForms[columnId]
  const button = writeCardButtons[columnId]

  if (!control || !form) return

  if (button) {
    control.style.setProperty(
      '--write-card-button-width',
      `${button.offsetWidth}px`,
    )
  }

  // The form is anchored beside the button: top-aligned by default, or
  // bottom-aligned when top-aligning would push it past the board's bounds.
  const controlRect = control.getBoundingClientRect()
  const bounds = control.closest('.columns-container')?.getBoundingClientRect()
  const boundsTop = bounds?.top ?? 0
  const boundsBottom = bounds?.bottom ?? window.innerHeight
  const formHeight = form.offsetHeight
  const wouldOverflowBottom = controlRect.top + formHeight > boundsBottom
  const hasRoomAbove = controlRect.bottom - formHeight >= boundsTop

  writeCardPlacements[columnId] =
    wouldOverflowBottom && hasRoomAbove ? 'up' : 'down'
}
const toggleWriteCard = async (columnId) => {
  openWriteCards[columnId] = !isWriteCardOpen(columnId)

  if (openWriteCards[columnId]) {
    writeCardPlacements[columnId] = 'down'
    await nextTick()
    positionWriteCard(columnId)
  }
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
  openWriteCards[columnId] = false
  writeCardPlacements[columnId] = 'down'
}

const startEdit = (card) => {
  editingCardId.value = card.id
  editingText.value = card.text
  nextTick(() => {
    editInput.value?.focus()
    fitTextElement(editInput.value)
  })
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

const saveEdit = (cardId) => {
  if (editingCardId.value !== cardId) return

  socket.emit('editCard', {
    roomId: props.room.roomId,
    cardId,
    text: editingText.value,
  })
  editingCardId.value = null
  editingText.value = ''
}

const deleteCard = (cardId) => {
  socket.emit('deleteCard', { roomId: props.room.roomId, cardId })
}

onMounted(() => {
  nextTick(fitCardText)
})

watch(
  () => [props.board?.revealed, props.board?.cards, editingCardId.value],
  () => nextTick(fitCardText),
  { deep: true, flush: 'post' },
)
</script>
