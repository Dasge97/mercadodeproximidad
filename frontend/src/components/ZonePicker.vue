<template>
  <div class="card">
    <div class="flex" style="justify-content: space-between; margin-bottom: 8px;">
      <div>
        <strong>Selecciona zona</strong>
        <p class="muted">Haz click en el mapa para elegir punto y filtrar.</p>
      </div>
      <button class="ghost" @click="confirm" :disabled="!hasSelection">Confirmar</button>
    </div>
    <div ref="mapEl" style="height: 260px; border-radius: 10px; overflow: hidden;"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick, computed } from "vue";

const emit = defineEmits(["zone-selected"]);
const mapEl = ref(null);
let mapInstance = null;
let marker = null;
const selected = ref({ lat: null, lng: null });
const hasSelection = computed(() => selected.value?.lat !== null && selected.value?.lng !== null);

function confirm() {
  if (hasSelection.value) emit("zone-selected", selected.value);
}

onMounted(async () => {
  await nextTick();
  if (!mapEl.value) return;
  mapInstance = window.L.map(mapEl.value).setView([39.0749, -0.2697], 12);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(mapInstance);

  mapInstance.on("click", (e) => {
    selected.value = { lat: e.latlng.lat, lng: e.latlng.lng };
    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = window.L.marker(e.latlng).addTo(mapInstance);
    }
  });
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.off();
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style scoped>
.muted {
  color: #6b7280;
}
</style>
