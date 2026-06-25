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
import { Link } from 'react-router-dom';

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
    { label: "Tiendas totales", value: t?.total, icon: Store },
    { label: "Productos totales", value: p?.total, icon: Package },
    { label: "Pedidos totales", value: ped?.total, icon: ShoppingCart },
    { label: "Ingresos totales", value: `$${Number(ped?.montoTotal || 0).toLocaleString("es-CO")}`, icon: BarChart3 },
    { label: "Ganancia total", value: `$${Number(ped?.gananciaTotal || 0).toLocaleString("es-CO")}`, icon: BarChart3 },
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
          <Card key={label} className="p-4 flex flex-col items-start">
            <Icon className="h-8 w-8 text-brand-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{value ?? "—"}</p>
          </Card>
        ))}
      </div>

      {/* Productos Más Vendidos */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Productos Más Vendidos (Top 5)</h2>
          {p?.topVendidos && p.topVendidos.length > 0 ? (
            <ul className="list-disc pl-5">
              {p.topVendidos.map((productName, index) => (
                <li key={index} className="text-gray-600">{productName}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay productos más vendidos para mostrar.</p>
          )}
      </div>

      {/* Navegación a Páginas de Gestión */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Gestión</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ManagementLink to="/admin/productos" title="Gestión de Productos" />
          <ManagementLink to="/admin/tiendas" title="Gestión de Tiendas" />
          <ManagementLink to="/admin/reportes?tab=pedidos" title="Gestión de Pedidos" />
          <ManagementLink to="/admin/reportes?tab=compras" title="Gestión de Compras a Proveedores" />
          <ManagementLink to="/admin/usuarios" title="Gestión de Usuarios" />
          <ManagementLink to="/admin/config" title="Gestión de Categorías" />
        </div>
      </div>
    </div>
  );
}

// Componente de Enlace de Gestión (reused and slightly adjusted to look like a Card)
function ManagementLink({ to, title }) {
  return (
    <Link to={to} className="block p-4 bg-white hover:bg-gray-50 rounded-lg shadow-md text-center transition duration-200">
      <p className="text-lg font-semibold text-indigo-600">{title}</p>
    </Link>
  );
}