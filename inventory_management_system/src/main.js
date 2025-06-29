import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import InventoryItem from './components/InventoryItem.vue'

const app = createApp(App).mount('#app')
app.component('inventory-item', InventoryItem)
