import { Link, NavLink } from "react-router-dom";
import { Menu, Store, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";

const links = [
  { to: "/tiendas", label: "Tiendas" },
  { to: "/productos", label: "Productos" }
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { token, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Store className="h-5 w-5" />
          </span>
          <span>UrabaMarket</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700",
                  isActive && "bg-brand-50 text-brand-800"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {token && user ? (
            <>
              <Link to={homeForRole(user.rol)}>
                <Button variant="ghost" size="sm">
                  Panel
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Ingresar
                </Button>
              </Link>
              <Link to="/registro">
                <Button size="sm">Crear cuenta</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            {token && user ? (
              <>
                <Link to={homeForRole(user.rol)} onClick={() => setOpen(false)}>
                  Panel
                </Link>
                <button type="button" className="text-left text-sm" onClick={() => { logout(); setOpen(false); }}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  Ingresar
                </Link>
                <Link to="/registro" onClick={() => setOpen(false)}>
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function homeForRole(rol) {
  const m = {
    Cliente: "/cliente",
    Vendedor: "/vendedor",
    Proveedor: "/proveedor",
    Administrador: "/admin"
  };
  return m[rol] || "/";
}
