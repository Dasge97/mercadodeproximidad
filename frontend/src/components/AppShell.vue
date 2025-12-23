<template>
  <div class="page">
    <header class="top-nav">
      <div class="nav-inner">
        <div class="brand">
          <img src="/logo.jpeg" alt="TerretaShop" class="brand-logo" />
        </div>

        <nav class="nav-links">
          <button class="nav-item" :class="{ active: store.state.view === 'comprar' }" @click="setView('comprar')">Comprar</button>
          <button class="nav-item" :disabled="!store.state.user" :class="{ active: store.state.view === 'vender' }" @click="setView('vender')">Vender</button>
          <button class="nav-item" :disabled="!store.state.user" :class="{ active: store.state.view === 'reservas' }" @click="setView('reservas')">Reservas</button>
          <button class="nav-item" :disabled="!store.state.user" :class="{ active: store.state.view === 'mensajes' }" @click="setView('mensajes')">Mensajes</button>
          <button class="nav-item" :disabled="!store.state.user" :class="{ active: store.state.view === 'valoraciones' }" @click="setView('valoraciones')">Valoraciones</button>
        </nav>

        <div class="session">
          <button class="ghost bell" title="Notificaciones" @click="setView('notificaciones')">
            🔔<span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
          </button>
          <button class="user-pill" v-if="store.state.user" @click="setView('perfil')">
            {{ store.state.user.nombre }}
          </button>
          <button v-if="!store.state.user" class="primary" @click="showLogin = true">Login</button>
          <button v-else class="ghost" @click="doLogout">Salir</button>
        </div>
      </div>
    </header>

    <main class="main">
      <LoginModal v-if="showLogin" @close="showLogin = false" @logged-in="onLoggedIn" />
      <DeliveryPointsModal v-if="showPoints" @close="showPoints = false" @saved="loadSellerProducts" />

      <section v-if="store.state.view === 'comprar'">
        <div v-if="showMap || !store.state.selectedZone" class="card map-large">
          <ZonePicker @zone-selected="onZoneSelected" />
          <p class="muted" style="margin-top:8px;">Selecciona tu ubicacion para cargar productos cercanos.</p>
        </div>
        <div v-else class="buy-layout">
          <div class="buy-sidebar">
            <FiltersPanel
              :categories="categories"
              :model-value="filters.value"
              @update:filters="updateFilters"
            />
          </div>
          <div class="buy-list">
            <ProductList :products="store.state.products" @refresh="loadProducts" />
          </div>
        </div>
      </section>

      <section v-else-if="store.state.view === 'vender'">
        <SellerPanel @refresh="loadProducts" />
      </section>

      <section v-else-if="store.state.view === 'reservas'">
        <ReservationsView
          :reservations="store.state.reservations"
          :tab="reservationsTab"
          mode="reservas"
          @change-tab="changeReservationsTab"
          @refresh="loadReservations"
          @chat="openChatFromReservation"
          @cancel="cancelReservationAction"
          @status-changed="onStatusChanged"
          @rate="openRating"
        />
      </section>

      <section v-else-if="store.state.view === 'mensajes'">
        <div class="messages-layout">
          <div class="messages-list">
            <ReservationsView
              :reservations="store.state.reservations"
              :tab="reservationsTab"
              mode="mensajes"
              @change-tab="changeReservationsTab"
              @refresh="loadReservations"
              @chat="openChatFromReservation"
              @rate="openRating"
            />
          </div>
          <div class="messages-detail" v-if="store.state.currentReservation">
            <ReservationDetail
              :reservation="store.state.currentReservation"
              :messages="store.state.messages"
              @refresh-messages="loadMessages"
            />
          </div>
          <div v-else class="card muted">Selecciona un chat para ver la conversacion.</div>
        </div>
      </section>

      <section v-else-if="store.state.view === 'valoraciones'">
        <div class="card" style="margin-bottom:10px;">
          <div class="filter-group">
            <button class="chip" :class="{ active: ratingTab === 'pendientes' }" @click="ratingTab = 'pendientes'">Pendientes</button>
            <button class="chip" :class="{ active: ratingTab === 'recibidas' }" @click="ratingTab = 'recibidas'">Recibidas</button>
            <button class="chip" :class="{ active: ratingTab === 'enviadas' }" @click="ratingTab = 'enviadas'">Mis valoraciones</button>
          </div>
        </div>

        <div v-if="ratingTab === 'pendientes'">
          <p class="muted" v-if="pendingToRate.length === 0">No tienes valoraciones pendientes.</p>
          <div v-for="res in pendingToRate" :key="res.id" class="card" style="margin-bottom:8px;">
            <div class="flex" style="justify-content: space-between; align-items:center;">
              <div>
                <strong>{{ res.producto_nombre }}</strong>
                <div class="muted">Reserva #{{ res.id }} · Estado: {{ res.estado }}</div>
              </div>
              <button class="primary" @click="openRating(res)">Valorar</button>
            </div>
          </div>
        </div>

        <div v-else-if="ratingTab === 'recibidas'">
          <p class="muted" v-if="store.state.ratings.length === 0">Aun no has recibido valoraciones.</p>
          <div v-for="rating in store.state.ratings" :key="rating.id" class="card" style="margin-bottom:8px;">
            <div class="flex" style="justify-content: space-between;">
              <span>{{ rating.autor_nombre }}</span>
              <span>{{ rating.nota_producto }}/5 producto</span>
            </div>
            <div class="muted">Entrega: {{ rating.nota_entrega }}/5 · Negociacion: {{ rating.nota_negociacion }}/5</div>
            <p v-if="rating.comentario">{{ rating.comentario }}</p>
          </div>
        </div>

        <div v-else>
          <p class="muted" v-if="store.state.ratingsSent.length === 0">Aun no has enviado valoraciones.</p>
          <div v-for="rating in store.state.ratingsSent" :key="rating.id" class="card" style="margin-bottom:8px;">
            <div class="flex" style="justify-content: space-between;">
              <span>Para: {{ rating.destinatario_nombre }}</span>
              <span>{{ rating.nota_producto }}/5 producto</span>
            </div>
            <div class="muted">Entrega: {{ rating.nota_entrega }}/5 · Negociacion: {{ rating.nota_negociacion }}/5</div>
            <p v-if="rating.comentario">{{ rating.comentario }}</p>
          </div>
        </div>

        <RatingForm
          v-if="store.state.currentReservation && store.state.currentReservation.estado === 'completada'"
          :reservation="store.state.currentReservation"
          @rated="onRated"
        />
      </section>

      <section v-else-if="store.state.view === 'perfil'">
        <ProfilePanel
          :user="store.state.user"
          :reservations="store.state.reservations"
          :products="store.state.products"
          :seller-products="store.state.sellerProducts"
          :ratings="store.state.ratings"
          :profile="store.state.profile"
          @update-profile="updateProfile"
          @change-location="resetLocation"
          @configure-points="openPoints"
        />
      </section>

      <section v-else-if="store.state.view === 'notificaciones'">
        <div class="card">
          <div class="flex" style="justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <h3 style="margin:0;">Notificaciones</h3>
              <p class="muted" style="margin:0;">Historial reciente</p>
            </div>
            <div class="filter-group">
              <button
                v-for="type in notifTypes"
                :key="type.value"
                class="chip"
                :class="{ active: notifFilter === type.value }"
                @click="notifFilter = type.value"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <p class="muted" v-if="filteredNotifications.length === 0">No hay notificaciones.</p>
          <ul v-else class="notif-list">
            <li v-for="(n, idx) in filteredNotifications" :key="idx" class="notif-item">
              <div class="notif-header">
                <span class="pill" :class="'pill-' + n.tipo">{{ n.title }}</span>
                <span class="muted">{{ n.fecha }}</span>
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ n.detail }}</div>
                <div class="muted">Reserva #{{ n.id_reserva }}</div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import store from "../store";
