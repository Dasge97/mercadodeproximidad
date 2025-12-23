<template>
  <div class="overlay">
    <div class="modal card">
      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Login</button>
        <button :class="{ active: mode === 'register' }" @click="mode = 'register'">Registro</button>
      </div>
      <h3 v-if="mode === 'login'">Iniciar sesión</h3>
      <h3 v-else>Crear cuenta</h3>
      <form @submit.prevent="submit">
        <template v-if="mode === 'register'">
          <label>Nombre</label>
          <input v-model="form.nombre" required />
          <label>Usuario</label>
          <input v-model="form.nickname" required />
          <label>Email</label>
          <input type="email" v-model="form.email" required />
        </template>
        <template v-else>
          <label>Email o usuario</label>
          <input v-model="form.identifier" required />
        </template>
        <label>Contraseña</label>
        <input type="password" v-model="form.password" required />
        <p v-if="error" class="muted">{{ error }}</p>
        <div class="flex" style="justify-content: flex-end; margin-top: 10px; gap:8px;">
          <button type="button" class="ghost" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="primary">{{ mode === 'login' ? 'Entrar' : 'Registrar' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { login, register } from "../api";

const emit = defineEmits(["close", "logged-in"]);
const mode = ref("login");
const form = ref({
  identifier: "",
  password: "",
  nombre: "",
  nickname: "",
  email: ""
});
const error = ref("");

async function submit() {
  error.value = "";
  try {
    let data;
    if (mode.value === "login") {
      data = await login(form.value.identifier.trim(), form.value.password);
    } else {
      data = await register({
        nombre: form.value.nombre.trim(),
        nickname: form.value.nickname.trim(),
        email: form.value.email.trim(),
        password: form.value.password
      });
    }
    emit("logged-in", data);
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  width: 360px;
  z-index: 2001;
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.muted {
  color: #ef4444;
}

.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.tabs button {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}
.tabs button.active {
  background: #eef2ff;
  border-color: #c7d2fe;
}
</style>
