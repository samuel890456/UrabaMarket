import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "../../utils/cn";
import { LogOut, Store } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuthStore } from "../../store/authStore";

export function AppShell({ navItems, title }) {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col border-r border-slate-200 bg-white shadow-soft lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
            <p className="text-sm font-semibold text-ink">UrabaMarket</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/cliente" || to === "/vendedor" || to === "/proveedor" || to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-800",
                  isActive && "bg-brand-50 text-brand-800 shadow-sm"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0 opacity-80" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <p className="text-xs font-medium text-brand-700">{user?.rol}</p>
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:px-8">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          <Link to="/" className="text-sm text-slate-500 hover:text-brand-700 lg:hidden">
            Ir al sitio
          </Link>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2 lg:hidden">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
                  isActive ? "bg-brand-50 text-brand-800" : "text-slate-600"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