import {
  fetchMe,
  fetchProducts,
  fetchReservations,
  fetchMessages,
  fetchRatings,
  fetchRatingsSent,
  fetchCategories,
  cancelReservation,
  fetchNotifications,
  markNotificationRead
} from "../api";
import LoginModal from "./LoginModal.vue";
import DeliveryPointsModal from "./DeliveryPointsModal.vue";
import ZonePicker from "./ZonePicker.vue";
import ProductList from "./ProductList.vue";
import SellerPanel from "./SellerPanel.vue";
import ReservationsView from "./ReservationsView.vue";
import ReservationDetail from "./ReservationDetail.vue";
import RatingForm from "./RatingForm.vue";
import ProfilePanel from "./ProfilePanel.vue";
import FiltersPanel from "./FiltersPanel.vue";

const showLogin = ref(false);
const showMap = ref(true);
const showPoints = ref(false);
const reservationsTab = ref("pendientes"); // pendientes | encurso | finalizadas
const ratingTab = ref("pendientes");
const categories = ref([]);
const ratedReservations = ref([]);
const filters = ref({ q: "", categoryId: null });
const notifFilter = ref("todos");
const notifications = computed(() => store.state.notifications || []);
const notificationsList = computed(() =>
  (notifications.value || []).map((n) => {
    const label =
      n.tipo === "aceptada"
        ? "Reserva aceptada"
        : n.tipo === "cancelada"
        ? "Reserva cancelada"
        : n.tipo === "pendiente"
        ? "Nueva reserva"
        : n.tipo === "recibido"
        ? "Reserva completada"
        : n.tipo;
    const fecha = n.fecha_creacion ? new Date(n.fecha_creacion).toLocaleString() : "";
    return {
      ...n,
      title: label,
      detail: label,
      fecha
    };
  })
);
const unreadCount = computed(() => notificationsList.value.filter((n) => !n.leida).length);
const notifTypes = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Nuevas" },
  { value: "aceptada", label: "Aceptadas" },
  { value: "cancelada", label: "Canceladas" },
  { value: "recibido", label: "Completadas" }
];
const filteredNotifications = computed(() => {
  if (notifFilter.value === "todos") return notificationsList.value;
  return notificationsList.value.filter((n) => n.tipo === notifFilter.value);
});
const pendingToRate = computed(() =>
  (store.state.reservations || []).filter(
    (r) => r.estado === "completada" && !ratedReservations.value.includes(r.id)
  )
);

