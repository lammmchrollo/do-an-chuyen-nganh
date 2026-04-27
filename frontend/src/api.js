import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const API = {
  user: axios.create({ baseURL: `${BASE_URL}/api/users` }),
  restaurant: axios.create({ baseURL: `${BASE_URL}/api/restaurants` }),
  order: axios.create({ baseURL: `${BASE_URL}/api/orders` }),
  payment: axios.create({ baseURL: `${BASE_URL}/api/payments` }),
  delivery: axios.create({ baseURL: `${BASE_URL}/api/deliveries` }),
  notification: axios.create({ baseURL: `${BASE_URL}/api/notifications` }),
};

Object.values(API).forEach((client) => {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
});

export const appUrls = {
  baseUrl: BASE_URL,
  notificationSocketUrl:
    import.meta.env.VITE_NOTIFICATION_SOCKET_URL || BASE_URL || window.location.origin,
};

export default API;
