<template>
  <div class="overlay">
    <div class="modal card">
      <div class="flex" style="justify-content: space-between; align-items:center; margin-bottom:8px;">
        <h3>Puntos de entrega (max 5)</h3>
        <button class="ghost" @click="$emit('close')">Cerrar</button>
      </div>
      <p class="muted">Haz clic en el mapa para añadir un punto. Puedes eliminar de la lista.</p>
      <div ref="mapEl" class="map"></div>
      <ul class="point-list">
        <li v-for="(pt, idx) in points" :key="idx">
          <span>{{ pt.label || (pt.lat.toFixed(4) + ", " + pt.lng.toFixed(4)) }}</span>
          <button class="ghost" @click="removePoint(idx)">Eliminar</button>
        </li>
      </ul>
      <div class="flex" style="justify-content:flex-end; gap:8px;">
        <button class="ghost" @click="$emit('close')">Cancelar</button>
        <button class="primary" :disabled="saving || !points.length" @click="save">Guardar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import { fetchDeliveryPoints, saveDeliveryPoints } from "../api";

const emit = defineEmits(["close", "saved"]);
const mapEl = ref(null);
let mapInstance = null;
let markers = [];
const points = ref([]);
const saving = ref(false);

function clearMarkers() {
  markers.forEach((m) => m.remove());
  markers = [];
}

function refreshMarkers() {
  if (!mapInstance) return;
  clearMarkers();
  points.value.forEach((pt) => {
    const marker = window.L.marker([pt.lat, pt.lng]).addTo(mapInstance);
    markers.push(marker);
  });
  if (markers.length) {
    const group = window.L.featureGroup(markers);
    mapInstance.fitBounds(group.getBounds().pad(0.2));
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "User-Agent": "terretashop-demo" } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const base = [addr.road, addr.house_number, addr.city || addr.town || addr.village].filter(Boolean).join(", ");
    const label = base || data.display_name || null;
    return label;
  } catch (_err) {
    return null;
  }
}

async function loadPoints() {
  const existing = await fetchDeliveryPoints();
  points.value = existing.map((p) => ({
    lat: Number(p.lat),
    lng: Number(p.lng),
    label: p.descripcion || null
  }));
  refreshMarkers();
}

onMounted(async () => {
  await nextTick();
  if (!mapEl.value) return;
  mapInstance = window.L.map(mapEl.value).setView([39.0749, -0.2697], 12);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(mapInstance);

  mapInstance.on("click", async (e) => {
    if (points.value.length >= 5) return;
    const label = await reverseGeocode(e.latlng.lat, e.latlng.lng);
    points.value.push({ lat: e.latlng.lat, lng: e.latlng.lng, label });
    refreshMarkers();
  });

  await loadPoints();
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.off();
    mapInstance.remove();
    mapInstance = null;
  }
});

function removePoint(idx) {
  points.value.splice(idx, 1);
  refreshMarkers();
}

async function save() {
  saving.value = true;
  try {
    const payload = points.value.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      descripcion: p.label || null
    }));
    await saveDeliveryPoints(payload);
    emit("saved", points.value);
    emit("close");
  } catch (err) {
    alert(err.message || "No se pudieron guardar los puntos");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal {
  width: 80vw;
  max-width: 1100px;
  z-index: 2001;
}
.map {
  height: 360px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}
.point-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.point-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  border-radius: 8px;
}
.muted { color: #6b7280; }
</style>
