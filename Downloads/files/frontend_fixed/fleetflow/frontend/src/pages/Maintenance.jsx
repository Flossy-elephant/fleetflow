import { useEffect, useState } from "react";
import { maintenance as maintApi, vehicles as vehiclesApi } from "../api";
import { Card, StatusPill, Button, Modal, Input, Select, ErrorBanner, PageHeader, LoadingSpinner } from "../components/ui";
import { Plus, Wrench } from "lucide-react";
import { format } from "date-fns";

export default function Maintenance() {
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", description: "", cost: "", date: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([maintApi.list(), vehiclesApi.list()])
      .then(([m, v]) => { setData(m.data); setVehicles(v.data.filter((v) => v.status !== "RETIRED" && v.status !== "ON_TRIP")); })
      .catch((e) => setError(e.response?.data?.error || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      await maintApi.create({ ...form, cost: Number(form.cost) });
      setModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to create log");
    } finally { setSaving(false); }
  };

  const handleClose = async (id) => {
    if (!confirm("Mark maintenance as complete? Vehicle will be returned to Available.")) return;
    try { await maintApi.close(id); load(); } catch (e) { setError(e.response?.data?.error || "Failed to close"); }
  };

  const openCount = data.filter((d) => d.status === "OPEN").length;

  return (
    <div className="fade-in">
      <PageHeader
        title="Maintenance & Service"
        subtitle="Track vehicle health and service history"
        actions={<Button onClick={() => { setForm({ vehicleId: "", description: "", cost: "", date: "" }); setModal(true); }}><Plus size={14} />Log Service</Button>}
      />

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {openCount > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="w-9 h-9 bg-red-500/20 rounded-lg flex items-center justify-center">
            <Wrench size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-display font-700 text-sm text-red-300">{openCount} vehicle{openCount > 1 ? "s" : ""} currently in maintenance</p>
            <p className="text-red-400/70 text-xs font-mono">These vehicles are unavailable for dispatch</p>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {["Vehicle", "Description", "Cost", "Date", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-mono text-text-secondary uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-text-muted font-mono text-xs">No maintenance logs found</td></tr>
                ) : data.map((m) => (
                  <tr key={m.id} className="border-b border-surface-border/50 hover:bg-surface-hover/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono text-text-primary text-xs">{m.vehicle?.name}</p>
                      <p className="text-text-muted text-[10px]">{m.vehicle?.licensePlate}</p>
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs max-w-64">{m.description}</td>
                    <td className="py-3 px-4 font-mono text-text-primary text-xs">₹{Number(m.cost).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-text-muted text-xs">{format(new Date(m.date), "dd/MM/yyyy")}</td>
                    <td className="py-3 px-4"><StatusPill status={m.status} /></td>
                    <td className="py-3 px-4">
                      {m.status === "OPEN" && (
                        <button onClick={() => handleClose(m.id)} className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors">
                          Mark Done
                        </button>
                      )}
                      {m.status === "CLOSED" && <span className="text-[10px] font-mono text-text-muted">{format(new Date(m.closedAt), "dd/MM/yy")}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Log Maintenance">
        <div className="space-y-4">
          <div className="bg-surface-hover border border-surface-border rounded-lg p-3 text-xs font-mono text-text-secondary">
            <p className="text-brand">⚠ Auto-Logic</p>
            <p className="text-text-muted mt-0.5">Adding a maintenance log will automatically set the vehicle status to "In Shop" and remove it from the dispatch pool.</p>
          </div>
          <Select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
            <option value="">Select vehicle...</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.licensePlate} ({v.status})</option>)}
          </Select>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Engine oil change + filter replacement" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cost (₹)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="3500" />
            <Input label="Service Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreate} loading={saving} className="flex-1">Log & Send to Shop</Button>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
