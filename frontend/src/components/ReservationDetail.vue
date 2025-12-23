<template>
  <div class="card">
    <div class="flex" style="justify-content: space-between; align-items: center;">
      <div>
        <h4>Reserva #{{ reservation.id }}</h4>
        <div class="muted">{{ reservation.producto_nombre }} · Estado: {{ reservation.estado }}</div>
      </div>
      <button class="ghost" @click="$emit('refresh-messages', reservation.id)">Refrescar chat</button>
    </div>
    <p class="muted">Punto: {{ reservation.punto_descripcion || reservation.id_punto_entrega }}</p>
    <ChatThread :reservation="reservation" :messages="messages" @sent="$emit('refresh-messages', reservation.id)" />
  </div>
</template>

<script setup>
import ChatThread from "./ChatThread.vue";

defineProps({
  reservation: { type: Object, required: true },
  messages: { type: Array, default: () => [] }
});

defineEmits(["refresh-messages"]);
</script>

<style scoped>
.muted {
  color: #6b7280;
}
</style>
