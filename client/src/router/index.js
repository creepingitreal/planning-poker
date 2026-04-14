// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import JoinRoom from '../components/JoinRoom.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: JoinRoom },
        { path: '/room/:roomId', component: JoinRoom },
    ],
});

export default router;