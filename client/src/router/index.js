// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../components/Dashboard/Dashboard.vue";
import JoinRoom from "../components/Poker/JoinRoom.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/dashboard" },
    { path: "/dashboard", component: Dashboard },
    { path: "/join", component: JoinRoom },
    { path: "/room/:roomId", component: JoinRoom },
  ],
});

export default router;
