<template>
  <div class="profile-page">
    <div class="profile">
      <div class="profile-header">
        <div>
          <div class="avatar">TS</div>
          <div>
            <h2>{{ user?.nombre || "Usuario" }}</h2>
            <p class="muted">Miembro desde {{ memberSince }}</p>
          </div>
        </div>
        <button class="ghost" @click="$emit('close')">Cerrar</button>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-number">{{ ventasActivas }}</div>
          <div class="muted">Ventas activas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ reservasActivas }}</div>
          <div class="muted">Reservas activas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalCompras }}</div>
          <div class="muted">Total de compras</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ avgRating }}</div>
          <div class="muted">Valoracion general</div>
        </div>
      </div>
      <div class="card" style="margin-bottom:12px; display:flex; justify-content: space-between; align-items:center;">
        <div>
          <strong>Ubicacion actual</strong>
          <div class="muted">{{ displayUbicacion }}</div>
        </div>
        <button class="ghost" @click="$emit('change-location')">Cambiar ubicacion</button>
      </div>

      <div class="grid">
        <div class="card section">
          <div class="section-header">
            <h3>Informacion personal</h3>
            <button class="ghost" @click="toggleEdit">{{ editMode ? "Guardar" : "Editar" }}</button>
          </div>
          <div class="field">
            <label>Nombre</label>
            <input v-model="local.nombre" :disabled="!editMode" />
          </div>
          <div class="field">
            <label>Email</label>
            <input v-model="local.email" :disabled="!editMode" />
          </div>
          <div class="field">
            <label>Telefono</label>
            <input v-model="local.telefono" :disabled="!editMode" placeholder="+34 ..." />
          </div>
          <div class="field">
            <label>Ubicacion</label>
            <input v-model="local.ubicacion" :disabled="!editMode" placeholder="Ciudad, pais" />
          </div>
        </div>

        <div class="card section">
          <div class="section-header">
            <h3>Preferencias</h3>
          </div>
          <div class="field">
            <label>Radio de busqueda (km)</label>
            <input type="number" v-model.number="local.radioBusqueda" :disabled="!editMode" />
          </div>
          <div class="field">
            <label>Notas/Preferencias</label>
            <textarea v-model="local.preferencias" :disabled="!editMode" rows="3"></textarea>
          </div>
          <div class="field" v-if="props.user?.id">
            <button class="ghost" @click="$emit('configure-points')">Configurar puntos de entrega</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref } from "vue";

const props = defineProps({
  user: Object,
  reservations: { type: Array, default: () => [] },
  products: { type: Array, default: () => [] },
  sellerProducts: { type: Array, default: () => [] },
  profile: { type: Object, default: () => ({}) },
  ratings: { type: Array, default: () => [] }
});
const emit = defineEmits(["close", "update-profile", "change-location"]);
const editMode = ref(false);

const local = reactive({
  nombre: "",
  email: "",
  telefono: "",
  ubicacion: "",
  radioBusqueda: 10,
  preferencias: ""
});

watch(
  () => props.user,
  () => {
    local.nombre = props.user?.nombre || "";
    local.email = props.user?.email || "";
  },
  { immediate: true }
);

watch(
  () => props.profile,
  (val) => {
    local.telefono = val.telefono || "";
    local.ubicacion = val.ubicacion || "";
    local.radioBusqueda = val.radioBusqueda ?? 10;
    local.preferencias = val.preferencias || "";
  },
  { immediate: true }
);

const reservasActivas = computed(
  () =>
    props.reservations.filter(
      (r) =>
        (r.id_comprador === props.user?.id || r.id_vendedor === props.user?.id) &&
        (r.estado === "pendiente" || r.estado === "aceptada")
    ).length
);
const totalCompras = computed(() => props.reservations.filter((r) => r.id_comprador === props.user?.id).length);
const ventasActivas = computed(
  () => props.sellerProducts.filter((p) => Number(p.stock) > 0 && p.id_vendedor === props.user?.id).length
);
const memberSince = computed(() => {
  const date = props.user?.fecha_creacion ? new Date(props.user.fecha_creacion) : null;
  return date ? date.toLocaleDateString() : "Fecha no disponible";
});
const displayUbicacion = computed(() => local.ubicacion || "Sin ubicacion");
const avgRating = computed(() => {
  const vals = props.ratings || [];
  if (!vals.length) return "—";
  const total =
    vals.reduce(
      (acc, r) =>
        acc +
        Number(r.nota_producto || 0) +
        Number(r.nota_entrega || 0) +
        Number(r.nota_negociacion || 0),
      0
    ) /
    (3 * vals.length);
  return total.toFixed(1);
});

function toggleEdit() {
  if (!editMode.value) {
    editMode.value = true;
  } else {
    emit("update-profile", { ...local });
    editMode.value = false;
  }
}
</script>

<style scoped>
.profile-page { padding: 10px 0; }
.profile {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 60px -40px rgba(0, 0, 0, 0.2);
  padding: 20px;
}
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.profile-header > div {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9, #10b981);
  color: #fff;
  font-weight: 800;
  display: grid;
  place-items: center;
  font-size: 22px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin: 16px 0;
}
.stat-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
}
.stat-number {
  font-size: 20px;
  font-weight: 700;
}
.grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px;
}
.section { padding: 14px; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}
input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.muted { color: #6b7280; }

@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