async function setView(view) {
  if (!store.state.user && view !== "comprar" && view !== "notificaciones") {
    showLogin.value = true;
    return;
  }
  if (view !== "mensajes") {
    store.setCurrentReservation(null);
    store.setMessages([]);
  }
  store.setView(view);
  if (view === "comprar") {
    if (!showMap.value && store.state.selectedZone) {
      loadProducts();
    }
    if (!categories.value.length) loadCategories();
  }
  if (view === "reservas" || view === "mensajes" || view === "valoraciones" || view === "perfil") {
    loadReservations();
  }
  if (view === "valoraciones" && store.state.user) {
    loadRatings();
  }
  if (view === "perfil" && store.state.user) {
    loadSellerProducts();
  }
  if (view === "notificaciones") {
    await loadNotifications();
    await markNotificationsRead();
    await loadNotifications();
  }
}

async function initSession() {
  if (!store.state.token) return;
  try {
    const user = await fetchMe();
    store.setAuth(user, store.state.token);
    if (store.state.selectedZone) {
      showMap.value = false;
      if (!store.state.profile?.ubicacion) {
        await updateLocationLabel(store.state.selectedZone);
      }
      loadProducts();
    }
    loadReservations();
    loadRatings();
    loadCategories();
    loadSellerProducts();
    await loadNotifications();
  } catch (_err) {
    store.logout();
  }
}

async function loadProducts() {
  const zone = store.state.selectedZone;
  if (!zone) {
    store.setProducts([]);
    return;
  }
  const radius = Number(store.state.profile?.radioBusqueda) || 15;
  const params = {
    lat: zone.lat,
    lng: zone.lng,
    radiusKm: radius,
    q: filters.value.q || undefined,
    categoryId: filters.value.categoryId || undefined
  };
  const products = await fetchProducts(params);
  store.setProducts(products);
}

async function loadReservations() {
  if (!store.state.user) return;
  const reservations = await fetchReservations();
  store.setReservations(reservations);
}

async function loadMessages(reservationId = store.state.currentReservation?.id) {
  if (!reservationId) return;
  const messages = await fetchMessages(reservationId);
  store.setMessages(messages);
}

async function loadRatings() {
  if (!store.state.user) return;
  const ratings = await fetchRatings(store.state.user.id);
  store.setRatings(ratings);
  const sent = await fetchRatingsSent(store.state.user.id);
  store.setRatingsSent(sent);
  ratedReservations.value = Array.from(new Set(sent.map((r) => r.id_reserva)));
}

function onZoneSelected(zone) {
  store.setZone(zone);
  if (zone?.lat && zone?.lng) {
    updateLocationLabel(zone);
  }
  showMap.value = false;
  loadProducts();
}

function onLoggedIn({ user, token }) {
  store.setAuth(user, token);
  showLogin.value = false;
  loadProducts();
  loadReservations();
  loadRatings();
  loadCategories();
  loadNotifications();
}

function doLogout() {
  store.logout();
  store.setProducts([]);
  store.setReservations([]);
  store.setCurrentReservation(null);
  store.setMessages([]);
  showMap.value = true;
}

function openChatFromReservation(reservation) {
  store.setCurrentReservation(reservation);
  store.setView("mensajes");
  loadMessages(reservation.id);
}

function updateProfile(profile) {
  const updatedUser = { ...store.state.user };
  if (profile.nombre !== undefined) updatedUser.nombre = profile.nombre;
  if (profile.email !== undefined) updatedUser.email = profile.email;
  store.setAuth(updatedUser, store.state.token);
  store.setProfile(profile);
}

function updateFilters(next) {
  filters.value = { ...filters.value, ...next };
  loadProducts();
}

async function loadCategories() {
  categories.value = await fetchCategories();
}

async function loadSellerProducts() {
  if (!store.state.user) return;
  const items = await fetchProducts({ sellerId: store.state.user.id });
  store.setSellerProducts(items);
}

