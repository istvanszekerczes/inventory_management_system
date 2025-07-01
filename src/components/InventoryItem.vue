<template>
  <div class="inventory-item-card">
    <h2>{{ name }}</h2>
    <img :src="image_url" :alt="name">
    <div class="quantity-control">
      <button class="quantity-button" @click="decrementQuantity">-</button>
      <input
        type="number"
        v-model.number="localQuantity"
        class="quantity-input"
        readonly/>
      <button class="quantity-button" @click="incrementQuantity">+</button>
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

// Növeli az adott item lokális mennyiség értékét, majd kéri a szerver frissítését.
function incrementQuantity() {
  localQuantity.value++;
  emitUpdateRequest(1);
}

// Csökkenti az adott item lokális mennyiség értékét, majd kéri a szerver frissítését.
function decrementQuantity() {
  if (localQuantity.value > 0) {
    localQuantity.value--;
    emitUpdateRequest(-1);
  }
}

// Kibocsát egy 'update-request' eseményt a szülő komponens felé a mennyiség változásának jelzésére.
function emitUpdateRequest(change) {
  emit('update-request', {
    id: props.id,
    name: props.name,
    quantity: localQuantity.value,
    lastUpdated: props.lastUpdated,
    change: change,
  });
}

// Olvashastóvá alakítja a Timestamp-et.
const formattedTimestamp = computed(() => {
  return new Date(props.lastUpdated).toLocaleString('hu-HU');
});

</script>

<style scoped>
</style>