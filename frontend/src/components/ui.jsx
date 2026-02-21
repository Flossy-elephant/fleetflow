import { Loader2, AlertTriangle, X, ChevronDown } from "lucide-react";
import { useState } from "react";

export function StatusPill({ status }) {
  const labels = {
    AVAILABLE: "Available", ON_DUTY: "On Duty", ON_TRIP: "On Trip",
    IN_SHOP: "In Shop", RETIRED: "Retired", OFF_DUTY: "Off Duty",
    SUSPENDED: "Suspended", DISPATCHED: "Dispatched", COMPLETED: "Completed",
    CANCELLED: "Cancelled", DRAFT: "Draft", OPEN: "Open", CLOSED: "Closed",
  };
  return <span className={`status-pill status-${status}`}>{labels[status] || status}</span>;
}

export function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-text-secondary">
      <Loader2 size={20} className="animate-spin text-brand" />
      <span className="font-mono text-sm">{text}</span>
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
      <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
      <p className="text-red-300 text-sm flex-1">{message}</p>
      {onDismiss && <button onClick={onDismiss} className="text-red-400 hover:text-red-200"><X size={16} /></button>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`bg-surface-card border border-surface-border rounded-xl p-5 ${className}`}>{children}</div>;
}

export function Button({ children, variant = "primary", size = "md", className = "", loading = false, ...props }) {
  const base = "inline-flex items-center gap-2 font-display font-700 tracking-wide rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand hover:bg-brand-dark text-white",
    secondary: "bg-surface-hover hover:bg-surface-border text-text-primary border border-surface-border",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}{children}
    </button>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-widest">{label}</label>}
      <input className={`w-full bg-surface border ${error ? "border-red-500/50" : "border-surface-border"} rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand transition-colors`} {...props} />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase tracking-widest">{label}</label>}
      <div className="relative">
        <select className="w-full appearance-none bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors pr-8" {...props}>{children}</select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <h2 className="font-display font-700 text-lg uppercase tracking-wider text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon, color = "brand" }) {
  const colors = { brand: "text-brand bg-brand/10", green: "text-emerald-400 bg-emerald-400/10", red: "text-red-400 bg-red-400/10", blue: "text-blue-400 bg-blue-400/10", purple: "text-purple-400 bg-purple-400/10" };
  return (
    <Card className="flex items-center gap-4">
      {Icon && <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={22} /></div>}
      <div className="min-w-0">
        <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-display font-700 text-text-primary">{value}</p>
        {sub && <p className="text-xs text-text-secondary truncate">{sub}</p>}
      </div>
    </Card>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display font-800 text-2xl uppercase tracking-wider text-text-primary">{title}</h1>
        {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Table({ columns, data, emptyMessage = "No data found" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((c) => (
              <th key={c.key} className="text-left py-3 px-4 text-xs font-mono text-text-secondary uppercase tracking-widest whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-text-muted font-mono text-sm">{emptyMessage}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className="py-3 px-4 text-text-primary whitespace-nowrap">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
