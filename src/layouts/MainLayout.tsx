import {
  Fuel,
  Gauge,
  Menu,
  ReceiptText,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  {
    label: "Resumen",
    path: "/resumen",
    icon: Gauge,
  },
  {
    label: "Combustible",
    path: "/combustible",
    icon: Fuel,
  },
  {
    label: "Gastos",
    path: "/gastos",
    icon: ReceiptText,
  },
  {
    label: "Mantenimiento",
    path: "/mantenimiento",
    icon: Wrench,
  },
];

export function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <div className="brand">
            <div className="brand__icon">
              <Gauge size={26} />
            </div>

            <div>
              <strong>Control Auto</strong>
              <span>Gestión del vehículo</span>
            </div>
          </div>

          <button
            className="icon-button sidebar__close"
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `navigation__link ${
                  isActive ? "navigation__link--active" : ""
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="navigation__link sidebar__settings">
          <Settings size={20} />
          <span>Configuración</span>
        </button>

        <p><small className="developed">Desarrollado por Jorge Toso ®</small></p>
      </aside>

      {menuOpen && (
        <button
          className="sidebar-overlay"
          onClick={closeMenu}
          aria-label="Cerrar menú"
        />
      )}

      <main className="main-content">
        <header className="mobile-header">
          <button
            className="icon-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          <strong>Control Auto</strong>
        </header>

        <Outlet />
      </main>
    </div>
  );
}