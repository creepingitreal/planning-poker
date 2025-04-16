import {createRouter, createWebHistory} from "vue-router";
import CreateRoom from "../components/create-room.vue";
import JoinRoom from "../components/join-room.vue";

const routes = [
    { path: '/', component: CreateRoom },
    { path: '/join', component: JoinRoom }

];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;