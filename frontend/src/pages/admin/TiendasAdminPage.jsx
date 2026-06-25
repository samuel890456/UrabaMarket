import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTiendasAdmin } from "../../services/api/admin.api";
import { getCategorias } from "../../services/api/catalog.api"; // Import getCategorias
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";
import { useState } from "react";
import { Package, Search, Store as StoreIcon, Pencil } from "lucide-react"; // Renamed Store to StoreIcon to avoid conflict

export function TiendasAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const idCategoria = searchParams.get("idCategoria") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10); // Default limit for admin view

  const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const { data: tiendasData, isLoading: isLoadingTiendas } = useQuery({
    queryKey: ["admin-tiendas", q, idCategoria, page, limit],
    queryFn: () =>
      getTiendasAdmin({
        q: q || undefined,
        idCategoria: idCategoria || undefined,
        page,
        limit,
      }),
  });

  const stores = tiendasData?.items ?? [];
  const totalPages = tiendasData?.meta?.totalPages ?? 0;

  function applyFilters(e) {
    e.preventDefault();
    const nextSearchParams = new URLSearchParams();

    if (q) nextSearchParams.set("q", q);
    if (idCategoria) nextSearchParams.set("idCategoria", idCategoria);
    nextSearchParams.set("page", "1"); // Reset to first page on new filter
    nextSearchParams.set("limit", String(limit));

    setSearchParams(nextSearchParams);
  }

  function handlePageChange(newPage) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", String(newPage));
    setSearchParams(nextSearchParams);
  }

  const isLoading = isLoadingCategorias || isLoadingTiendas;

  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink">Gestión de Tiendas</h2>
      <p className="mt-1 text-slate-600">Vista global de las tiendas y acciones administrativas</p>

      <form onSubmit={applyFilters} className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow-md">
        {/* Search Query */}
        <div>
          <Input
            placeholder="Buscar tiendas por nombre o descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            label="Búsqueda"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="idCategoria" className="block text-sm font-medium text-gray-700">Categoría</label>
          <Select value={idCategoria} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("idCategoria", val);
              else nextSearchParams.delete("idCategoria");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categorias?.map((cat) => (
                <SelectItem key={cat.idCategoria} value={String(cat.idCategoria)}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" className="md:col-span-1 lg:col-span-1 mt-auto"> {/* Adjusted col-span */}
          <Search className="mr-2 h-4 w-4" />
          Aplicar Filtros
        </Button>
      </form>

      {isLoading ? (
        <Loader className="mt-8" />
      ) : stores.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={StoreIcon}
          title="Sin tiendas"
          description="No se encontraron tiendas con los filtros aplicados."
        />
      ) : (
        <div className="mt-8 space-y-3">
          {stores.map((t) => (
            <Card key={t.idTienda} padding="sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/stores/${t.idTienda}`} className="font-medium text-indigo-600 hover:underline">
                      {t.nombre}
                    </Link>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {t.activo ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{t.descripcion || "—"}</p>
                  <p className="text-xs text-slate-500">Propietario: {t.nombreUsuario || "N/A"}</p>
                  {t.idCategoria && <p className="text-xs text-slate-500">Categoría: {categorias?.find(c => c.idCategoria === t.idCategoria)?.nombre || "N/A"}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/stores/${t.idTienda}/products`}>
                            <Package className="mr-2 h-4 w-4" />
                            Ver Productos
                        </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/stores/${t.idTienda}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Ver/Editar Tienda
                        </Link>
                    </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="flex items-center text-sm font-medium text-gray-700">
            Página {page} de {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            variant="outline"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}