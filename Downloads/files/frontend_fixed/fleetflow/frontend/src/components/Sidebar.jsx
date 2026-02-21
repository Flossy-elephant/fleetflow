import { NavLink } from "react-router-dom";
import { LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, Zap } from "lucide-react";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/vehicles", icon: Truck, label: "Vehicles" },
  { to: "/drivers", icon: Users, label: "Drivers" },
  { to: "/trips", icon: Route, label: "Trips" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/fuel", icon: Fuel, label: "Fuel Logs" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-surface-card border-r border-surface-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display font-700 text-base tracking-widest uppercase text-text-primary leading-none">FleetFlow</p>
            <p className="text-[10px] font-mono text-text-secondary tracking-widest mt-0.5">INTELLIGENCE SYSTEM</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-brand/15 text-brand border border-brand/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`
            }
          >
            <Icon size={16} />
            <span className="font-display font-600 tracking-wide uppercase text-xs">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-border">
        <p className="text-[10px] font-mono text-text-muted text-center uppercase tracking-widest">FleetFlow v1.0</p>
      </div>
    </aside>
  );
}
