// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard/Dashboard.vue'
import JoinRoom from '../components/Join/JoinRoom.vue'
import Room from '../components/Poker/Room.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/dashboard', component: Dashboard },
    { path: '/join/:roomId?', component: Dashboard },
    { path: '/room/:roomId', component: Room },
  ],
})

export default router
