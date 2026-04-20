import { useQuery } from "@tanstack/react-query";
import { getTiendasAdmin } from "../../services/api/admin.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";

export function TiendasAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-tiendas"],
    queryFn: () => getTiendasAdmin({ limit: 50, page: 1 })
  });

  if (isLoading) return <Loader />;

  const items = data?.items ?? [];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Tiendas</h2>
      <p className="mt-1 text-slate-600">Todas las tiendas del sistema</p>
      <div className="mt-6 space-y-2">
        {items.map((t) => (
          <Card key={t.idTienda} padding="sm">
            <p className="font-medium">{t.nombre}</p>
            <p className="text-sm text-slate-500">{t.descripcion || "—"}</p>
            <p className="mt-1 text-xs text-slate-400">{t.activo ? "Activa" : "Inactiva"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
