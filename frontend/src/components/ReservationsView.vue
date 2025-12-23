<template>
  <div>
    <div class="flex" style="justify-content: space-between; margin-bottom: 8px;">
      <div>
        <h3 v-if="mode === 'reservas'">Reservas</h3>
        <h3 v-else>Mensajes</h3>
      </div>
      <button class="ghost" @click="$emit('refresh')">Recargar</button>
    </div>

    <div v-if="mode === 'reservas'" class="tabs">
      <button :class="{ active: tab === 'pendientes' }" @click="$emit('change-tab', 'pendientes')">
        Pendientes
      </button>
      <button :class="{ active: tab === 'encurso' }" @click="$emit('change-tab', 'encurso')">
        En curso
      </button>
      <button :class="{ active: tab === 'finalizadas' }" @click="$emit('change-tab', 'finalizadas')">
        Finalizadas
      </button>
    </div>

    <p v-if="!filtered.length" class="muted">
      {{ mode === "reservas" ? "Sin reservas." : "Sin chats aún." }}
    </p>

    <div
      v-for="r in filtered"
      :key="r.id"
      class="card"
      :class="mode === 'mensajes' ? 'chat-card' : ''"
    >
      <div class="flex" style="justify-content: space-between; align-items: center;">
        <div>
          <strong>{{ r.producto_nombre }}</strong>
          <div class="muted" v-if="mode === 'reservas'">
            Cantidad: {{ r.cantidad }} · Estado: {{ r.estado }}
          </div>
          <div class="muted" v-else>
            Chat con {{ chatParticipant(r) }}
          </div>
        </div>
        <div class="flex" style="gap:6px;">
          <div class="flex" v-if="mode === 'reservas'">
            <button type="button" class="ghost" :disabled="isLoading(r)" v-if="showAccept(r)" @click.stop="changeStatus(r, 'aceptada')">Aceptar</button>
            <button type="button" class="ghost" :disabled="isLoading(r)" v-if="showReject(r)" @click.stop="changeStatus(r, 'rechazada')">Rechazar</button>
            <button type="button" class="ghost" :disabled="isLoading(r)" v-if="showComplete(r)" @click.stop="changeStatus(r, 'completada')">Recogida</button>
            <button type="button" class="ghost" :disabled="isLoading(r)" v-if="canCancel(r)" @click.stop="$emit('cancel', r)">Cancelar</button>
            <button type="button" class="ghost" v-if="r.estado === 'completada'" @click.stop="$emit('rate', r)">Valorar</button>
          </div>
          <button type="button" class="primary" @click="$emit('chat', r)">Abrir chat</button>
        </div>
      </div>
      <div class="muted">
        <span v-if="mode === 'reservas'">Punto: {{ r.punto_descripcion || r.id_punto_entrega }}</span>
        <span v-else>Reserva #{{ r.id }} · Estado: {{ r.estado }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import store from "../store";
import { updateReservationStatus } from "../api";

const props = defineProps({
  reservations: { type: Array, default: () => [] },
  showStatusActions: { type: Boolean, default: false },
  mode: { type: String, default: "reservas" },
  tab: { type: String, default: "pendientes" }
});

const emit = defineEmits(["refresh", "status-changed", "chat", "change-tab", "cancel", "rate"]);

const loadingId = ref(null);

const filtered = computed(() => {
  if (props.mode !== "reservas") return props.reservations;
  const pendingStates = ["pendiente"];
  const inCourseStates = ["aceptada"];
  const finalStates = ["completada", "rechazada", "cancelada"];
  let target = pendingStates;
  if (props.tab === "encurso") target = inCourseStates;
  if (props.tab === "finalizadas") target = finalStates;
  return props.reservations.filter((r) => target.includes(r.estado));
});

async function changeStatus(reservation, status) {
  try {
    loadingId.value = reservation.id;
    await updateReservationStatus(reservation.id, status);
    emit("status-changed");
  } catch (err) {
    console.error("changeStatus error", err);
    alert(err.message || "No se pudo actualizar la reserva");
  } finally {
    loadingId.value = null;
  }
}

function isLoading(reservation) {
  return loadingId.value === reservation.id;
}

function chatParticipant(reservation) {
  if (!store.state.user) return "participante";
  return store.state.user.id === reservation.id_comprador ? "vendedor" : "comprador";
}

function canCancel(reservation) {
  if (!store.state.user) return false;
  const allowStates = ["pendiente", "aceptada"];
  return allowStates.includes(reservation.estado) && store.state.user.id === reservation.id_comprador;
}

function isSellerFor(reservation) {
  return store.state.user && store.state.user.id === reservation.id_vendedor;
}

function showAccept(reservation) {
  return isSellerFor(reservation) && reservation.estado === "pendiente";
}

function showReject(reservation) {
  return isSellerFor(reservation) && reservation.estado === "pendiente";
}

function showComplete(reservation) {
  return isSellerFor(reservation) && reservation.estado === "aceptada";
}
</script>

<style scoped>
.muted { color: #6b7280; }
.chat-card { border-left: 4px solid #c7d2fe; background: #f8fafc; }
.tabs { display: flex; gap: 8px; margin-bottom: 10px; }
.tabs button { border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; padding: 6px 10px; cursor: pointer; }
.tabs button.active { background: #eef2ff; border-color: #c7d2fe; }
</style>
