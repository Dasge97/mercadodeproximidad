<template>
  <div class="card filters">
    <h3>Filtros</h3>
    <div class="section">
      <label class="section-title">Categorías</label>
      <div class="pill" :class="{ active: local.categoryId === null }" @click="setCategory(null)">Todas</div>
      <div
        class="pill"
        v-for="cat in categories"
        :key="cat.id"
        :class="{ active: local.categoryId === cat.id }"
        @click="setCategory(cat.id)"
      >
        {{ cat.nombre }}
      </div>
    </div>
    <div class="section">
      <label class="section-title">Búsqueda</label>
      <input v-model="local.q" placeholder="Nombre o descripción" />
    </div>
    <div class="actions">
      <button class="primary" @click="apply">Aplicar</button>
      <button class="ghost" @click="reset">Limpiar</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({ q: "", categoryId: null }) }
});

const emit = defineEmits(["update:filters"]);
const local = reactive({ q: "", categoryId: null });

watch(
  () => props.modelValue,
  (val) => {
    local.q = val.q || "";
    local.categoryId = val.categoryId ?? null;
  },
  { immediate: true, deep: true }
);

function apply() {
  emit("update:filters", { q: local.q, categoryId: local.categoryId });
}

function reset() {
  local.q = "";
  local.categoryId = null;
  apply();
}

function setCategory(id) {
  local.categoryId = id;
  apply();
}
</script>

<style scoped>
.filters { width: 100%; }
.section { margin-bottom: 12px; }
.section-title { font-weight: 600; color: #111827; display: block; margin-bottom: 6px; }
.pill {
  display: inline-block;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  margin: 4px 6px 0 0;
  cursor: pointer;
  background: #f9fafb;
}
.pill.active { background: #e0f2fe; border-color: #93c5fd; }
.actions { display: flex; gap: 8px; }
input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
</style>
