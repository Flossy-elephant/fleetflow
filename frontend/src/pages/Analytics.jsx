import { useEffect, useState } from "react";
import { analytics, vehicles as vehiclesApi } from "../api";
import { Card, Button, Select, ErrorBanner, PageHeader, LoadingSpinner, StatCard } from "../components/ui";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Fuel, Truck } from "lucide-react";

const COLORS = ["#F97316", "#10B981", "#3B82F6", "#A855F7", "#EF4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg p-3 text-xs font-mono shadow-xl">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" && p.value > 1000 ? `₹${(p.value / 1000).toFixed(1)}K` : p.value}</p>)}
    </div>
  );
};

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [fuelEff, setFuelEff] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [roi, setRoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([analytics.summary(), analytics.fuelEfficiency(), analytics.monthly(), vehiclesApi.list()])
      .then(([s, f, m, v]) => { setSummary(s.data); setFuelEff(f.data); setMonthly(m.data); setVehicles(v.data); })
      .catch((e) => setError(e.response?.data?.error || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const handleRoi = async () => {
    if (!selectedVehicle) return;
    try {
      const r = await analytics.vehicleRoi(selectedVehicle);
      setRoi(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to compute ROI");
    }
  };

  const pieData = summary ? [
    { name: "Available", value: summary.vehicles.available },
    { name: "On Trip", value: summary.vehicles.active },
    { name: "In Shop", value: summary.vehicles.inShop },
    { name: "Retired", value: summary.vehicles.retired },
  ].filter((d) => d.value > 0) : [];

  if (loading) return <LoadingSpinner text="Crunching numbers..." />;

  return (
    <div className="fade-in">
      <PageHeader title="Operational Analytics" subtitle="Data-driven fleet performance insights" />
      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {summary && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Revenue" value={`₹${(summary.financial.totalRevenue / 1000).toFixed(1)}K`} icon={DollarSign} color="green" />
            <StatCard label="Operational Cost" value={`₹${(summary.financial.totalOperationalCost / 1000).toFixed(1)}K`} icon={Fuel} color="red" />
            <StatCard label="Net Profit" value={`₹${((summary.financial.totalRevenue - summary.financial.totalOperationalCost) / 1000).toFixed(1)}K`} icon={TrendingUp} color={summary.financial.totalRevenue > summary.financial.totalOperationalCost ? "green" : "red"} />
            <StatCard label="Fleet Utilization" value={`${summary.utilization}%`} icon={Truck} color="brand" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Monthly Revenue vs Cost */}
            <Card className="lg:col-span-2">
              <h3 className="font-display font-700 text-xs uppercase tracking-widest text-text-secondary mb-4">Monthly Revenue vs Cost</h3>
              {monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
                    <XAxis dataKey="month" tick={{ fill: "#8B99B5", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                    <YAxis tick={{ fill: "#8B99B5", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} name="Revenue" />
                    <Line type="monotone" dataKey="fuelCost" stroke="#F97316" strokeWidth={2} dot={{ fill: "#F97316", r: 3 }} name="Fuel" />
                    <Line type="monotone" dataKey="maintCost" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444", r: 3 }} name="Maintenance" />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-text-muted text-xs font-mono py-8 text-center">No monthly data yet</p>}
            </Card>

            {/* Fleet Pie */}
            <Card>
              <h3 className="font-display font-700 text-xs uppercase tracking-widest text-text-secondary mb-4">Fleet Status</h3>
              {pieData.length > 0 ? (
                <div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-text-secondary">{d.name}</span>
                        </div>
                        <span className="text-text-primary">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-text-muted text-xs font-mono py-8 text-center">No data</p>}
            </Card>
          </div>

          {/* Fuel Efficiency */}
          <Card className="mb-4">
            <h3 className="font-display font-700 text-xs uppercase tracking-widest text-text-secondary mb-4">Fuel Efficiency by Vehicle (km/L)</h3>
            {fuelEff.filter((f) => f.kmPerL > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fuelEff.filter((f) => f.kmPerL > 0)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
                  <XAxis dataKey="name" tick={{ fill: "#8B99B5", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fill: "#8B99B5", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="kmPerL" name="km/L" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-text-muted text-xs font-mono py-8 text-center">No fuel efficiency data yet. Add fuel logs to generate this chart.</p>}
          </Card>

          {/* Vehicle ROI Calculator */}
          <Card>
            <h3 className="font-display font-700 text-xs uppercase tracking-widest text-text-secondary mb-4">Vehicle ROI Calculator</h3>
            <div className="flex gap-3 mb-4">
              <Select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="flex-1">
                <option value="">Select a vehicle...</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.licensePlate}</option>)}
              </Select>
              <Button onClick={handleRoi} disabled={!selectedVehicle}>Calculate ROI</Button>
            </div>

            {roi && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: `₹${roi.totalRevenue.toLocaleString()}`, color: "text-emerald-400" },
                  { label: "Fuel + Maintenance", value: `₹${roi.totalCost.toLocaleString()}`, color: "text-red-400" },
                  { label: "Net Profit", value: `₹${roi.profit.toLocaleString()}`, color: roi.profit >= 0 ? "text-emerald-400" : "text-red-400" },
                  { label: "ROI", value: `${roi.roi}%`, color: roi.roi >= 0 ? "text-brand" : "text-red-400" },
                  { label: "Km/L", value: roi.kmPerL > 0 ? roi.kmPerL : "—", color: "text-text-primary" },
                  { label: "Total Km", value: `${roi.totalKm?.toLocaleString()} km`, color: "text-text-primary" },
                  { label: "Trips Completed", value: roi.tripsCompleted, color: "text-text-primary" },
                  { label: "Acquisition Cost", value: `₹${roi.vehicle ? vehicles.find((v) => String(v.id) === String(selectedVehicle))?.acquisitionCost?.toLocaleString() : "—"}`, color: "text-text-secondary" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-surface-hover rounded-lg p-3">
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{label}</p>
                    <p className={`font-display font-700 text-lg ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
