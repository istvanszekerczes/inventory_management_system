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
const refreshInterval = 10000;
const apiPath = "http://localhost:3000";

// Amikor a komponens mounted lifecycle hook-ra kerül, lekéri az aktuális adatokat a szerverről.
onMounted(async () => {
  try {
    const response = await fetch(apiPath + '/api/inventory');
    showAlert.value = false;

    const inventoryData = await response.json();

    data.value = inventoryData;
  } catch (error) {
  }
});


// A kliens 10 másodpercenként elküld egy GET kérést a szerver felé, és frissíti az adatokat az alkalmazásba.
setInterval(async () => {
  try {
    const response = await fetch(apiPath + '/api/inventory');
    const inventoryData = await response.json();

    data.value = inventoryData;
  } catch (error) {

  }
}, refreshInterval);

// Megkapja a gyermekkomponenstől a változtatást, és elküldi a szervernek a frissítési kérést.
// Ha a szerver ütközést észlelt megjeleníti a figyelmeztetést.
async function sendUpdateToServer(updatedItem) {
  try {
    const response = await fetch(apiPath + '/api/inventory/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedItem),
    });
    
    if (response.status === 409) {
      const serverResponse = await response.json();
      showAlert.value = true;
      itemName.value = updatedItem.name;
      conflictedItem.value = serverResponse;
      pendingChange.value = updatedItem.change;
      
      // Frissíti az ütközött item lokális mennyiségét a szerver állapotával.
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

    const index = data.value.findIndex(item => item.id === serverResponse.id);
    if (index !== -1) {
        data.value[index] = serverResponse;
    }

  } catch (error) {
  }
}

// Bezárja a figyelmeztetést, így a felhasználó változtatását törli, és megjeleníti
// a szerver aktuális állapotát.
function dismiss() {
  showAlert.value = false;
  itemName.value = '';
  conflictedItem.value = null;
  pendingChange.value = 0;

}

// Az ütközött item mennyiségét kiszámolja úgy, hogy összeadja a szervereren lévő változat mennyiségét
//  a user változtatásával (-1 vagy +1). Ezt követően elküldi a szervernek a változtatást.
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
    const response = await fetch(apiPath + '/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mergedItem),
    });


    const serverResponse = await response.json();
    dismiss();


    const index = data.value.findIndex(item => item.id === serverResponse.id);
    if (index !== -1) {
      data.value[index] = serverResponse;
    }

  } catch (error){
    dismiss();
  }

}

</script>

<style scoped>

</style>