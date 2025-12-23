<template>
  <div class="card rating-card" v-if="allow">
    <div class="rating-header">
      <h4>Valorar reserva #{{ reservation.id }}</h4>
      <span class="muted">Producto: {{ reservation.producto_nombre || reservation.id_producto }}</span>
    </div>
    <form @submit.prevent="submit">
      <div class="rating-grid">
        <label class="field">
          <span>Calidad del producto</span>
          <input type="range" min="1" max="5" v-model.number="nota_producto" />
          <small>{{ nota_producto }}/5</small>
        </label>
        <label class="field">
          <span>Entrega</span>
          <input type="range" min="1" max="5" v-model.number="nota_entrega" />
          <small>{{ nota_entrega }}/5</small>
        </label>
        <label class="field">
          <span>Negociación</span>
          <input type="range" min="1" max="5" v-model.number="nota_negociacion" />
          <small>{{ nota_negociacion }}/5</small>
        </label>
      </div>
      <label class="field">
        <span>Comentario</span>
        <textarea v-model="comentario" placeholder="Añade detalles (opcional)" rows="3"></textarea>
      </label>
      <div class="actions">
        <button class="primary" type="submit" :disabled="loading">Enviar valoración</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { createRating } from "../api";

const props = defineProps({
  reservation: { type: Object, required: true }
});
const emit = defineEmits(["rated"]);

const nota_producto = ref(5);
const nota_entrega = ref(5);
const nota_negociacion = ref(5);
const comentario = ref("");
const loading = ref(false);

const allow = computed(() => props.reservation && props.reservation.estado === "completada");

async function submit() {
  try {
    loading.value = true;
    await createRating(props.reservation.id, {
      nota_producto: nota_producto.value,
      nota_entrega: nota_entrega.value,
      nota_negociacion: nota_negociacion.value,
      comentario: comentario.value
    });
    emit("rated");
  } catch (err) {
    alert(err.message || "No se pudo enviar la valoración");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.muted { color: #6b7280; }
.rating-card { display: flex; flex-direction: column; gap: 12px; }
.rating-header { display: flex; flex-direction: column; gap: 4px; }
.rating-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
.field { display: flex; flex-direction: column; gap: 6px; background: #f9fafb; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; }
input[type="range"] { width: 100%; }
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
}
.actions { display: flex; justify-content: flex-end; }
button[disabled] { opacity: 0.6; cursor: not-allowed; }
</style>
