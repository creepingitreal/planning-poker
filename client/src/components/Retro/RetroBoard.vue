<template>
  <section class="retro-board section-layout">
    <div class="columns-container">
      <div
        class="retro-column-wrapper"
        v-for="column in board.columns"
        :key="column.id"
      >
        <div class="retro-column">
          <h3 class="column-title">{{ column.title }}</h3>

          <div class="cards-list">
            <RetroCard
              v-for="card in cardsForColumn(column.id)"
              :key="card.id"
              :hidden="isFaceDown(card)"
              :color="card.color"
              :icon-buttons="cardIconButtons(card)"
              @icon-click="(action) => handleCardAction(action, card)"
            >
              <template v-if="isFaceDown(card)">
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
            {{
              isWriteCardOpen(column.id) ? "- Hide Retro Card" : "+ Retro Card"
            }}
          </button>

          <RetroCard
            class="add-card-form"
            :class="{ 'open-up': writeCardPlacements[column.id] === 'up' }"
            v-if="isWriteCardOpen(column.id)"
            :id="`add-card-form-${column.id}`"
            :ref="(element) => setWriteCardForm(column.id, element)"
            :color="myColor"
            :icon-buttons="addCardIconButtons"
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
import socket from "../../../socket.js";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import RetroCard from "../Retro/RetroCard.vue";
import "./retro-board.css";

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
  players: {
    type: Object,
    default: () => ({}),
  },
  hostId: {
    type: String,
    default: null,
  },
  board: {
    type: Object,
    default: () => ({ columns: [], cards: [], revealed: false }),
  },
});

const newCardText = reactive({});
const openWriteCards = reactive({});
const writeCardPlacements = reactive({});
const writeCardControls = {};
const writeCardButtons = {};
const writeCardForms = {};
const cardTextElements = {};
const editingCardId = ref(null);
const editingText = ref("");
const editInput = ref(null);

const cardActionButtons = [
  {
    name: "edit",
    class: "icon-btn-edit",
    label: "Edit card",
    title: "Edit",
    icon: "✎",
  },
  {
    name: "delete",
    class: "icon-btn-delete",
    label: "Delete card",
    title: "Delete",
    icon: "✕",
  },
];
const addCardIconButtons = [
  {
    name: "add",
    class: "icon-btn-add add-card-btn",
    label: "Add card",
    title: "Add",
    icon: "✓",
  },
];
const maxCardFontSize = 16;
const minCardFontSize = 10;

const myColor = computed(() => props.players?.[socket.id]?.color ?? null);

const cardsForColumn = (columnId) =>
  props.board?.cards?.filter((c) => c.columnId === columnId) ?? [];
const cardIconButtons = (card) =>
  card.isOwn && editingCardId.value !== card.id ? cardActionButtons : [];
const setCardTextElement = (cardId, element) => {
  if (element) {
    cardTextElements[cardId] = element;
  } else {
    delete cardTextElements[cardId];
  }
};
const setEditInput = (element) => {
  editInput.value = element;
  fitTextElement(element);
};
const fitTextElement = (element) => {
  if (!element) return;

  element.style.fontSize = `${maxCardFontSize}px`;
  element.style.lineHeight = "1.2";

  let fontSize = maxCardFontSize;
  while (
    fontSize > minCardFontSize &&
    (element.scrollHeight > element.clientHeight ||
      element.scrollWidth > element.clientWidth)
  ) {
    fontSize -= 1;
    element.style.fontSize = `${fontSize}px`;
  }
};
const fitTextInput = (event) => {
  fitTextElement(event.target);
};
const fitCardText = () =>
  Object.values(cardTextElements).forEach(fitTextElement);
const isWriteCardOpen = (columnId) => openWriteCards[columnId] === true;
const setWriteCardControl = (columnId, element) => {
  if (element) {
    writeCardControls[columnId] = element;
  } else {
    delete writeCardControls[columnId];
  }
};
const setWriteCardButton = (columnId, element) => {
  if (element) {
    writeCardButtons[columnId] = element;
  } else {
    delete writeCardButtons[columnId];
  }
};
const setWriteCardForm = (columnId, element) => {
  const cardElement =
    element?.cardElement?.value ??
    element?.cardElement ??
    element?.$el ??
    element;

  if (cardElement) {
    writeCardForms[columnId] = cardElement;
  } else {
    delete writeCardForms[columnId];
  }
};
const positionWriteCard = (columnId) => {
  const control = writeCardControls[columnId];
  const form = writeCardForms[columnId];
  const button = writeCardButtons[columnId];

  if (!control || !form) return;

  if (button) {
    control.style.setProperty(
      "--write-card-button-width",
      `${button.offsetWidth}px`,
    );
  }

  // The form is anchored beside the button: top-aligned by default, or
  // bottom-aligned when top-aligning would push it past the viewport.
  const controlRect = control.getBoundingClientRect();
  const formHeight = form.offsetHeight;
  const wouldOverflowBottom = controlRect.top + formHeight > window.innerHeight;
  const hasRoomAbove = controlRect.bottom - formHeight >= 0;

  writeCardPlacements[columnId] =
    wouldOverflowBottom && hasRoomAbove ? "up" : "down";
};
const toggleWriteCard = async (columnId) => {
  openWriteCards[columnId] = !isWriteCardOpen(columnId);

  if (openWriteCards[columnId]) {
    writeCardPlacements[columnId] = "down";
    await nextTick();
    positionWriteCard(columnId);
  }
};

// A card is face-down until the board is revealed - including the author's
// own cards - except while the author is actively editing it, so they can see
// what they're typing/changing.
const isFaceDown = (card) =>
  !props.board?.revealed && editingCardId.value !== card.id;

const addCard = (columnId) => {
  const text = newCardText[columnId];
  if (!text?.trim()) return;

  socket.emit("addCard", { roomId: props.room.roomId, columnId, text });
  newCardText[columnId] = "";
  openWriteCards[columnId] = false;
  writeCardPlacements[columnId] = "down";
};

const startEdit = (card) => {
  editingCardId.value = card.id;
  editingText.value = card.text;
  nextTick(() => {
    editInput.value?.focus();
    fitTextElement(editInput.value);
  });
};

const handleCardAction = (action, card) => {
  if (action === "edit") {
    startEdit(card);
    return;
  }

  if (action === "delete") {
    deleteCard(card.id);
  }
};

const saveEdit = (cardId) => {
  if (editingCardId.value !== cardId) return;

  socket.emit("editCard", {
    roomId: props.room.roomId,
    cardId,
    text: editingText.value,
  });
  editingCardId.value = null;
  editingText.value = "";
};

const deleteCard = (cardId) => {
  socket.emit("deleteCard", { roomId: props.room.roomId, cardId });
};

onMounted(() => {
  nextTick(fitCardText);
});

watch(
  () => [props.board?.revealed, props.board?.cards, editingCardId.value],
  () => nextTick(fitCardText),
  { deep: true, flush: "post" },
);
</script>
