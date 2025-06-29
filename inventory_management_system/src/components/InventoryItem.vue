<template>
  <div class="inventory-item-card">
    <h2>{{ name }}</h2>
    <img :src="image_url" :alt="name">
    <div class="quantity-control">
      <button @click="decrementQuantity">-</button>
      <input
        type="number"
        v-model.number="localQuantity"
        class="quantity-input"
        readonly/>
      <button @click="incrementQuantity">+</button>
    </div>
    <p>Last Updated: {{ formattedTimestamp }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  name: String,
  image_url: String,
  localQuantity: Number,
  lastUpdated: Number,
  id: String,
});

const localQuantity = ref(props.localQuantity);

const emit = defineEmits(['update-request']);

watch(() => props.localQuantity, (newVal) => {
  localQuantity.value = newVal;
});

function incrementQuantity() {
  localQuantity.value++;
  emitUpdateRequest(1);
}

function decrementQuantity() {
  if (localQuantity.value > 0) {
    localQuantity.value--;
    emitUpdateRequest(-1);
  }
}

function emitUpdateRequest(change) {
  emit('update-request', {
    id: props.id,
    name: props.name,
    quantity: localQuantity.value,
    lastUpdated: props.lastUpdated,
    change: change,
  });
}
const formattedTimestamp = computed(() => {
  return new Date(props.lastUpdated).toLocaleString('hu-HU');
});

</script>

<style scoped>
img {
  height: 90px;
}

.inventory-item-card {
  border: 1px solid;
  padding: 20px;
  border-radius: 8px;
  border-color:  rgb(0, 189, 126);
  background-color: #272626;
  color: #fff;
  text-align: center;
}

.item-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border-color:  rgb(0, 189, 126);
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px; 
}

.quantity-input {
  width: 40px;
  text-align: center;
  background-color: #2c2c2c;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  
}

button {
  width: 25px;
  height: 25px;
  background-color: #4a4a4a;
  color: rgb(0, 189, 126);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
   box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

</style>