<template>
    <div class="main-container">
        <h1>Inventory Management System</h1>
        <div class="blurred-overlay" v-if="showAlert">
          <div class="alert">
          <h2>Conflict!</h2>
          <h3>{{ itemName }}</h3>
          <p>This item's quantity has already been updated on the server. 
          <br>Would you like to merge the quantities from both sides?</p>
          <button class="alertButton" @click="mergeQuantities">Merge</button>
          <button class="alertButton" @click="dismiss">Dismiss</button>
          </div>
        </div>
        
        <div id="wrapper">
            <div class="item-inventory-item-div" v-for="item in data" :key="item.id">
                <inventory-item
                    :name = 'item.name'
                    :image_url = 'item.image_url'
                    :localQuantity = 'item.quantity'
                    :lastUpdated = 'item.lastUpdated'
                    @update-request="sendUpdateToServer"
                    :id = 'item.id'>
                  </inventory-item>                 
            </div>
        </div>
    </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import InventoryItem from './components/InventoryItem.vue';

const data = ref([]);
const showAlert = ref(false);
const itemName = ref('');
const conflictedItem = ref(null);
const pendingChange = ref(0)

onMounted(async () => {
  try {
    
    const response = await fetch('http://localhost:3000/api/inventory');
    showAlert.value = false;

    const inventoryData = await response.json();

    data.value = inventoryData;
  } catch (error) {
    console.error("Could not fetch inventory:", error);
  }
});

async function sendUpdateToServer(updatedItem) {
  try {
    const response = await fetch('http://localhost:3000/api/inventory/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedItem),
    });
    
    if (response.status === 409) {
      console.log("Conflict detected!");
      const serverResponse = await response.json();
      showAlert.value = true;
      itemName.value = updatedItem.name;
      conflictedItem.value = serverResponse;
      pendingChange.value = updatedItem.change;
      
      
      const index = data.value.findIndex(item => item.id === serverResponse.id);
      if (index !== -1) {
          data.value[index] = serverResponse;
      }
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    showAlert.value = false;
    
    const serverResponse = await response.json();
    console.log("Update successful:", serverResponse);

    const index = data.value.findIndex(item => item.id === serverResponse.id);
    if (index !== -1) {
        data.value[index] = serverResponse;
    }

  } catch (error) {
    console.error("Could not update item on server:", error);
  }
}

function dismiss() {
  showAlert.value = false;
  itemName.value = '';
  conflictedItem.value = null;
  pendingChange.value = 0;

}

async function mergeQuantities() {
  showAlert.value = false;

  const newQuantity = conflictedItem.value.quantity + pendingChange.value;
  const mergedItem = {
    id: conflictedItem.value.id,
    name: conflictedItem.value.name,
    quantity: newQuantity,
    lastUpdated: Date.now(),
  };

  try {
    const response = await fetch('http://localhost:3000/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mergedItem),
    });


    const serverResponse = await response.json();
    console.log("Merge successful:", serverResponse);
    dismiss();


    const index = data.value.findIndex(item => item.id === serverResponse.id);
    if (index !== -1) {
      data.value[index] = serverResponse;
    }

  } catch (error){
    console.error("Could not merge quantities:", error);
    dismiss();
  }

}

</script>

<style scoped>

</style>