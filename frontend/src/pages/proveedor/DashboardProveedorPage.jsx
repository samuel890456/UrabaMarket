import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import { Card } from "../../components/ui/Card";

export function DashboardProveedorPage() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Panel proveedor</h2>
      <p className="mt-1 text-slate-600">Gestiona pedidos mayoristas a tiendas.</p>
      <Link to="/proveedor/compras-b2b" className="mt-8 block max-w-md">
        <Card className="transition-transform hover:-translate-y-0.5">
          <Truck className="h-8 w-8 text-brand-600" />
          <h3 className="mt-3 font-semibold text-ink">Solicitudes B2B</h3>
          <p className="mt-1 text-sm text-slate-500">Pedidos de tiendas que compran a tu negocio</p>
        </Card>
      </Link>
    </div>
  );
}
