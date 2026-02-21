import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, Truck, AlertTriangle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("manager@fleetflow.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#F97316 1px, transparent 1px), linear-gradient(90deg, #F97316 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand rounded-2xl mb-4 shadow-lg shadow-brand/30">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="font-display font-800 text-3xl uppercase tracking-widest text-text-primary">FleetFlow</h1>
          <p className="text-text-secondary text-xs font-mono tracking-widest mt-1 uppercase">Fleet Intelligence System</p>
        </div>

        {/* Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-2xl">
          <h2 className="font-display font-700 text-sm uppercase tracking-widest text-text-secondary mb-6">Sign In to Command Center</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-widest">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand transition-colors"
                placeholder="you@fleetflow.com"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-widest">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-display font-700 text-sm uppercase tracking-widest py-3 rounded-lg transition-all duration-150 disabled:opacity-50 mt-2 shadow-lg shadow-brand/20"
            >
              {loading ? "Authenticating..." : "Enter Command Center →"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-5 border-t border-surface-border">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">Demo Credentials</p>
            <div className="space-y-1.5">
              {[
                { role: "Manager", email: "manager@fleetflow.com" },
                { role: "Dispatcher", email: "dispatcher@fleetflow.com" },
              ].map(({ role, email: e }) => (
                <button key={role} onClick={() => { setEmail(e); setPassword("password123"); }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-surface-hover hover:bg-surface-border transition-colors group">
                  <span className="text-xs font-mono text-brand mr-2">[{role}]</span>
                  <span className="text-xs font-mono text-text-secondary group-hover:text-text-primary transition-colors">{e}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-text-muted text-[10px] font-mono mt-6 uppercase tracking-widest">
          FleetFlow v1.0 · Built for Hackathon 2024
        </p>
      </div>
    </div>
  );
}
