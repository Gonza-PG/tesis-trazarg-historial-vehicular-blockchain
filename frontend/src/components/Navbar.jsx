import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Search, ShieldCheck, LayoutDashboard, Car, Wrench } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { shorten } from "../lib/format";

export default function Navbar() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ShieldCheck className="text-brand-500" size={22} />
          <span>Historial 0km</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/consulta" icon={<Search size={16} />} label="Consulta publica" />
          {session && (
            <>
              <NavItem to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
              <NavItem to="/vehiculos" icon={<Car size={16} />} label="Vehiculos" />
              <NavItem to="/servicios/nuevo" icon={<Wrench size={16} />} label="Cargar service" />
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium">{session.nombre}</span>
                <span className="text-xs text-slate-500 font-mono">
                  {shorten(session.walletAddress)}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn-secondary"
                title="Cerrar sesion"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
          isActive
            ? "bg-brand-50 text-brand-700 font-medium"
            : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
