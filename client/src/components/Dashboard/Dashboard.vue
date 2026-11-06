<template>
  <section class="dashboard">
    <div class="dashboard-heading">
      <h1>Choose your workspace</h1>
      <p>Start a session with the tool your team needs right now.</p>
      <button
        v-if="roomId"
        type="button"
        class="outline dashboard-new-room"
        @click="createNewRoom"
      >
        + Create new room
      </button>
    </div>

    <div class="dashboard-tools">
      <RouterLink
        v-for="tool in tools"
        :key="tool.id"
        class="dashboard-tool"
        :to="toolLink(tool.id)"
      >
        <span class="dashboard-tool-index">{{ tool.index }}</span>
        <span class="dashboard-tool-copy">
          <strong>{{ tool.name }}</strong>
          <span>{{ tool.description }}</span>
        </span>
        <span class="dashboard-tool-arrow" aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import './dashboard.css'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearCurrentRoom } from '../../js/roomNav.js'

const route = useRoute()
const router = useRouter()
const roomId = computed(() => route.query.roomId)
const roomName = computed(() => route.query.roomName)

const toolLink = (toolId) =>
  roomId.value
    ? { path: `/room/${roomId.value}`, query: { tool: toolId } }
    : { path: '/join', query: { tool: toolId } }

const createNewRoom = () => {
  clearCurrentRoom()
  router.push('/')
}

const tools = [
  {
    id: 'poker',
    index: '01',
    name: 'Planning Poker',
    description: 'Estimate work together and reveal the room consensus.',
  },
  {
    id: 'retro',
    index: '02',
    name: 'Retro Board',
    description: 'Collect reflections, group ideas, and choose next actions.',
  },
  {
    id: 'wheel',
    index: '03',
    name: 'Spin the Wheel',
    description: 'Add a little chance when the team needs a decision.',
  },
]
</script>
