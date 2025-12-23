<template>
  <div>
    <div class="chat">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message"
        :class="msg.author_id === store.state.user?.id ? 'self' : 'other'"
      >
        <div class="muted">{{ new Date(msg.fecha_creacion).toLocaleString() }}</div>
        <div>{{ msg.mensaje }}</div>
      </div>
    </div>
    <form class="flex" style="margin-top: 8px;" @submit.prevent="send">
      <input v-model="text" placeholder="Escribe un mensaje" />
      <button class="primary" type="submit">Enviar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { sendMessage } from "../api";
import store from "../store";

const props = defineProps({
  reservation: { type: Object, required: true },
  messages: { type: Array, default: () => [] }
});

const emit = defineEmits(["sent"]);
const text = ref("");

async function send() {
  if (!text.value.trim()) return;
  await sendMessage(props.reservation.id, text.value.trim());
  text.value = "";
  emit("sent");
}
</script>

<style scoped>
.muted {
  color: #6b7280;
  font-size: 12px;
}

input {
  flex: 1;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
</style>
