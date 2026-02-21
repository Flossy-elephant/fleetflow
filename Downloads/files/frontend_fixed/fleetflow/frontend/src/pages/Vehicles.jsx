import { useEffect, useState } from "react";
import { vehicles as vehiclesApi } from "../api";
import { Card, StatusPill, Button, Modal, Input, Select, ErrorBanner, PageHeader, LoadingSpinner } from "../components/ui";
import { Plus, Truck, RefreshCw } from "lucide-react";

const VEHICLE_TYPES = ["TRUCK", "VAN", "BIKE", "CAR"];

const emptyForm = { name: "", licensePlate: "", make: "", model: "", type: "VAN", maxCapacity: "", odometer: "", acquisitionCost: "" };

export default function Vehicles() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [recommModal, setRecommModal] = useState(false);
  const [recommForm, setRecommForm] = useState({ cargo: "", distance: "" });
  const [recommendation, setRecommendation] = useState(null);
  const [recommLoading, setRecommLoading] = useState(false);

  const load = () => {
    setLoading(true);
    vehiclesApi.list(filterStatus ? { status: filterStatus } : {})
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.error || "Failed to load vehicles"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (v) => { setEditing(v); setForm({ name: v.name, licensePlate: v.licensePlate, make: v.make, model: v.model, type: v.type, maxCapacity: v.maxCapacity, odometer: v.odometer, acquisitionCost: v.acquisitionCost }); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editing) await vehiclesApi.update(editing.id, { ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost) });
      else await vehiclesApi.create({ ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost) });
      setModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRetire = async (id) => {
    if (!confirm("Retire this vehicle?")) return;
    try { await vehiclesApi.retire(id); load(); } catch (e) { setError(e.response?.data?.error || "Failed to retire vehicle"); }
  };

  const handleRecommend = async () => {
    setRecommLoading(true);
    setRecommendation(null);
    try {
      const r = await vehiclesApi.recommend({ cargo: recommForm.cargo, distance: recommForm.distance });
      setRecommendation(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "No suitable vehicle found");
    } finally {
      setRecommLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Vehicle Registry"
        subtitle="Manage your fleet assets"
        actions={
          <>
            <Button variant="secondary" onClick={() => { setRecommModal(true); setRecommendation(null); }}>Smart Recommend</Button>
            <Button onClick={openCreate}><Plus size={14} />Add Vehicle</Button>
          </>
        }
      />

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["", "AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${filterStatus === s ? "bg-brand text-white" : "bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary"}`}>
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
                  {["Vehicle", "License Plate", "Type", "Capacity", "Odometer", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-mono text-text-secondary uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-text-muted font-mono text-xs">No vehicles found</td></tr>
                ) : data.map((v) => (
                  <tr key={v.id} className="border-b border-surface-border/50 hover:bg-surface-hover/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-text-primary text-xs">{v.name}</div>
                      <div className="text-text-muted text-[10px]">{v.make} {v.model}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-brand text-xs">{v.licensePlate}</td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-xs">{v.type}</td>
                    <td className="py-3 px-4 font-mono text-text-primary text-xs">{v.maxCapacity} kg</td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-xs">{v.odometer?.toLocaleString()} km</td>
                    <td className="py-3 px-4"><StatusPill status={v.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(v)} className="text-xs font-mono text-text-secondary hover:text-brand transition-colors">Edit</button>
                        {v.status !== "RETIRED" && <button onClick={() => handleRetire(v.id)} className="text-xs font-mono text-text-secondary hover:text-red-400 transition-colors">Retire</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Vehicle" : "New Vehicle"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Vehicle Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Van-01" />
            <Input label="License Plate" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} placeholder="MH-12-AB-1234" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Tata" />
            <Input label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Ace" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input label="Max Capacity (kg)" type="number" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} placeholder="500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Odometer (km)" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="0" />
            <Input label="Acquisition Cost (₹)" type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} placeholder="800000" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? "Update Vehicle" : "Add Vehicle"}</Button>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Smart Recommend Modal */}
      <Modal open={recommModal} onClose={() => setRecommModal(false)} title="Smart Vehicle Recommendation">
        <div className="space-y-4">
          <p className="text-text-secondary text-xs font-mono">AI-powered dispatch recommendation based on cargo, distance, cost efficiency & maintenance health.</p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cargo Weight (kg)" type="number" value={recommForm.cargo} onChange={(e) => setRecommForm({ ...recommForm, cargo: e.target.value })} placeholder="450" />
            <Input label="Distance (km)" type="number" value={recommForm.distance} onChange={(e) => setRecommForm({ ...recommForm, distance: e.target.value })} placeholder="120" />
          </div>
          <Button onClick={handleRecommend} loading={recommLoading} className="w-full">Get Recommendation</Button>

          {recommendation && (
            <div className="bg-brand/10 border border-brand/30 rounded-xl p-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-display font-700 text-sm">{recommendation.score}</div>
                <div>
                  <p className="font-display font-700 text-sm text-text-primary">{recommendation.recommended.name}</p>
                  <p className="text-[10px] font-mono text-brand">RECOMMENDED · Score: {recommendation.score}/100</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary mb-3">{recommendation.reason}</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-surface-card rounded-lg p-2">
                  <p className="text-text-muted">License</p>
                  <p className="text-text-primary">{recommendation.recommended.licensePlate}</p>
                </div>
                <div className="bg-surface-card rounded-lg p-2">
                  <p className="text-text-muted">Capacity</p>
                  <p className="text-text-primary">{recommendation.recommended.maxCapacity}kg</p>
                </div>
              </div>
              {recommendation.alternatives?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-brand/20">
                  <p className="text-[10px] font-mono text-text-muted mb-2">ALTERNATIVES</p>
                  {recommendation.alternatives.map((a) => (
                    <div key={a.vehicle.id} className="flex justify-between text-xs font-mono py-1">
                      <span className="text-text-secondary">{a.vehicle.name}</span>
                      <span className="text-text-muted">Score: {a.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
