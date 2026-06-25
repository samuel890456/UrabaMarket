import { useSearchParams, Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductosAdmin } from "../../services/api/admin.api"; // Corrected path
import { getCategorias } from "../../services/api/catalog.api"; // Corrected path
import { Card } from "../../components/ui/Card"; // Corrected path
import { Loader } from "../../components/Loader"; // Corrected path
import { EmptyState } from "../../components/EmptyState"; // Corrected path
import { Input } from "../../components/ui/Input"; // Corrected path
import { Button } from "../../components/ui/Button"; // Corrected path
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx"; // Corrected path
import { useState } from "react";
import { Package, Search, Pencil } from "lucide-react";

export function StoreAdminProductsPage() {
  const { idTienda } = useParams(); // Get idTienda from URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const idCategoria = searchParams.get("idCategoria") || "";
  const marca = searchParams.get("marca") || "";
  const minPrecio = searchParams.get("minPrecio") || "";
  const maxPrecio = searchParams.get("maxPrecio") || "";
  const sortBy = searchParams.get("sortBy") || "idProducto";
  const sortOrder = searchParams.get("sortOrder") || "DESC";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10); // Default limit for admin view

  const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const { data: productosData, isLoading: isLoadingProductos } = useQuery({
    queryKey: [
      "admin-productos-by-store",
      idTienda, // Include idTienda in query key
      q,
      idCategoria,
      marca,
      minPrecio,
      maxPrecio,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
    queryFn: () =>
      getProductosAdmin({
        idTienda: Number(idTienda), // Pass idTienda from URL params
        q: q || undefined,
        idCategoria: idCategoria || undefined,
        marca: marca || undefined,
        minPrecio: minPrecio || undefined,
        maxPrecio: maxPrecio || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page,
        limit,
      }),
  });

  const products = productosData?.items ?? [];
  const totalPages = productosData?.meta?.totalPages ?? 0;

  function applyFilters(e) {
    e.preventDefault();
    const nextSearchParams = new URLSearchParams();

    if (q) nextSearchParams.set("q", q);
    if (idCategoria) nextSearchParams.set("idCategoria", idCategoria);
    if (marca) nextSearchParams.set("marca", marca);
    if (minPrecio) nextSearchParams.set("minPrecio", minPrecio);
    if (maxPrecio) nextSearchParams.set("maxPrecio", maxPrecio);
    if (sortBy && sortBy !== "idProducto") nextSearchParams.set("sortBy", sortBy);
    if (sortOrder && sortOrder !== "DESC") nextSearchParams.set("sortOrder", sortOrder);
    nextSearchParams.set("page", "1"); // Reset to first page on new filter
    nextSearchParams.set("limit", String(limit));

    setSearchParams(nextSearchParams);
  }

  function handlePageChange(newPage) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", String(newPage));
    setSearchParams(nextSearchParams);
  }

  const isLoading = isLoadingCategorias || isLoadingProductos;

  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink">Productos de la Tienda (ID: {idTienda})</h2>
      <p className="mt-1 text-slate-600">Gestión de productos para una tienda específica</p>

      <form onSubmit={applyFilters} className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-md">
        {/* Search Query */}
        <div>
          <Input
            placeholder="Buscar productos…"
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

        {/* Brand Filter */}
        <div>
          <Input
            placeholder="Filtrar por marca…"
            value={marca}
            onChange={(e) => {
                const nextSearchParams = new URLSearchParams(searchParams);
                if (e.target.value) nextSearchParams.set("marca", e.target.value);
                else nextSearchParams.delete("marca");
                nextSearchParams.set("page", "1");
                setSearchParams(nextSearchParams);
            }}
            label="Marca"
          />
        </div>

        {/* Price Range Filters */}
        <div>
          <Input
            type="number"
            placeholder="Precio mínimo"
            value={minPrecio}
            onChange={(e) => {
                const nextSearchParams = new URLSearchParams(searchParams);
                if (e.target.value) nextSearchParams.set("minPrecio", e.target.value);
                else nextSearchParams.delete("minPrecio");
                nextSearchParams.set("page", "1");
                setSearchParams(nextSearchParams);
            }}
            label="Precio Mín."
            step="0.01"
          />
        </div>
        <div>
          <Input
            type="number"
            placeholder="Precio máximo"
            value={maxPrecio}
            onChange={(e) => {
                const nextSearchParams = new URLSearchParams(searchParams);
                if (e.target.value) nextSearchParams.set("maxPrecio", e.target.value);
                else nextSearchParams.delete("maxPrecio");
                nextSearchParams.set("page", "1");
                setSearchParams(nextSearchParams);
            }}
            label="Precio Máx."
            step="0.01"
          />
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Ordenar por</label>
          <Select value={sortBy} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              nextSearchParams.set("sortBy", val);
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idProducto">ID</SelectItem>
              <SelectItem value="nombre">Nombre</SelectItem>
              <SelectItem value="precio">Precio</SelectItem>
              <SelectItem value="vendidosTotales">Más Vendidos</SelectItem>
              <SelectItem value="createdAt">Más Recientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Orden</label>
          <Select value={sortOrder} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              nextSearchParams.set("sortOrder", val);
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASC">Ascendente</SelectItem>
              <SelectItem value="DESC">Descendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" className="md:col-span-2 lg:col-span-4">
          <Search className="mr-2 h-4 w-4" />
          Aplicar Filtros
        </Button>
      </form>

      {isLoading ? (
        <Loader className="mt-8" />
      ) : products.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={Package}
          title="Sin productos"
          description="No se encontraron productos con los filtros aplicados en esta tienda."
        />
      ) : (
        <div className="mt-8 space-y-3">
          {products.map((p) => (
            <Card key={p.idProducto} padding="sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/products/${p.idProducto}`} className="font-medium text-indigo-600 hover:underline">
                      {p.nombre}
                    </Link>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    ${Number(p.precio).toLocaleString("es-CO")} · Stock: {p.stock} · Marca: {p.marca || "N/A"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/products/${p.idProducto}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Ver/Editar
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
