import { Link } from "react-router-dom";
import { MapPin, Package, ShoppingCart } from "lucide-react";
import { Card } from "../../components/ui/Card";

const cards = [
  { to: "/cliente/carrito", title: "Carrito", desc: "Revisa tus productos", icon: ShoppingCart },
  { to: "/cliente/pedidos", title: "Pedidos", desc: "Historial de compras", icon: Package },
  { to: "/cliente/direcciones", title: "Direcciones", desc: "Envíos y facturación", icon: MapPin }
];

export function DashboardClientePage() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Bienvenido</h2>
      <p className="mt-1 text-slate-600">Gestiona tus compras en un solo lugar.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ to, title, desc, icon: Icon }) => (
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
