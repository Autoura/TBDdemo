import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App);  // Store the result of createApp() in a variable

app.use(router).mount('#app');  // Mount the app afterward
