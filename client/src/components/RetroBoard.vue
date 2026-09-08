<template>
  <section class="retro-board section-layout">
    <div class="button-section">
      <button v-if="isHost" @click="clearBoard" class="secondary-blue">
        Clear Board
      </button>
    </div>

    <div class="columns-container">
      <div class="retro-column" v-for="column in columns" :key="column.id">
        <h3 class="column-title">{{ column.title }}</h3>

        <draggable
            class="cards-list"
            :list="column.cards"
            group="retro-cards"
            item-key="id"
            :data-column-id="column.id"
            @change="(event) => handleChange(column.id, event)"
        >
          <template #item="{ element: card }">
            <div class="retro-card">
              <textarea
                  v-if="editingCardId === card.id"
                  v-model="editingText"
                  @blur="saveEdit(column.id, card.id)"
                  @keydown.enter.exact.prevent="saveEdit(column.id, card.id)"
                  ref="editInputs"
              ></textarea>
              <p v-else @click="startEdit(card)">{{ card.text }}</p>

              <div class="card-footer">
                <span class="card-author">{{ card.authorName }}</span>
                <button class="card-delete" @click="deleteCard(column.id, card.id)" aria-label="Delete card">
                  &times;
                </button>
              </div>
            </div>
          </template>
        </draggable>

        <div class="add-card-form">
          <textarea
              v-model="newCardText[column.id]"
              placeholder="Add a card..."
              @keydown.enter.exact.prevent="addCard(column.id)"
          ></textarea>
          <button @click="addCard(column.id)" class="secondary-blue">
            Add
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import socket from "../../socket.js";
import {computed, nextTick, reactive, ref} from "vue";
import draggable from "vuedraggable";
import '../css/retro-board.css';

const props = defineProps({
  room: {
    type: Object,
    required: true
  },
  hostId: {
    type: String,
    default: null
  },
  board: {
    type: Object,
    default: () => ({columns: []})
  }
});

const columns = computed(() => props.board?.columns ?? []);
const newCardText = reactive({});
const editingCardId = ref(null);
const editingText = ref('');
const editInputs = ref([]);

const isHost = computed(() => socket.id && socket.id === props.hostId);

const addCard = (columnId) => {
  const text = newCardText[columnId];
  if (!text?.trim()) return;

  socket.emit('addCard', {roomId: props.room.roomId, columnId, text});
  newCardText[columnId] = '';
};

const startEdit = (card) => {
  editingCardId.value = card.id;
  editingText.value = card.text;
  nextTick(() => editInputs.value?.[0]?.focus());
};

const saveEdit = (columnId, cardId) => {
  if (editingCardId.value !== cardId) return;

  socket.emit('editCard', {roomId: props.room.roomId, columnId, cardId, text: editingText.value});
  editingCardId.value = null;
  editingText.value = '';
};

const deleteCard = (columnId, cardId) => {
  socket.emit('deleteCard', {roomId: props.room.roomId, columnId, cardId});
};

const clearBoard = () => {
  socket.emit('clearBoard', {roomId: props.room.roomId});
};

// vuedraggable emits `added`/`removed`/`moved` change events per-list; we only need
// to notify the server when a card lands in a column (covers both move and reorder).
const handleChange = (columnId, event) => {
  if (event.added) {
    socket.emit('moveCard', {
      roomId: props.room.roomId,
      cardId: event.added.element.id,
      fromColumnId: findSourceColumnId(event.added.element.id, columnId),
      toColumnId: columnId,
      toIndex: event.added.newIndex,
    });
  } else if (event.moved) {
    socket.emit('moveCard', {
      roomId: props.room.roomId,
      cardId: event.moved.element.id,
      fromColumnId: columnId,
      toColumnId: columnId,
      toIndex: event.moved.newIndex,
    });
  }
};

// Local column list has already been mutated by vuedraggable by the time `added`
// fires, so the source column is whichever other column no longer contains the card.
const findSourceColumnId = (cardId, targetColumnId) => {
  const source = columns.value.find(col =>
      col.id !== targetColumnId && !col.cards.some(c => c.id === cardId)
  );
  return source?.id ?? targetColumnId;
};
</script>
