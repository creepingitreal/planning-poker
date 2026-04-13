import { createRouter, createWebHistory } from 'vue-router';
import JoinRoom from '../components/JoinRoom.vue';

const routes = [
    { path: '/',                component: JoinRoom },
    { path: '/room/:roomId',    component: JoinRoom },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;