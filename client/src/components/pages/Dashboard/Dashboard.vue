<template>
  <section class="dashboard">
    <div class="dashboard-content">
      <p>Start a session with the tool your team needs right now.</p>
      <button
        type="button"
        class="link dashboard-new-room"
        @click="createNewRoom"
      >
        + Start a new session
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
import { useRouter } from 'vue-router'
import { clearCurrentRoom, currentRoom } from '../../../js/roomNav.js'

const router = useRouter()
const roomId = computed(() => currentRoom.value.roomId)

const toolLink = (toolId) => ({
  path: `/room/${roomId.value}`,
  query: { tool: toolId },
})

const createNewRoom = async () => {
  await router.push('/')
  clearCurrentRoom()
}

const tools = [
  {
    id: 'poker',
    index: '01',
    name: 'Planning Poker',
    description: 'Estimate work together and reveal the session consensus.',
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