function resetLocation() {
  store.setZone(null);
  store.setProducts([]);
  showMap.value = true;
  store.setView("comprar");
}

function changeReservationsTab(tab) {
  reservationsTab.value = tab;
  loadReservations();
}

async function cancelReservationAction(reservation) {
  await cancelReservation(reservation.id);
  await loadReservations();
  await loadProducts();
}

async function onStatusChanged() {
  await loadReservations();
  await loadProducts();
}

async function loadNotifications() {
  if (!store.state.user) return;
  const notifs = await fetchNotifications();
  store.setNotifications(notifs);
}

async function markNotificationsRead() {
  if (!store.state.user) return;
  const unread = (store.state.notifications || []).filter((n) => !n.leida);
  if (!unread.length) return;
  await Promise.all(unread.map((n) => markNotificationRead(n.id).catch(() => null)));
}

function openRating(reservation) {
  store.setCurrentReservation(reservation);
  store.setView("valoraciones");
  loadRatings();
}

function openPoints() {
  showPoints.value = true;
}

async function onRated() {
  if (store.state.currentReservation) {
    ratedReservations.value = [...new Set([...ratedReservations.value, store.state.currentReservation.id])];
    store.setCurrentReservation(null);
  }
  ratingTab.value = "recibidas";
  await loadRatings();
  await loadReservations();
}

async function updateLocationLabel(zone) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${zone.lat}&lon=${zone.lng}&zoom=14&addressdetails=1`,
      { headers: { "User-Agent": "terretashop-demo" } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const label = data.display_name || [addr.road, addr.city || addr.town || addr.village, addr.country]
      .filter(Boolean)
      .join(", ");
    const ubic = label || `${zone.lat.toFixed(4)}, ${zone.lng.toFixed(4)}`;
    store.setProfile({ ubicacion: ubic, lat: zone.lat, lng: zone.lng });
  } catch (_err) {
    const fallback = `${zone.lat.toFixed(4)}, ${zone.lng.toFixed(4)}`;
    store.setProfile({ ubicacion: fallback, lat: zone.lat, lng: zone.lng });
  }
}

onMounted(() => {
  initSession();
});
</script>

<style scoped>
.muted { color: #6b7280; }
.page { background: #f8fafc; min-height: 100vh; }
.main { padding: 24px; max-width: 1200px; margin: 0 auto; }
.top-nav { background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 10; }
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; }
.brand-icon {
  width: 36px;
  height: 36px;
  background: #0f172a;
  color: #fff;
  display: grid;
  place-items: center;
  border-radius: 12px;
  font-weight: 800;
}
.brand-logo {
  height: 75px;
  width: auto;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
  margin-right: 12px;
  margin-left: 8px;
}
.brand-text { line-height: 1.2; }
.brand-title { font-size: 15px; }
.brand-sub { font-size: 12px; color: #6b7280; }
.nav-links {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex: 1;
  flex-wrap: wrap;
}
.nav-item {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 110px;
  justify-content: center;
}
.nav-item.active { background: #eef2ff; border-color: #c7d2fe; }
.nav-item:disabled { opacity: 0.5; cursor: not-allowed; }
.session { display: flex; align-items: center; gap: 8px; }
.user-pill {
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 20px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 6px;
}
.bell { border-radius: 50%; width: 36px; height: 36px; }
.badge {
  background: #ef4444;
  color: #fff;
  border-radius: 999px;
  padding: 2px 6px;
  font-size: 11px;
  margin-left: 4px;
}

.messages-layout { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 12px; }
.messages-list { min-width: 0; }
.messages-detail { min-width: 0; }
.buy-layout { display: grid; grid-template-columns: 320px 1fr; gap: 12px; align-items: start; }
.buy-sidebar { display: flex; flex-direction: column; gap: 10px; }
.buy-list { min-width: 0; }
.notif-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.notif-title { font-weight: 600; }
.map-large { padding: 0; overflow: hidden; }
.map-large > :first-child { height: 400px; }
.notif-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f9fafb;
}
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.pill {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  background: #e5e7eb;
}
.pill-aceptada { background: #d1fae5; color: #065f46; }
.pill-cancelada { background: #fee2e2; color: #991b1b; }
.pill-pendiente { background: #e0e7ff; color: #312e81; }
.pill-recibido { background: #fef3c7; color: #92400e; }
.notif-body { display: flex; flex-direction: column; gap: 2px; }
.filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
.chip {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 6px 10px;
  cursor: pointer;
}
.chip.active {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #111827;
}

@media (max-width: 900px) {
  .messages-layout { grid-template-columns: 1fr; }
  .buy-layout { grid-template-columns: 1fr; }
}
</style>
