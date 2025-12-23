import store from "./store";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const headers = options.headers || {};
  if (store.state.token) {
    headers.Authorization = `Bearer ${store.state.token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });

  if (res.status === 401) {
    store.logout();
    throw new Error("Sesión expirada");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = data.error || "Error de red";
    throw new Error(error);
  }
  return data;
}

export function login(identifier, password) {
  const payload = identifier.includes("@")
    ? { email: identifier, password }
    : { username: identifier, password };
  return request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function register({ nombre, nickname, email, password, tipo = "comprador" }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ nombre, nickname, email, password, tipo })
  });
}

export function fetchMe() {
  return request("/api/auth/me");
}

export function fetchProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  return request(`/api/products?${qs.toString()}`);
}

export function fetchCategories() {
  return request("/api/categories");
}

export function createProduct(payload) {
  return request("/api/products", { method: "POST", body: JSON.stringify(payload) });
}

export function updateProduct(id, payload) {
  return request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteProduct(id) {
  return request(`/api/products/${id}`, { method: "DELETE" });
}

export function createReservation(payload) {
  return request("/api/reservations", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchReservations(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request(`/api/reservations${suffix}`);
}

export function fetchReservation(id) {
  return request(`/api/reservations/${id}`);
}

export function updateReservationStatus(id, status) {
  return request(`/api/reservations/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
}

export function cancelReservation(id) {
  return request(`/api/reservations/${id}/cancel`, { method: "PUT" });
}

export function fetchMessages(reservationId) {
  return request(`/api/reservations/${reservationId}/messages`);
}

export function sendMessage(reservationId, message) {
  return request(`/api/reservations/${reservationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message })
  });
}

export function createRating(reservationId, payload) {
  return request(`/api/reservations/${reservationId}/ratings`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchRatings(userId) {
  return request(`/api/users/${userId}/ratings`);
}

export function fetchRatingsSent(userId) {
  return request(`/api/users/${userId}/ratings/sent`);
}

export function fetchNotifications() {
  return request("/api/notifications");
}

export function markNotificationRead(id) {
  return request(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export function fetchDeliveryPoints() {
  return request("/api/delivery-points");
}

export function saveDeliveryPoints(points) {
  return request("/api/delivery-points", {
    method: "POST",
    body: JSON.stringify({ points })
  });
}
