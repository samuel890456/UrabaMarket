import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductosAdmin, getProveedoresAdmin, getTiendasAdmin } from "../../services/api/admin.api";
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
import { Package, Search, Pencil } from "lucide-react";

export function ProductosAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const idCategoria = searchParams.get("idCategoria") || "";
  const idTienda = searchParams.get("idTienda") || "";
  const idProveedor = searchParams.get("idProveedor") || "";
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

  const { data: tiendas, isLoading: isLoadingTiendas } = useQuery({
    queryKey: ["adminTiendas"],
    queryFn: () => getTiendasAdmin({ limit: 9999 }), // Get all for filter dropdown
  });

  const { data: proveedores, isLoading: isLoadingProveedores } = useQuery({
    queryKey: ["adminProveedores"],
    queryFn: getProveedoresAdmin,
  });

  const { data: productosData, isLoading: isLoadingProductos } = useQuery({ // Renamed 'data' to 'productosData'
    queryKey: [
      "admin-productos",
      q,
      idCategoria,
      idTienda,
      idProveedor,
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
        q: q || undefined,
        idCategoria: idCategoria || undefined,
        idTienda: idTienda || undefined,
        idProveedor: idProveedor || undefined,
        marca: marca || undefined,
        minPrecio: minPrecio || undefined,
        maxPrecio: maxPrecio || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page,
        limit,
      }),
  });

  const products = productosData?.items ?? []; // Use productosData
  const totalPages = productosData?.meta?.totalPages ?? 0; // Use productosData

  function applyFilters(e) {
    e.preventDefault();
    const nextSearchParams = new URLSearchParams();

    if (q) nextSearchParams.set("q", q);
    if (idCategoria) nextSearchParams.set("idCategoria", idCategoria);
    if (idTienda) nextSearchParams.set("idTienda", idTienda);
    if (idProveedor) nextSearchParams.set("idProveedor", idProveedor);
    if (marca) nextSearchParams.set("marca", marca);
    if (minPrecio) nextSearchParams.set("minPrecio", minPrecio);
    if (maxPrecio) nextSearchParams.set("maxPrecio", maxPrecio);
    if (sortBy && sortBy !== "idProducto") nextSearchParams.set("sortBy", sortBy); // Default is idProducto
    if (sortOrder && sortOrder !== "DESC") nextSearchParams.set("sortOrder", sortOrder); // Default is DESC
    nextSearchParams.set("page", "1"); // Reset to first page on new filter
    nextSearchParams.set("limit", String(limit));

    setSearchParams(nextSearchParams);
  }

  function handlePageChange(newPage) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", String(newPage));
    setSearchParams(nextSearchParams);
  }

  const isLoading = isLoadingCategorias || isLoadingTiendas || isLoadingProveedores || isLoadingProductos;

  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink">Moderación de productos</h2>
      <p className="mt-1 text-slate-600">Vista global del catálogo y acciones administrativas</p>

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

        {/* Store Filter */}
        <div>
          <label htmlFor="idTienda" className="block text-sm font-medium text-gray-700">Tienda</label>
          <Select value={idTienda} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("idTienda", val);
              else nextSearchParams.delete("idTienda");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las tiendas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las tiendas</SelectItem>
              {tiendas?.items.map((store) => (
                <SelectItem key={store.idTienda} value={String(store.idTienda)}>
                  {store.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div>
          <label htmlFor="idProveedor" className="block text-sm font-medium text-gray-700">Proveedor</label>
          <Select value={idProveedor} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("idProveedor", val);
              else nextSearchParams.delete("idProveedor");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los proveedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los proveedores</SelectItem>
              {proveedores?.map((provider) => (
                <SelectItem key={provider.idProveedor} value={String(provider.idProveedor)}>
                  {provider.nombreEmpresa}
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
          description="No se encontraron productos con los filtros aplicados."
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
                  {p.idTienda && <p className="text-xs text-slate-500">Tienda: {p.nombreTienda || tiendas?.items.find(t => t.idTienda === p.idTienda)?.nombre || `#${p.idTienda}`}</p>}
                  {p.idProveedor && <p className="text-xs text-slate-500">Proveedor: {p.nombreProveedor || proveedores?.find((provider) => provider.idProveedor === p.idProveedor)?.nombreEmpresa || `#${p.idProveedor}`}</p>}
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
