import { useEffect, useState } from "react";
import { analytics, trips as tripsApi } from "../api";
import { StatCard, Card, StatusPill, LoadingSpinner, ErrorBanner } from "../components/ui";
import { Truck, Users, Route, TrendingUp, DollarSign, Fuel, AlertCircle, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([analytics.summary(), tripsApi.list()])
      .then(([s, t]) => { setSummary(s.data); setRecentTrips(t.data.slice(0, 5)); })
      .catch((e) => setError(e.response?.data?.error || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading Command Center..." />;

  return (
    <div className="fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-brand pulse-dot" />
          <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">Live Fleet Status</span>
        </div>
        <h1 className="font-display font-800 text-3xl uppercase tracking-wider text-text-primary">Command Center</h1>
      </div>

      <ErrorBanner message={error} />

      {summary && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Active Fleet" value={summary.vehicles.active} sub={`of ${summary.vehicles.total} vehicles`} icon={Truck} color="brand" />
            <StatCard label="In Maintenance" value={summary.vehicles.inShop} sub="vehicles in shop" icon={AlertCircle} color="red" />
            <StatCard label="Utilization Rate" value={`${summary.utilization}%`} sub="fleet assigned" icon={TrendingUp} color="blue" />
            <StatCard label="Active Trips" value={summary.trips.active} sub={`${summary.trips.completed} completed`} icon={Route} color="green" />
          </div>

          {/* Financial Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Revenue" value={`₹${(summary.financial.totalRevenue / 1000).toFixed(1)}K`} sub="from completed trips" icon={DollarSign} color="green" />
            <StatCard label="Fuel Cost" value={`₹${(summary.financial.totalFuelCost / 1000).toFixed(1)}K`} sub="total spent" icon={Fuel} color="purple" />
            <StatCard label="Avg Cost/km" value={`₹${summary.financial.avgCostPerKm}`} sub="operational cost per km" icon={TrendingUp} color="brand" />
          </div>

          {/* Fleet Status Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <h3 className="font-display font-700 text-xs uppercase tracking-widest text-text-secondary mb-4">Fleet Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: "Available", count: summary.vehicles.available, total: summary.vehicles.total, color: "bg-emerald-500" },
                  { label: "On Trip", count: summary.vehicles.active, total: summary.vehicles.total, color: "bg-brand" },
                  { label: "In Shop", count: summary.vehicles.inShop, total: summary.vehicles.total, color: "bg-red-500" },
                  { label: "Retired", count: summary.vehicles.retired, total: summary.vehicles.total, color: "bg-gray-600" },
                ].map(({ label, count, total, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-text-secondary">{label}</span>
                      <span className="text-text-primary">{count} / {total}</span>
                    </div>
                    <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-display font-700 text-xs uppercase tracking-widest text-text-secondary mb-4">Driver Status</h3>
              <div className="space-y-3">
                {[
                  { label: "On Duty", count: summary.drivers.onDuty, total: summary.drivers.total, color: "bg-emerald-500" },
                  { label: "On Trip", count: summary.drivers.onTrip, total: summary.drivers.total, color: "bg-brand" },
                  { label: "Suspended", count: summary.drivers.suspended, total: summary.drivers.total, color: "bg-red-500" },
                ].map(({ label, count, total, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-text-secondary">{label}</span>
                      <span className="text-text-primary">{count} / {total}</span>
                    </div>
                    <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Recent Trips */}
      <Card>
        <h3 className="font-display font-700 text-xs uppercase tracking-widest text-text-secondary mb-4">Recent Trips</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {["Trip ID", "Vehicle", "Driver", "Route", "Status"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-mono text-text-secondary uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTrips.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-text-muted font-mono text-xs">No trips found</td></tr>
              ) : (
                recentTrips.map((t) => (
                  <tr key={t.id} className="border-b border-surface-border/50 hover:bg-surface-hover/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-brand text-xs">#{String(t.id).padStart(4, "0")}</td>
                    <td className="py-3 px-4 text-text-primary text-xs">{t.vehicle?.name}</td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{t.driver?.name}</td>
                    <td className="py-3 px-4 text-text-secondary text-xs truncate max-w-48">{t.origin} → {t.destination}</td>
                    <td className="py-3 px-4"><StatusPill status={t.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
