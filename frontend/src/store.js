import { reactive } from "vue";

const state = reactive({
  user: null,
  token: localStorage.getItem("token") || null,
  selectedZone: loadZone(),
  view: "comprar",
  products: [],
  sellerProducts: [],
  reservations: [],
  currentReservation: null,
  messages: [],
  ratings: [],
  ratingsSent: [],
  profile: loadProfile(),
  notifications: []
});

function setAuth(user, token) {
  state.user = user;
  state.token = token;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

function logout() {
  state.user = null;
  state.token = null;
  state.reservations = [];
  state.currentReservation = null;
  localStorage.removeItem("token");
}

function loadProfile() {
  const raw = localStorage.getItem("profile");
  if (!raw) return { telefono: "", ubicacion: "", radioBusqueda: 10, preferencias: "" };
  try {
    return JSON.parse(raw);
  } catch (_err) {
    return { telefono: "", ubicacion: "", radioBusqueda: 10, preferencias: "" };
  }
}

function saveProfile(profile) {
  localStorage.setItem("profile", JSON.stringify(profile));
}

function loadZone() {
  const raw = localStorage.getItem("selectedZone");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

function saveZone(zone) {
  if (zone) {
    localStorage.setItem("selectedZone", JSON.stringify(zone));
  } else {
    localStorage.removeItem("selectedZone");
  }
}

export default {
  state,
  setAuth,
  logout,
  setZone(zone) {
    state.selectedZone = zone;
    saveZone(zone);
  },
  setView(view) {
    state.view = view;
  },
  setProducts(products) {
    state.products = products;
  },
  setSellerProducts(products) {
    state.sellerProducts = products;
  },
  setReservations(reservations) {
    state.reservations = reservations;
  },
  setCurrentReservation(reservation) {
    state.currentReservation = reservation;
  },
  setMessages(messages) {
    state.messages = messages;
  },
  setRatings(ratings) {
    state.ratings = ratings;
  },
  setRatingsSent(ratings) {
    state.ratingsSent = ratings;
  },
  setProfile(profile) {
    state.profile = { ...state.profile, ...profile };
    saveProfile(state.profile);
  },
  setNotifications(notifs) {
    state.notifications = notifs;
  }
};
