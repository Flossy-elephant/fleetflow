# 🚛 FleetFlow — Modular Fleet & Logistics Management System

> A rule-driven fleet intelligence system with automated compliance enforcement, performance-based driver rankings, and smart dispatch recommendations to reduce operational cost.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Flossy-elephant/fleetflow.git
cd fleetflow
```

### 2. Backend Setup
```bash
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```
Backend runs on → http://localhost:3001

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on → http://localhost:5173

### 4. Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Manager | manager@fleetflow.com | password123 |
| Dispatcher | dispatcher@fleetflow.com | password123 |

> **Note:** No database installation required. SQLite is used — the database file is auto-created on first run.

---

## 🏗️ Architecture

```
fleetflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # DB schema (6 models)
│   │   └── seed.js            # Demo data
│   └── src/
│       ├── index.js           # Express server
│       ├── middleware/auth.js # JWT middleware
│       └── routes/
│           ├── auth.js        # Login/Register
│           ├── vehicles.js    # + Smart Recommend endpoint
│           ├── drivers.js     # + Rankings endpoint
│           ├── trips.js       # Core dispatch engine
│           ├── maintenance.js # Auto status transitions
│           ├── fuel.js        # Fuel logging
│           └── analytics.js  # ROI, efficiency, summaries
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx  # Command Center
        │   ├── Vehicles.jsx   # + Smart Recommend modal
        │   ├── Drivers.jsx    # + Driver Rankings leaderboard
        │   ├── Trips.jsx      # Dispatch engine UI
        │   ├── Maintenance.jsx
        │   ├── FuelLogs.jsx
        │   └── Analytics.jsx  # Charts + ROI calculator
        ├── components/
        │   ├── Sidebar.jsx
        │   └── ui.jsx         # Design system components
        ├── api/index.js       # Axios client
        └── context/AuthContext.jsx
```

---

## 🔑 Core Logic

### Trip Dispatch (The Engine)
```
POST /api/trips
Checks:
  ✓ Vehicle.status === "AVAILABLE"
  ✓ Driver.status === "ON_DUTY"
  ✓ cargoWeight ≤ vehicle.maxCapacity
  ✓ driver.licenseExpiry > today

On success (atomic transaction):
  → Vehicle.status = ON_TRIP
  → Driver.status = ON_TRIP
  → Trip.status = DISPATCHED

Error messages:
  "Dispatch blocked: Vehicle overloaded by 80kg."
  "Dispatch blocked: Driver license expired on 15/01/2025."
  "Dispatch blocked: Driver 'Vikram Rao' is currently SUSPENDED."
```

### Maintenance Auto-Logic
```
Create maintenance log → Vehicle.status = IN_SHOP (hidden from dispatch)
Close maintenance log  → Vehicle.status = AVAILABLE
```

### ⭐ Driver Rankings Formula
```
Score = (Completion Rate × 40%)
      + (Safety Score × 30%)
      + (On-Time Rate × 20%)
      - (Violation Penalty × 10%)
```

### ⭐ Smart Dispatch Recommendation
```
GET /api/vehicles/recommend/smart?cargo=450&distance=120

For each Available vehicle with capacity ≥ cargo:
  Capacity Match  = 100 - ((maxCapacity - cargoWeight) / maxCapacity × 100)
  Cost Efficiency = based on (fuel + maintenance) / total km driven
  Maintenance Health = recency of last service

Final Score = (40% × Capacity) + (30% × Cost) + (30% × Maintenance)
Returns: best vehicle + score + human-readable reason
```

### Vehicle ROI
```
ROI = (Revenue - (Fuel + Maintenance)) / Acquisition Cost × 100
```

---

## 📊 API Reference

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register

### Vehicles
- `GET /api/vehicles` — List (filter by status/type)
- `POST /api/vehicles` — Create
- `PUT /api/vehicles/:id` — Update
- `DELETE /api/vehicles/:id` — Retire
- `GET /api/vehicles/recommend/smart?cargo=&distance=` — ⭐ Smart recommendation

### Drivers
- `GET /api/drivers` — List (filter by status)
- `GET /api/drivers/rankings` — ⭐ Performance leaderboard
- `POST /api/drivers` — Create
- `PUT /api/drivers/:id` — Update

### Trips
- `GET /api/trips` — List (filter by status)
- `POST /api/trips` — Create + Dispatch (with full validation)
- `PUT /api/trips/:id/complete` — Complete trip
- `PUT /api/trips/:id/cancel` — Cancel trip

### Maintenance
- `GET /api/maintenance` — List
- `POST /api/maintenance` — Create (auto sets vehicle IN_SHOP)
- `PUT /api/maintenance/:id/close` — Close (auto sets vehicle AVAILABLE)

### Fuel
- `GET /api/fuel` — List (filter by vehicleId)
- `POST /api/fuel` — Create

### Analytics
- `GET /api/analytics/fleet-summary` — KPIs
- `GET /api/analytics/vehicle-roi/:id` — Vehicle ROI
- `GET /api/analytics/fuel-efficiency` — km/L per vehicle
- `GET /api/analytics/monthly-summary` — Monthly trends

---

## 🎤 Demo Script (For Judges)

1. **Login** as Manager → show the Command Center dashboard with live KPIs
2. **Vehicles** → click "Smart Recommend" → enter 450kg cargo → show AI recommendation with score
3. **Trips** → Dispatch a new trip:
   - Select Van-01 + Rajesh Kumar → 450kg → Mumbai → Pune
   - Show real-time status update (Vehicle: Available → On Trip)
   - Try overloading: enter 600kg → "Dispatch blocked: Vehicle overloaded by 100kg"
4. **Maintenance** → Log service for Van-01 → show it disappears from dispatch pool
5. **Drivers** → Click "Rankings" → show leaderboard with formula breakdown
6. **Analytics** → Show ROI calculator and fuel efficiency charts

**Pitch line:**
> "We built a rule-driven fleet intelligence system with automated compliance enforcement, performance-based driver rankings, and smart dispatch recommendations to reduce operational cost."

---

## 🏆 What Makes This Stand Out
- ✅ Atomic DB transactions (no race conditions)
- ✅ Descriptive error messages (not generic 400s)
- ✅ Smart AI-style recommendation engine
- ✅ Automatic status state machine
- ✅ Driver performance leaderboard
- ✅ Full financial analytics + ROI
- ✅ Real-time fleet visibility dashboard
- ✅ Clean, dark industrial UI
