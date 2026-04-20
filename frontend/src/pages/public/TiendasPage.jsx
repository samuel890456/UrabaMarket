import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Store } from "lucide-react";
import { getTiendas } from "../../services/api/catalog.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";

export function TiendasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tiendas"],
    queryFn: () => getTiendas({ limit: 24, page: 1 })
  });

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-ink">Tiendas en Urabá</h1>
      <p className="mt-2 text-slate-600">Descubre negocios locales verificados en la plataforma.</p>
      {isLoading ? (
        <Loader className="mt-12" />
      ) : items.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon={Store}
          title="No hay tiendas"
          description="Aún no hay tiendas activas en esta vista."
        />
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <Link key={t.idTienda} to={`/tiendas/${t.idTienda}/catalogo`}>
              <Card className="h-full transition-transform hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
                    <Store className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-ink">{t.nombre}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{t.descripcion || "Sin descripción"}</p>
                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-brand-700">
                      <MapPin className="h-3.5 w-3.5" />
                      Ver productos
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
