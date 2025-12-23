<template>
  <div class="card product-card">
    <div class="product-head">
      <h4>{{ product.nombre }}</h4>
      <div class="price">{{ product.precio }} €</div>
    </div>
    <p class="muted">{{ product.descripcion }}</p>
    <div class="product-meta">
      <span v-if="product.categoria_nombre">{{ product.categoria_nombre }}</span>
      <span>Stock: {{ product.stock }} {{ product.tipo || "" }}</span>
      <span v-if="product.distanceKm !== null">A {{ product.distanceKm.toFixed(1) }} km</span>
    </div>
    <div class="stock-bar">
      <div class="stock-fill" :style="{ width: stockPercent + '%' }"></div>
    </div>
    <small class="muted">Restante: {{ product.stock }} {{ product.tipo || "" }}</small>

    <div v-if="showReservation" class="reserve-box">
      <div class="input-group">
        <label>Cantidad</label>
        <input type="number" min="0.1" step="0.1" v-model.number="quantity" />
      </div>
      <div class="input-group">
        <label>Punto de entrega</label>
        <select v-model.number="pointId">
          <option v-for="p in product.puntos_entrega" :key="p.id" :value="p.id">
            {{ p.descripcion || (p.lat + ',' + p.lng) }}
          </option>
        </select>
      </div>
      <button class="primary" style="margin-top:8px;" @click="reserve">Reservar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  product: { type: Object, required: true },
  showReservation: { type: Boolean, default: false }
});
const emit = defineEmits(["reserve"]);

const quantity = ref(1);
const pointId = ref(props.product.puntos_entrega?.[0]?.id || null);
const stockPercent = computed(() => {
  const stock = Number(props.product.stock) || 0;
  const max = stock + Number(quantity.value || 0);
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (stock / max) * 100));
});

watch(
  () => props.product,
  () => {
    pointId.value = props.product.puntos_entrega?.[0]?.id || null;
  }
);

function reserve() {
  emit("reserve", { product: props.product, quantity: quantity.value, pointId: pointId.value });
}
</script>

<style scoped>
.muted {
  color: #6b7280;
}

.product-card { display: flex; flex-direction: column; gap: 6px; }
.product-head { display: flex; justify-content: space-between; align-items: center; }
.price { background: #eef2ff; padding: 6px 10px; border-radius: 10px; font-weight: 600; }
.product-meta { display: flex; gap: 8px; flex-wrap: wrap; color: #4b5563; font-size: 13px; }
.stock-bar { height: 6px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
.stock-fill { height: 100%; background: #22c55e; }
.reserve-box { margin-top: 8px; padding: 12px; background: #f9fafb; border: 1px dashed #e5e7eb; border-radius: 10px; }
.input-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }

input,
select {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
</style>
