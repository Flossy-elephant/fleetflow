import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Fuel, BarChart3, LogOut, Zap, ShieldCheck
} from "lucide-react";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

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

      {/* User */}
      <div className="px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center">
            <ShieldCheck size={14} className="text-brand" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-mono text-text-primary truncate">{user?.name}</p>
            <p className="text-[10px] font-mono text-brand tracking-widest uppercase">{user?.role}</p>
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
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
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

      {/* Logout */}
      <div className="p-3 border-t border-surface-border">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-red-400 hover:bg-red-400/5 transition-all w-full">
          <LogOut size={16} />
          <span className="font-display font-600 tracking-wide uppercase text-xs">Logout</span>
        </button>
      </div>
    </aside>
  );
}
