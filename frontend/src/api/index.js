import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ff_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ff_token");
      localStorage.removeItem("ff_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const auth = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

export const vehicles = {
  list: (params) => api.get("/vehicles", { params }),
  get: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  retire: (id) => api.delete(`/vehicles/${id}`),
  recommend: (params) => api.get("/vehicles/recommend/smart", { params }),
};

export const drivers = {
  list: (params) => api.get("/drivers", { params }),
  get: (id) => api.get(`/drivers/${id}`),
  rankings: () => api.get("/drivers/rankings"),
  create: (data) => api.post("/drivers", data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
};

export const trips = {
  list: (params) => api.get("/trips", { params }),
  get: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post("/trips", data),
  complete: (id, data) => api.put(`/trips/${id}/complete`, data),
  cancel: (id) => api.put(`/trips/${id}/cancel`),
};

export const maintenance = {
  list: () => api.get("/maintenance"),
  create: (data) => api.post("/maintenance", data),
  close: (id) => api.put(`/maintenance/${id}/close`),
};

export const fuel = {
  list: (params) => api.get("/fuel", { params }),
  create: (data) => api.post("/fuel", data),
};

export const analytics = {
  summary: () => api.get("/analytics/fleet-summary"),
  vehicleRoi: (id) => api.get(`/analytics/vehicle-roi/${id}`),
  fuelEfficiency: () => api.get("/analytics/fuel-efficiency"),
  monthly: () => api.get("/analytics/monthly-summary"),
};
