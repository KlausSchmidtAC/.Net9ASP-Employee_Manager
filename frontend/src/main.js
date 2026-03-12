// Vue 3 + Pinia Setup für Clean Architecture
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import EmployeeApp from './EmployeeApp.vue' 

// Create Vue App Instance
const app = createApp(EmployeeApp)

// Register Pinia Store System
const pinia = createPinia()
app.use(pinia)

// Mount App to DOM
app.mount('#app')

