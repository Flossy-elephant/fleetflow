import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000" });

// ─── STATUS NORMALIZER ───────────────────────────────────────────────────────
// Your backend uses "Available", "OnTrip" etc.
// The frontend UI uses "AVAILABLE", "ON_TRIP" etc.
const STATUS_MAP = {
  Available: "AVAILABLE",
  OnTrip: "ON_TRIP",
  InShop: "IN_SHOP",
  OnDuty: "ON_DUTY",
  OffDuty: "OFF_DUTY",
  Suspended: "SUSPENDED",
  Dispatched: "DISPATCHED",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
  Draft: "DRAFT",
  Open: "OPEN",
  Closed: "CLOSED",
};

// ─── KEY CONVERTER snake_case → camelCase ─────────────────────────────────
const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const convertKeys = (obj) => {
  if (Array.isArray(obj)) return obj.map(convertKeys);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        const camelKey = toCamel(k);
        let value = convertKeys(v);
        // Normalize status values
        if (camelKey === "status" && typeof value === "string" && STATUS_MAP[value]) {
          value = STATUS_MAP[value];
        }
        return [camelKey, value];
      })
    );
  }
  return obj;
};

// ─── AUTO CONVERT ALL RESPONSES ──────────────────────────────────────────────
api.interceptors.response.use(
  (res) => { res.data = convertKeys(res.data); return res; },
  (err) => Promise.reject(err)
);

export default api;

// ─── API METHODS ─────────────────────────────────────────────────────────────

export const auth = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
};

export const vehicles = {
  list: (params) => api.get("/vehicles", { params }),
  get: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", {
    name: data.name,
    license_plate: data.licensePlate,
    max_capacity: Number(data.maxCapacity),
    odometer: Number(data.odometer) || 0,
    status: "Available",
    acquisition_cost: Number(data.acquisitionCost) || 0,
  }),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  retire: (id) => api.put(`/vehicles/${id}`, { status: "Retired" }),
  recommend: (params) => api.get("/vehicles/recommend/smart", { params }),
};

export const drivers = {
  list: (params) => api.get("/drivers", { params }),
  get: (id) => api.get(`/drivers/${id}`),
  rankings: () => api.get("/drivers/rankings"),
  create: (data) => api.post("/drivers", {
    name: data.name,
    license_expiry: data.licenseExpiry,
    status: data.status === "ON_DUTY" ? "OnDuty" : data.status === "OFF_DUTY" ? "OffDuty" : "Suspended",
    safety_score: Number(data.safetyScore) || 100,
  }),
  update: (id, data) => {
    const payload = {};
    if (data.name) payload.name = data.name;
    if (data.licenseExpiry) payload.license_expiry = data.licenseExpiry;
    if (data.safetyScore !== undefined) payload.safety_score = Number(data.safetyScore);
    if (data.status) {
      const statusMap = { ON_DUTY: "OnDuty", OFF_DUTY: "OffDuty", SUSPENDED: "Suspended" };
      payload.status = statusMap[data.status] || data.status;
    }
    return api.put(`/drivers/${id}`, payload);
  },
};

export const trips = {
  list: (params) => api.get("/trips", { params }),
  get: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post("/trips", {
    vehicle_id: Number(data.vehicleId),
    driver_id: Number(data.driverId),
    cargo_weight: Number(data.cargoWeight),
    distance_km: Number(data.distanceKm) || 0,
    revenue: Number(data.revenue) || 0,
    origin: data.origin,
    destination: data.destination,
    notes: data.notes,
  }),
  complete: (id, data) => api.post(`/trips/${id}/complete`, {
    end_odometer: Number(data.endOdometer) || 0,
  }),
  cancel: (id) => api.post(`/trips/${id}/cancel`),
};

export const maintenance = {
  list: (params) => api.get("/maintenance", { params }),
  create: (data) => api.post("/maintenance", {
    vehicle_id: Number(data.vehicleId),
    description: data.description,
    cost: Number(data.cost),
    date: data.date || null,
  }),
  close: (id) => api.post(`/maintenance/${id}/close`),
};

export const fuel = {
  list: (params) => api.get("/fuel", { params: params?.vehicleId ? { vehicle_id: params.vehicleId } : {} }),
  create: (data) => api.post("/fuel", {
    vehicle_id: Number(data.vehicleId),
    liters: Number(data.liters),
    cost: Number(data.cost),
    date: data.date || null,
  }),
};

export const analytics = {
  summary: () => api.get("/analytics/fleet-summary"),
  vehicleRoi: (id) => api.get(`/analytics/vehicle-roi/${id}`),
  fuelEfficiency: () => api.get("/analytics/fuel-efficiency"),
  monthly: () => api.get("/analytics/monthly-summary"),
};
