import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, Truck } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { getComprasMiProveedor, getMisProductosMayoristas } from "../../services/api/proveedor.api";

export function DashboardProveedorPage() {
  const { data: compras } = useQuery({ queryKey: ["compras-proveedor"], queryFn: getComprasMiProveedor });
  const { data: productos } = useQuery({
    queryKey: ["proveedor-productos-mayoristas-dashboard"],
    queryFn: () => getMisProductosMayoristas({ limit: 100 })
  });

  const pedidos = compras ?? [];
  const catalogo = productos?.items ?? [];
  const pendientes = pedidos.filter((p) => p.estado === "Pendiente").length;
  const ventasB2B = pedidos.reduce((sum, p) => sum + Number(p.total || 0), 0);

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold text-ink">Panel proveedor</h2>
      <p className="mt-1 text-slate-600">Gestiona pedidos mayoristas a tiendas.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <Package className="h-7 w-7 text-brand-600" />
          <p className="mt-3 text-sm text-slate-500">Productos mayoristas</p>
          <p className="text-2xl font-bold text-ink">{catalogo.length}</p>
        </Card>
        <Card>
          <Truck className="h-7 w-7 text-brand-600" />
          <p className="mt-3 text-sm text-slate-500">Solicitudes pendientes</p>
          <p className="text-2xl font-bold text-ink">{pendientes}</p>
        </Card>
        <Card>
          <ShoppingBag className="h-7 w-7 text-brand-600" />
          <p className="mt-3 text-sm text-slate-500">Ventas B2B</p>
          <p className="text-2xl font-bold text-ink">${ventasB2B.toLocaleString("es-CO")}</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
      <Link to="/proveedor/catalogo" className="block">
        <Card className="transition-transform hover:-translate-y-0.5">
          <Package className="h-8 w-8 text-brand-600" />
          <h3 className="mt-3 font-semibold text-ink">Catálogo mayorista</h3>
          <p className="mt-1 text-sm text-slate-500">Crea productos, define precio mayorista, IVA y stock.</p>
        </Card>
      </Link>
      <Link to="/proveedor/compras-b2b" className="block">
        <Card className="transition-transform hover:-translate-y-0.5">
          <Truck className="h-8 w-8 text-brand-600" />
          <h3 className="mt-3 font-semibold text-ink">Solicitudes B2B</h3>
          <p className="mt-1 text-sm text-slate-500">Pedidos de tiendas que compran a tu negocio</p>
        </Card>
      </Link>
      </div>
    </div>
  );
}
