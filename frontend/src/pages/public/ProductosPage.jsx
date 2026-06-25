import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Filter, Package, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { getCategorias, getProductos } from "../../services/api/catalog.api";
import { CardProducto } from "../../components/product/CardProducto.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";

export function ProductosPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [categoryId, setCategoryId] = useState(params.get("idCategoria") || "");
  const [marca, setMarca] = useState(params.get("marca") || "");
  const [minPrice, setMinPrice] = useState(params.get("minPrecio") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrecio") || "");
  const [sort, setSort] = useState(`${params.get("sortBy") || "idProducto"}:${params.get("sortOrder") || "DESC"}`);
  const [debouncedFilters, setDebouncedFilters] = useState({ q, marca, minPrice, maxPrice });
  const page = Number(params.get("page") || 1);

  const { data: categorias = [] } = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
  const { sortBy, sortOrder } = useMemo(() => {
    const [by, order] = sort.split(":");
    return { sortBy: by, sortOrder: order };
  }, [sort]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters({ q, marca, minPrice, maxPrice });
      const next = new URLSearchParams(params);
      updateParam(next, "q", q);
      updateParam(next, "idCategoria", categoryId);
      updateParam(next, "marca", marca);
      updateParam(next, "minPrecio", minPrice);
      updateParam(next, "maxPrecio", maxPrice);
      updateParam(next, "sortBy", sortBy === "idProducto" ? "" : sortBy);
      updateParam(next, "sortOrder", sortOrder === "DESC" ? "" : sortOrder);
      next.set("page", "1");
      setParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [q, categoryId, marca, minPrice, maxPrice, sortBy, sortOrder]);

  const { data, isLoading } = useQuery({
    queryKey: ["productos", "buscar", debouncedFilters.q, page, categoryId, debouncedFilters.marca, debouncedFilters.minPrice, debouncedFilters.maxPrice, sortBy, sortOrder],
    queryFn: () => getProductos({
      q: debouncedFilters.q || undefined,
      idCategoria: categoryId || undefined,
      marca: debouncedFilters.marca || undefined,
      minPrecio: debouncedFilters.minPrice || undefined,
      maxPrecio: debouncedFilters.maxPrice || undefined,
      sortBy,
      sortOrder,
      page,
      limit: 24
    })
  });

  const items = data?.items ?? [];

  function applyFilters(e) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    updateParam(next, "q", q);
    updateParam(next, "idCategoria", categoryId);
    updateParam(next, "marca", marca);
    updateParam(next, "minPrecio", minPrice);
    updateParam(next, "maxPrecio", maxPrice);
    updateParam(next, "sortBy", sortBy === "idProducto" ? "" : sortBy);
    updateParam(next, "sortOrder", sortOrder === "DESC" ? "" : sortOrder);
    next.set("page", "1");
    setParams(next);
  }

  function clearFilters() {
    setQ("");
    setCategoryId("");
    setMarca("");
    setMinPrice("");
    setMaxPrice("");
    setSort("idProducto:DESC");
    setParams(new URLSearchParams());
  }

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                <Sparkles className="h-3.5 w-3.5" />
                Marketplace UrabaMarket
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-5xl">Explora productos locales con experiencia premium</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Filtra por categoria, marca, precio y ordena el catalogo como en un marketplace moderno.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resultados</p>
              <p className="mt-1 text-3xl font-black text-ink">{data?.meta?.total ?? items.length}</p>
              <p className="text-sm text-slate-500">productos disponibles</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={applyFilters} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-ink">
                <SlidersHorizontal className="h-5 w-5 text-brand-700" />
                Filtros
              </h2>
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-slate-500 hover:text-red-600">
                Limpiar
              </button>
            </div>
            <div className="space-y-4">
              <Input label="Busqueda" placeholder="Buscar productos..." value={q} onChange={(e) => setQ(e.target.value)} />
              <Select label="Categoria" value={categoryId} onChange={setCategoryId}>
                <option value="">Todas</option>
                {categorias.map((cat) => <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>)}
              </Select>
              <Input label="Marca" placeholder="Ej: Nike, Samsung..." value={marca} onChange={(e) => setMarca(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Min" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <Input label="Max" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
              <Select label="Ordenar" value={sort} onChange={setSort}>
                <option value="idProducto:DESC">Mas recientes</option>
                <option value="precio:ASC">Menor precio</option>
                <option value="precio:DESC">Mayor precio</option>
                <option value="popularidad:DESC">Populares</option>
              </Select>
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Aplicar filtros
              </Button>
            </div>
          </form>
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {q ? <Chip label={`Busqueda: ${q}`} onClear={() => setQ("")} /> : null}
              {marca ? <Chip label={`Marca: ${marca}`} onClear={() => setMarca("")} /> : null}
              {categoryId ? <Chip label="Categoria activa" onClear={() => setCategoryId("")} /> : null}
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-soft">
              <Filter className="h-4 w-4" />
              {items.length} visibles
            </span>
          </div>

          {isLoading ? (
            <ProductSkeletonGrid />
          ) : items.length === 0 ? (
            <EmptyState className="mt-12" icon={Package} title="Sin resultados" description="Prueba con otras palabras o ajusta los filtros." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {items.map((p) => <CardProducto key={p.idProducto} producto={p} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <select className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  );
}

function Chip({ label, onClear }) {
  return (
    <button type="button" onClick={onClear} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-soft">
      {label}
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid animate-pulse gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="aspect-square bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-8 w-1/2 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function updateParam(params, key, value) {
  if (value) params.set(key, value);
  else params.delete(key);
}
