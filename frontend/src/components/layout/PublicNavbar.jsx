import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, ShoppingCart, Store, UserCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { cn } from "../../utils/cn";
import { hasRole, homeForUser, rolesOf } from "../../utils/rbac";
import { getCarrito } from "../../services/api/cliente.api";

const links = [
  { to: "/tiendas", label: "Tiendas" },
  { to: "/productos", label: "Productos" }
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const isCliente = token && hasRole(user, "Cliente");
  const roleLabel = rolesOf(user).join(" + ");
  const { data: carrito } = useQuery({
    queryKey: ["carrito"],
    queryFn: getCarrito,
    enabled: !!isCliente,
    refetchOnMount: "always",
    refetchOnWindowFocus: true
  });
  const cartCount = useCartStore((state) => state.count);
  const setCart = useCartStore((state) => state.setCart);
  const resetCart = useCartStore((state) => state.resetCart);

  useEffect(() => {
    if (isCliente) {
      setCart(carrito ?? { items: [] });
    } else {
      resetCart();
    }
  }, [carrito, isCliente, resetCart, setCart]);

  function submitSearch(event) {
    event.preventDefault();
    const term = q.trim();
    navigate(term ? `/productos?q=${encodeURIComponent(term)}` : "/productos");
    setOpen(false);
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Store className="h-5 w-5" />
          </span>
          <span className="hidden text-lg sm:inline">UrabaMarket</span>
        </Link>

        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:block">
          <div className="relative mx-auto max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Buscar productos, tiendas y marcas"
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm shadow-inner outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
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

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link
            to="/cliente/carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:text-brand-700"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-premium">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
          {token && user ? (
            <div className="relative">
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-sm font-medium text-ink shadow-sm hover:border-brand-300"
                onClick={() => setUserMenuOpen((value) => !value)}
              >
                <UserCircle className="h-5 w-5 text-slate-500" />
                <span className="max-w-28 truncate">{user.nombre || user.email}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user.nombre || "Usuario"}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <span className="mt-2 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{roleLabel}</span>
                  </div>
                  <Link
                    to={homeForUser(user)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Ir al panel
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Ingresar
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Crear cuenta</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Buscar productos"
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </form>
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
            <Link
              to="/cliente/carrito"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
              onClick={() => setOpen(false)}
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrito
              </span>
              {cartCount ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-premium">{cartCount}</span> : null}
            </Link>
            {token && user ? (
              <>
                <Link className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700" to={homeForUser(user)} onClick={() => setOpen(false)}>
                  Ir al panel
                </Link>
                <button type="button" className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  Ingresar
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
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
