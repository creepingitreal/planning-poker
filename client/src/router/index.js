// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard/Dashboard.vue'
import JoinRoom from '../components/Join/JoinRoom.vue'
import Room from '../components/Poker/Room.vue'
import Layout from '../layout/Layout.vue'
import { currentRoom } from '../js/roomNav.js'

// "/" is always the join / start-a-session screen (invite details travel in
// history state rather than the URL); "/dashboard" is only reachable once the
// user is in a session.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', component: JoinRoom },
        {
          path: 'dashboard',
          component: Dashboard,
          beforeEnter: () => (currentRoom.value.roomId ? true : '/'),
        },
        { path: 'room/:roomId', component: Room },
        { path: ':pathMatch(.*)*', redirect: '/' },
      ],
    },
  ],
})

export default router
