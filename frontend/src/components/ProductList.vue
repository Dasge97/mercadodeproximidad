<template>
  <div>
    <div class="flex" style="justify-content: space-between; margin-bottom: 8px;">
      <h3>Productos</h3>
      <button class="ghost" @click="$emit('refresh')">Recargar</button>
    </div>
    <p v-if="!products.length" class="muted">Selecciona zona y recarga para ver productos cercanos.</p>
    <div class="product-grid">
      <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
        :showReservation="store.state.user?.tipo === 'comprador' && p.puntos_entrega?.length"
        @reserve="reserve"
      />
    </div>
  </div>
</template>

<script setup>
import ProductCard from "./ProductCard.vue";
import store from "../store";
import { createReservation } from "../api";

defineProps({
  products: { type: Array, default: () => [] }
});
const emit = defineEmits(["refresh"]);

async function reserve({ product, quantity, pointId }) {
  if (!store.state.user) {
    alert("Inicia sesión como comprador para reservar.");
    return;
  }
  if (!pointId) {
    alert("Selecciona un punto de entrega.");
    return;
  }
  await createReservation({ productId: product.id, quantity, pointId });
  alert("Reserva creada.");
  emit("refresh");
}
</script>

<style scoped>
.muted {
  color: #6b7280;
}
</style>
