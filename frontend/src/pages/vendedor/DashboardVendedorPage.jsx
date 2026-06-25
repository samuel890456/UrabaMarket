import { Link } from "react-router-dom";
import { Store, ShoppingBag, BarChart3, Boxes, Truck } from "lucide-react";
import { Card } from "../../components/ui/Card";

const links = [
  { to: "/vendedor/tienda", title: "Mi tienda", desc: "Datos del negocio", icon: Store },
  { to: "/vendedor/productos", title: "Productos", desc: "Catálogo e inventario", icon: ShoppingBag },
  { to: "/vendedor/abastecimiento", title: "Abastecimiento", desc: "Compra a proveedores", icon: Truck },
  { to: "/vendedor/inventario", title: "Alertas", desc: "Stock y vencimientos", icon: Boxes },
  { to: "/vendedor/ventas", title: "Ventas", desc: "Pedidos con tu tienda", icon: BarChart3 }
];

export function DashboardVendedorPage() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Panel vendedor</h2>
      <p className="mt-1 text-slate-600">Administra tu tienda y tus ventas.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {links.map(({ to, title, desc, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-transform hover:-translate-y-0.5">
              <Icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-3 font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
