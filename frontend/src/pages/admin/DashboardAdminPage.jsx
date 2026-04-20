import { useQuery } from "@tanstack/react-query";
import { getEstadisticas } from "../../services/api/admin.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Store,
  Users
} from "lucide-react";

export function DashboardAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-estadisticas"],
    queryFn: getEstadisticas
  });

  if (isLoading) return <Loader />;

  const u = data?.usuarios?.porRol;
  const t = data?.tiendas;
  const p = data?.productos;
  const ped = data?.pedidos;
  const b2b = data?.comprasProveedor;

  const tiles = [
    { label: "Usuarios totales", value: data?.usuarios?.total, icon: Users },
    { label: "Tiendas activas", value: t?.activas, icon: Store },
    { label: "Productos activos", value: p?.activos, icon: Package },
    { label: "Pedidos", value: ped?.total, icon: ShoppingCart },
    { label: "Ventas pedidos", value: `$${Number(ped?.montoTotal || 0).toLocaleString("es-CO")}`, icon: BarChart3 },
    { label: "Compras B2B", value: b2b?.total, icon: BarChart3 }
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Dashboard general</h2>
      <p className="mt-1 text-slate-600">Resumen operativo de UrabaMarket</p>
      {u ? (
        <p className="mt-4 text-sm text-slate-500">
          Clientes: {u.Cliente} · Vendedores: {u.Vendedor} · Proveedores: {u.Proveedor} · Admins:{" "}
          {u.Administrador}
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <Icon className="h-8 w-8 text-brand-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{value ?? "—"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
