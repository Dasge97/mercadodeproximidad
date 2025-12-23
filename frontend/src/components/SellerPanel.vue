<template>
  <div>
    <h3>Mis productos</h3>
    <div class="card">
      <h4>Publicar oferta</h4>
      <p class="muted">Completa los datos del producto que quieres vender.</p>
      <form class="seller-form" @submit.prevent="create">
        <div class="field">
          <label>Nombre del producto</label>
          <input v-model="form.nombre" placeholder="Ej: Tomate valenciano" required />
        </div>
        <div class="double">
          <div class="field">
            <label>Precio (€)</label>
            <input type="number" v-model.number="form.precio" placeholder="0.00" required step="0.01" />
          </div>
          <div class="field">
            <label>Stock disponible</label>
            <input type="number" v-model.number="form.stock" placeholder="0" required step="0.1" />
          </div>
        </div>
        <div class="double">
          <div class="field">
            <label>Tipo de unidad</label>
            <input v-model="form.tipo" placeholder="kg, L, unidad..." />
          </div>
          <div class="field">
            <label>Duración del producto (días)</label>
            <input type="number" v-model.number="form.duracion_producto" placeholder="Opcional" />
          </div>
        </div>
        <div class="field">
          <label>Categoría</label>
          <select v-model.number="form.id_categoria">
            <option :value="null">Seleccione categoría</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.nombre }}
            </option>
          </select>
        </div>
      <div class="field">
        <label>Descripción</label>
        <textarea v-model="form.descripcion" placeholder="Detalles del producto" rows="3"></textarea>
      </div>
      <div class="field">
        <label>Imágenes</label>
        <input type="file" accept="image/*" multiple @change="onFilesSelected" />
        <small class="muted">Se enviará la primera imagen seleccionada. Máximo tamaño depende del backend.</small>
        <div class="preview-row" v-if="previews.length">
          <div v-for="p in previews" :key="p.url" class="preview">
            <img :src="p.url" :alt="p.name" />
            <div class="muted" style="font-size:12px;">{{ p.name }}</div>
          </div>
        </div>
      </div>
      <button class="primary" type="submit">Publicar</button>
    </form>
  </div>

    <div v-if="myProducts.length">
      <div v-for="p in myProducts" :key="p.id" class="card">
        <div class="flex" style="justify-content: space-between;">
          <div>
            <strong>{{ p.nombre }}</strong>
            <div class="muted">{{ p.precio }} € · Stock {{ p.stock }}</div>
          </div>
          <div class="flex">
            <button class="ghost" @click="editProduct(p)">Editar</button>
            <button class="ghost" @click="remove(p)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="muted">No tienes productos aún.</p>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { createProduct, updateProduct, deleteProduct, fetchProducts, fetchCategories } from "../api";
import store from "../store";

const form = reactive({
  nombre: "",
  precio: 0,
  stock: 0,
  tipo: "",
  descripcion: "",
  id_categoria: null,
  duracion_producto: null,
  imagen: ""
});

const myProducts = ref([]);
const categories = ref([]);
const previews = ref([]);
const selectedFiles = ref([]);

async function load() {
  if (!store.state.user) return;
  myProducts.value = await fetchProducts({ sellerId: store.state.user.id });
}

async function loadCategories() {
  categories.value = await fetchCategories();
}

async function create() {
  let imageData = form.imagen || null;
  if (selectedFiles.value.length) {
    imageData = await fileToBase64(selectedFiles.value[0]);
  }
  await createProduct({ ...form, imagen: imageData });
  Object.assign(form, { nombre: "", precio: 0, stock: 0, tipo: "", descripcion: "", id_categoria: null, duracion_producto: null, imagen: "" });
  clearPreviews();
  await load();
}

async function editProduct(p) {
  const nombre = prompt("Nombre", p.nombre);
  if (!nombre) return;
  const precio = Number(prompt("Precio", p.precio));
  const stock = Number(prompt("Stock", p.stock));
  await updateProduct(p.id, { nombre, precio, stock });
  await load();
}

async function remove(p) {
  if (!confirm("Eliminar producto?")) return;
  await deleteProduct(p.id);
  await load();
}

onMounted(load);
onMounted(loadCategories);
onBeforeUnmount(clearPreviews);

function onFilesSelected(event) {
  clearPreviews();
  const files = Array.from(event.target.files || []);
  selectedFiles.value = files;
  previews.value = files.map((file) => ({
    name: file.name,
    url: URL.createObjectURL(file)
  }));
}

function clearPreviews() {
  previews.value.forEach((p) => URL.revokeObjectURL(p.url));
  previews.value = [];
  selectedFiles.value = [];
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
</script>

<style scoped>
.muted {
  color: #6b7280;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

textarea {
  resize: vertical;
}

.seller-form { display: flex; flex-direction: column; gap: 12px; }
.double { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.preview-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}
</style>
