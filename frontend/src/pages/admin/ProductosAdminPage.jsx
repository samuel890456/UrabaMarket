import { useQuery } from "@tanstack/react-query";
import { getProductosAdmin } from "../../services/api/admin.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";

export function ProductosAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-productos"],
    queryFn: () => getProductosAdmin({ limit: 50, page: 1 })
  });

  if (isLoading) return <Loader />;

  const items = data?.items ?? [];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Moderación de productos</h2>
      <p className="mt-1 text-slate-600">Vista global del catálogo</p>
      <div className="mt-6 space-y-2">
        {items.map((p) => (
          <Card key={p.idProducto} padding="sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-medium">{p.nombre}</span>
              <span className="text-sm text-brand-700">${Number(p.precio).toLocaleString("es-CO")}</span>
            </div>
            <p className="text-xs text-slate-400">Stock {p.stock} · {p.activo ? "Activo" : "Inactivo"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
