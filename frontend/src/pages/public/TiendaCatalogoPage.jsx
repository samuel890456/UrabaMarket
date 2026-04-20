import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getProductosByTienda, getTienda } from "../../services/api/catalog.api";
import { CardProducto } from "../../components/product/CardProducto";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { Package } from "lucide-react";

export function TiendaCatalogoPage() {
  const { idTienda } = useParams();

  const { data: tienda } = useQuery({
    queryKey: ["tienda", idTienda],
    queryFn: () => getTienda(idTienda)
  });

  const { data: productos, isLoading } = useQuery({
    queryKey: ["productos", "tienda", idTienda],
    queryFn: () => getProductosByTienda(idTienda)
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/tiendas" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" />
        Todas las tiendas
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-ink">{tienda?.nombre || `Tienda #${idTienda}`}</h1>
      <p className="mt-2 text-slate-600">{tienda?.descripcion || "Productos de esta tienda"}</p>

      {isLoading ? (
        <Loader className="mt-12" />
      ) : !productos?.length ? (
        <EmptyState
          className="mt-12"
          icon={Package}
          title="Sin productos"
          description="Esta tienda aún no publica productos."
        />
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((p) => (
            <CardProducto key={p.idProducto} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
