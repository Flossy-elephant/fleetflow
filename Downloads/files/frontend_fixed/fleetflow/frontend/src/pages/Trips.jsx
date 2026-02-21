import { useEffect, useState } from "react";
import { trips as tripsApi, vehicles as vehiclesApi, drivers as driversApi } from "../api";
import { Card, StatusPill, Button, Modal, Input, Select, ErrorBanner, PageHeader, LoadingSpinner } from "../components/ui";
import { Plus } from "lucide-react";
import { format } from "date-fns";

const emptyForm = { vehicleId: "", driverId: "", cargoWeight: "", distanceKm: "", revenue: "", origin: "", destination: "", notes: "" };
const emptyComplete = { endOdometer: "", distanceKm: "", revenue: "" };

export default function Trips() {
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [completeForm, setCompleteForm] = useState(emptyComplete);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      tripsApi.list(),
      vehiclesApi.list(),
      driversApi.list(),
    ])
      .then(([t, v, d]) => {
        setData(t.data);
        setVehicles(v.data.filter(v => v.status === "AVAILABLE"));
        setDrivers(d.data.filter(d => d.status === "ON_DUTY"));
      })
      .catch((e) => setError(e.response?.data?.error || "Failed to load trips"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredData = filterStatus
    ? data.filter(t => t.status === filterStatus)
    : data;

  const handleDispatch = async () => {
    setSaving(true);
    setError("");
    try {
      await tripsApi.create({
        ...form,
        cargoWeight: Number(form.cargoWeight),
        distanceKm: Number(form.distanceKm),
        revenue: Number(form.revenue),
      });
      setModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || "Dispatch failed");
    } finally { setSaving(false); }
  };

  const handleComplete = async () => {
    setSaving(true);
    setError("");
    try {
      await tripsApi.complete(completeModal.id, {
        endOdometer: Number(completeForm.endOdometer),
        distanceKm: Number(completeForm.distanceKm),
        revenue: Number(completeForm.revenue),
      });
      setCompleteModal(null);
      load();
    } catch (e) {
      setError(e.response?.data?.error || "Completion failed");
    } finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this trip?")) return;
    try { await tripsApi.cancel(id); load(); }
    catch (e) { setError(e.response?.data?.error || "Cancel failed"); }
  };

  const formatDate = (val) => {
    if (!val) return "—";
    try { return format(new Date(val), "dd/MM/yy"); }
    catch { return "—"; }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Trip Dispatcher"
        subtitle="Create, track and manage all deliveries"
        actions={
          <Button onClick={() => { setForm(emptyForm); setError(""); setModal(true); }}>
            <Plus size={14} />Dispatch Trip
          </Button>
        }
      />

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["", "DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              filterStatus === s
                ? "bg-brand text-white"
                : "bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary"
            }`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {["ID", "Vehicle", "Driver", "Route", "Cargo", "Revenue", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-mono text-text-secondary uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-text-muted font-mono text-xs">No trips found</td></tr>
                ) : filteredData.map((t) => (
                  <tr key={t.id} className="border-b border-surface-border/50 hover:bg-surface-hover/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-brand text-xs">#{String(t.id).padStart(4, "0")}</td>
                    <td className="py-3 px-4 text-text-primary text-xs font-mono">{t.vehicleName || t.vehicle?.name || "—"}</td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{t.driverName || t.driver?.name || "—"}</td>
                    <td className="py-3 px-4">
                      <div className="text-text-secondary text-[10px] font-mono">{t.origin || "—"}</div>
                      <div className="text-text-primary text-[10px] font-mono">→ {t.destination || "—"}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-primary text-xs">{t.cargoWeight}kg</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 text-xs">₹{Number(t.revenue || 0).toLocaleString()}</td>
                    <td className="py-3 px-4"><StatusPill status={t.status} /></td>
                    <td className="py-3 px-4 font-mono text-text-muted text-xs">{formatDate(t.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {t.status === "DISPATCHED" && (
                          <>
                            <button
                              onClick={() => {
                                setCompleteForm({ endOdometer: "", distanceKm: t.distanceKm, revenue: t.revenue });
                                setCompleteModal(t);
                              }}
                              className="text-xs font-mono text-emerald-400 hover:text-emerald-300">
                              Complete
                            </button>
                            <button onClick={() => handleCancel(t.id)} className="text-xs font-mono text-red-400 hover:text-red-300">Cancel</button>
                          </>
                        )}
                        {t.status === "DRAFT" && (
                          <button onClick={() => handleCancel(t.id)} className="text-xs font-mono text-red-400 hover:text-red-300">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Dispatch Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Dispatch New Trip">
        <div className="space-y-4">
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.maxCapacity}kg)</option>
              ))}
            </Select>
            <Select label="Driver" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
              <option value="">Select driver...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>
          <Input label="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Mumbai Central Depot" />
          <Input label="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Pune Distribution Hub" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Cargo Weight (kg)" type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} placeholder="450" />
            <Input label="Distance (km)" type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} placeholder="120" />
            <Input label="Revenue (₹)" type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} placeholder="8500" />
          </div>
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." />
          <div className="bg-surface-hover border border-surface-border rounded-lg p-3 text-xs font-mono text-text-secondary">
            <p className="text-text-muted mb-1">VALIDATION CHECKS</p>
            <p>✓ Vehicle must be Available · Driver must be On Duty</p>
            <p>✓ Cargo weight must not exceed vehicle max capacity</p>
            <p>✓ Driver license must be valid and not expired</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleDispatch} loading={saving} className="flex-1">🚛 Dispatch Now</Button>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Trip">
        <div className="space-y-4">
          {completeModal && (
            <div className="bg-surface-hover rounded-lg p-3 text-xs font-mono text-text-secondary">
              <p className="text-text-primary font-700">
                {completeModal.vehicleName || completeModal.vehicle?.name} → {completeModal.driverName || completeModal.driver?.name}
              </p>
              <p className="text-text-muted mt-0.5">{completeModal.origin} → {completeModal.destination}</p>
            </div>
          )}
          <Input label="End Odometer (km)" type="number" value={completeForm.endOdometer} onChange={(e) => setCompleteForm({ ...completeForm, endOdometer: e.target.value })} placeholder="45200" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Final Distance (km)" type="number" value={completeForm.distanceKm} onChange={(e) => setCompleteForm({ ...completeForm, distanceKm: e.target.value })} />
            <Input label="Final Revenue (₹)" type="number" value={completeForm.revenue} onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleComplete} loading={saving} className="flex-1">✓ Mark Completed</Button>
            <Button variant="secondary" onClick={() => setCompleteModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}