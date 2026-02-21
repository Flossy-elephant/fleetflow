import { useEffect, useState } from "react";
import { drivers as driversApi } from "../api";
import { Card, StatusPill, Button, Modal, Input, Select, ErrorBanner, PageHeader, LoadingSpinner } from "../components/ui";
import { Plus, Trophy, Star } from "lucide-react";
import { format } from "date-fns";

const emptyForm = { name: "", licenseNumber: "", licenseExpiry: "", phone: "", status: "ON_DUTY", safetyScore: 100 };

export default function Drivers() {
  const [data, setData] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [rankModal, setRankModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([driversApi.list(), driversApi.rankings()])
      .then(([d, r]) => { setData(d.data); setRankings(r.data); })
      .catch((e) => setError(e.response?.data?.error || "Failed to load drivers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name, licenseNumber: d.licenseNumber, licenseExpiry: d.licenseExpiry?.slice(0, 10), phone: d.phone || "", status: d.status, safetyScore: d.safetyScore });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editing) await driversApi.update(editing.id, { ...form, safetyScore: Number(form.safetyScore) });
      else await driversApi.create({ ...form, safetyScore: Number(form.safetyScore) });
      setModal(false); load();
    } catch (e) {
      setError(e.response?.data?.error || "Save failed");
    } finally { setSaving(false); }
  };

  const isExpired = (d) => new Date(d.licenseExpiry) < new Date();
  const rankColor = (rank) => rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-orange-400" : "text-text-muted";

  return (
    <div className="fade-in">
      <PageHeader
        title="Driver Management"
        subtitle="Monitor compliance, performance & safety scores"
        actions={
          <>
            <Button variant="secondary" onClick={() => setRankModal(true)}><Trophy size={14} />Rankings</Button>
            <Button onClick={openCreate}><Plus size={14} />Add Driver</Button>
          </>
        }
      />

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {/* Top 3 Leaderboard */}
      {rankings.slice(0, 3).length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {rankings.slice(0, 3).map((d) => (
            <Card key={d.id} className="relative overflow-hidden">
              <div className="absolute top-3 right-3 text-2xl font-display font-800">{d.rank === 1 ? "🥇" : d.rank === 2 ? "🥈" : "🥉"}</div>
              <div className={`text-xs font-mono font-700 mb-1 ${rankColor(d.rank)}`}>#{d.rank} DRIVER</div>
              <p className="font-display font-700 text-sm text-text-primary">{d.name}</p>
              <p className="font-mono text-xl font-700 text-brand mt-1">{d.rankingScore}</p>
              <p className="text-[10px] font-mono text-text-muted">pts</p>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] font-mono">
                <div><span className="text-text-muted">Completion </span><span className="text-text-primary">{d.completionRate}%</span></div>
                <div><span className="text-text-muted">Safety </span><span className="text-text-primary">{d.safetyScore}</span></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {["Driver", "License", "Expiry", "Trips", "Safety Score", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-mono text-text-secondary uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.id} className={`border-b border-surface-border/50 hover:bg-surface-hover/30 transition-colors ${isExpired(d) ? "bg-red-500/5" : ""}`}>
                    <td className="py-3 px-4">
                      <p className="text-text-primary text-xs font-mono">{d.name}</p>
                      {d.phone && <p className="text-text-muted text-[10px]">{d.phone}</p>}
                    </td>
                    <td className="py-3 px-4 font-mono text-brand text-xs">{d.licenseNumber}</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono text-xs ${isExpired(d) ? "text-red-400 font-700" : "text-text-secondary"}`}>
                        {d.licenseExpiry ? format(new Date(d.licenseExpiry), "dd/MM/yyyy") : "—"}
                        {isExpired(d) && " ⚠️"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-primary text-xs">{d.completedTrips}/{d.totalTrips}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-border rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${d.safetyScore >= 90 ? "bg-emerald-500" : d.safetyScore >= 70 ? "bg-brand" : "bg-red-500"}`} style={{ width: `${d.safetyScore}%` }} />
                        </div>
                        <span className="font-mono text-xs text-text-primary">{d.safetyScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4"><StatusPill status={d.status} /></td>
                    <td className="py-3 px-4">
                      <button onClick={() => openEdit(d)} className="text-xs font-mono text-text-secondary hover:text-brand transition-colors">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Driver" : "New Driver"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rajesh Kumar" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <Input label="License Number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} placeholder="MH0120190012345" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="License Expiry" type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
            <Input label="Safety Score (0-100)" type="number" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
          </div>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {["ON_DUTY", "OFF_DUTY", "SUSPENDED"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? "Update Driver" : "Add Driver"}</Button>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Full Rankings Modal */}
      <Modal open={rankModal} onClose={() => setRankModal(false)} title="Driver Performance Rankings">
        <div className="space-y-2">
          {rankings.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-800 ${d.rank <= 3 ? "bg-brand/20 text-brand" : "bg-surface-border text-text-muted"}`}>
                {d.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-xs font-mono">{d.name}</p>
                <div className="flex gap-3 text-[10px] font-mono text-text-muted mt-0.5">
                  <span>Completion: {d.completionRate}%</span>
                  <span>Safety: {d.safetyScore}</span>
                  <span>On-time: {d.onTimeRate}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-800 text-brand text-base">{d.rankingScore}</p>
                <p className="text-[10px] font-mono text-text-muted">pts</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
