import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import FuelLogs from "./pages/FuelLogs";
import Analytics from "./pages/Analytics";

function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-surface min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/fuel" element={<FuelLogs />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
