import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getProductos } from "../../services/api/catalog.api";
import { CardProducto } from "../../components/product/CardProducto";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { Package } from "lucide-react";
import { useState } from "react";

export function ProductosPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const page = Number(params.get("page") || 1);

  const { data, isLoading } = useQuery({
    queryKey: ["productos", "buscar", q, page, params.get("idCategoria")],
    queryFn: () =>
      getProductos({
        q: q || undefined,
        page,
        limit: 24,
        idCategoria: params.get("idCategoria") || undefined
      })
  });

  const items = data?.items ?? [];

  function buscar(e) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    next.set("q", q);
    next.set("page", "1");
    setParams(next);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-ink">Catálogo de productos</h1>
      <p className="mt-2 text-slate-600">Busca por nombre o descripción.</p>

      <form onSubmit={buscar} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            placeholder="Buscar productos…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            label="Búsqueda"
          />
        </div>
        <Button type="submit" className="sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </form>

      {isLoading ? (
        <Loader className="mt-12" />
      ) : items.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon={Package}
          title="Sin resultados"
          description="Prueba con otras palabras o revisa más tarde."
        />
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <CardProducto key={p.idProducto} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
