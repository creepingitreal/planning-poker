<template>
  <section class="retro-board section-layout">
    <div class="columns-container">
      <div class="retro-column-wrapper" v-for="column in board.columns" :key="column.id">
        <div class="retro-column">
          <h3 class="column-title">{{ column.title }}</h3>

          <div class="cards-list">
            <div
                v-for="card in cardsForColumn(column.id)"
                :key="card.id"
                class="retro-card"
                :class="{ 'retro-card-hidden': isFaceDown(card) }"
                :style="cardStyle(card)"
            >
              <div class="card-actions" v-if="card.isOwn && editingCardId !== card.id">
                <button
                    class="icon-only card-icon-btn"
                    @click="startEdit(card)"
                    aria-label="Edit card"
                    title="Edit"
                >
                  ✎
                </button>
                <button
                    class="icon-only card-icon-btn"
                    @click="deleteCard(card.id)"
                    aria-label="Delete card"
                    title="Delete"
                >
                  ✕
                </button>
              </div>

              <template v-if="isFaceDown(card)">
                <div class="retro-card-placeholder"></div>
              </template>

              <template v-else>
                <textarea
                    v-if="editingCardId === card.id"
                    v-model="editingText"
                    @blur="saveEdit(card.id)"
                    @keydown.enter.exact.prevent="saveEdit(card.id)"
                    ref="editInputs"
                ></textarea>
                <p v-else>{{ card.text }}</p>
              </template>
            </div>
          </div>
        </div>

        <button
            v-if="!board.revealed"
            class="outline small add-card-toggle"
            @click="toggleWriteCard(column.id)"
            :aria-expanded="isWriteCardOpen(column.id)"
            :aria-controls="`add-card-form-${column.id}`"
        >
          {{ isWriteCardOpen(column.id) ? 'Hide writing card' : '+ Write card' }}
        </button>

        <div
            class="add-card-form"
            v-if="!board.revealed && isWriteCardOpen(column.id)"
            :id="`add-card-form-${column.id}`"
            :style="cardFormStyle"
        >
          <button
              class="icon-only card-icon-btn icon-btn-add add-card-btn"
              @click="addCard(column.id)"
              aria-label="Add card"
              title="Add"
          >
            ✓
          </button>
          <textarea
              v-model="newCardText[column.id]"
              placeholder="Write a card..."
              @keydown.enter.exact.prevent="addCard(column.id)"
          ></textarea>
        </div>
      </div>
    </div>
        <div class="retro-toolbar">
      <div class="button-section">
        <button v-if="!board.revealed" @click="revealCards" class="secondary-blue">
          Reveal Cards
        </button>
        <button v-if="isHost" @click="clearBoard" class="white">
          Clear Board
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import socket from "../../socket.js";
import {computed, nextTick, reactive, ref} from "vue";
import '../css/retro-board.css';

const props = defineProps({
  room: {
    type: Object,
    required: true
  },
  players: {
    type: Object,
    default: () => ({})
  },
  hostId: {
    type: String,
    default: null
  },
  board: {
    type: Object,
    default: () => ({columns: [], cards: [], revealed: false})
  }
});

const newCardText = reactive({});
const openWriteCards = reactive({});
const editingCardId = ref(null);
const editingText = ref('');
const editInputs = ref([]);

const isHost = computed(() => socket.id && socket.id === props.hostId);
const myColor = computed(() => props.players?.[socket.id]?.color ?? null);
const pastelCardColor = (color) => `color-mix(in srgb, ${color} 32%, white)`;
const lighterPastelCardColor = (color) => `color-mix(in srgb, ${color} 18%, white)`;
const cardFormStyle = computed(() => {
  if (!myColor.value) return {};

  return {
    backgroundColor: lighterPastelCardColor(myColor.value),
    borderColor: pastelCardColor(myColor.value),
  };
});

const cardsForColumn = (columnId) => props.board?.cards?.filter(c => c.columnId === columnId) ?? [];
const isWriteCardOpen = (columnId) => openWriteCards[columnId] === true;
const toggleWriteCard = (columnId) => {
  openWriteCards[columnId] = !isWriteCardOpen(columnId);
};

// A card is face-down until the board is revealed - including the author's
// own cards - except while the author is actively editing it, so they can see
// what they're typing/changing.
const isFaceDown = (card) => !props.board?.revealed && editingCardId.value !== card.id;

// Face-down cards render as a solid block of the author's colour so cards are
// visually attributable at a glance without revealing their text. Once
// revealed (or being edited), the colour becomes just an outline on a normal
// white card.
const cardStyle = (card) => {
  if (!card.color) return {};

  return {
    backgroundColor: pastelCardColor(card.color),
    borderColor: pastelCardColor(card.color),
  };
};

const addCard = (columnId) => {
  const text = newCardText[columnId];
  if (!text?.trim()) return;

  socket.emit('addCard', {roomId: props.room.roomId, columnId, text});
  newCardText[columnId] = '';
  openWriteCards[columnId] = false;
};

const startEdit = (card) => {
  editingCardId.value = card.id;
  editingText.value = card.text;
  nextTick(() => editInputs.value?.[0]?.focus());
};

const saveEdit = (cardId) => {
  if (editingCardId.value !== cardId) return;

  socket.emit('editCard', {roomId: props.room.roomId, cardId, text: editingText.value});
  editingCardId.value = null;
  editingText.value = '';
};

const deleteCard = (cardId) => {
  socket.emit('deleteCard', {roomId: props.room.roomId, cardId});
};

const revealCards = () => {
  socket.emit('revealCards', {roomId: props.room.roomId});
};

const clearBoard = () => {
  socket.emit('clearBoard', {roomId: props.room.roomId});
};
</script>
