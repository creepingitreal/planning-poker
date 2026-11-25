import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import Icon from './assets/shared/Icon.vue'

const app = createApp(App)

app.component('Icon', Icon)

app.use(router).mount('#app')
