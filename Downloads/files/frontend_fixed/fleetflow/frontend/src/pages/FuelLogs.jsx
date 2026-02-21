import { useEffect, useState } from "react";
import { fuel as fuelApi, vehicles as vehiclesApi } from "../api";
import { Card, Button, Modal, Input, Select, ErrorBanner, PageHeader, LoadingSpinner } from "../components/ui";
import { Plus, Fuel } from "lucide-react";
import { format } from "date-fns";

export default function FuelLogs() {
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", liters: "", cost: "", date: "", odometer: "" });
  const [saving, setSaving] = useState(false);
  const [filterVehicle, setFilterVehicle] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([fuelApi.list(filterVehicle ? { vehicleId: filterVehicle } : {}), vehiclesApi.list()])
      .then(([f, v]) => { setData(f.data); setVehicles(v.data); })
      .catch((e) => setError(e.response?.data?.error || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterVehicle]);

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      await fuelApi.create({ ...form, liters: Number(form.liters), cost: Number(form.cost), odometer: form.odometer ? Number(form.odometer) : undefined });
      setModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to add log");
    } finally { setSaving(false); }
  };

  const totalCost = data.reduce((s, f) => s + f.cost, 0);
  const totalLiters = data.reduce((s, f) => s + f.liters, 0);

  return (
    <div className="fade-in">
      <PageHeader
        title="Fuel Logs"
        subtitle="Track fuel consumption and costs per vehicle"
        actions={<Button onClick={() => { setForm({ vehicleId: "", liters: "", cost: "", date: "", odometer: "" }); setModal(true); }}><Plus size={14} />Add Fuel Log</Button>}
      />

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Total Records</p>
          <p className="font-display font-800 text-2xl text-text-primary">{data.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Total Liters</p>
          <p className="font-display font-800 text-2xl text-brand">{totalLiters.toFixed(1)}L</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Total Spend</p>
          <p className="font-display font-800 text-2xl text-text-primary">₹{(totalCost / 1000).toFixed(1)}K</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Avg ₹/Liter</p>
          <p className="font-display font-800 text-2xl text-text-primary">₹{totalLiters > 0 ? (totalCost / totalLiters).toFixed(1) : "—"}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <Select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)} className="max-w-xs">
          <option value="">All Vehicles</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </Select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {["Vehicle", "Date", "Liters", "Cost", "₹/Liter", "Odometer"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-mono text-text-secondary uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-text-muted font-mono text-xs">No fuel logs found</td></tr>
                ) : data.map((f) => (
                  <tr key={f.id} className="border-b border-surface-border/50 hover:bg-surface-hover/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono text-text-primary text-xs">{f.vehicle?.name}</p>
                      <p className="text-text-muted text-[10px]">{f.vehicle?.licensePlate}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-muted text-xs">{format(new Date(f.date), "dd/MM/yyyy")}</td>
                    <td className="py-3 px-4 font-mono text-brand text-xs">{f.liters}L</td>
                    <td className="py-3 px-4 font-mono text-text-primary text-xs">₹{Number(f.cost).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-xs">{f.pricePerL ? `₹${Number(f.pricePerL).toFixed(1)}` : "—"}</td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-xs">{f.odometer ? `${f.odometer.toLocaleString()} km` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Fuel Log">
        <div className="space-y-4">
          <Select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
            <option value="">Select vehicle...</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.licensePlate}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Liters" type="number" step="0.1" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} placeholder="45" />
            <Input label="Total Cost (₹)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="4275" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Odometer Reading" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="12300" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreate} loading={saving} className="flex-1">Add Fuel Log</Button>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
