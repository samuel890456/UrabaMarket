import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Search, ShieldCheck, Star, Store } from "lucide-react";
import { getCategorias, getTiendas } from "../../services/api/catalog.api";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/EmptyState";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

function StoreSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-28 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function TiendasPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [search, setSearch] = useState(q);
  const [debouncedSearch, setDebouncedSearch] = useState(q);
  const idCategoria = params.get("idCategoria") ?? "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      const next = new URLSearchParams(params);
      if (search) next.set("q", search);
      else next.delete("q");
      setParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["tiendas", debouncedSearch, idCategoria],
    queryFn: () => getTiendas({ limit: 24, page: 1, q: debouncedSearch || undefined, idCategoria: idCategoria || undefined })
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias
  });

  const items = data?.items ?? [];

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Tiendas verificadas
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Compra directo a negocios de Urabá</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600">
              Explora storefronts con productos destacados, identidad visual, ubicación y catálogos listos para comprar.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <label className="text-sm font-semibold text-ink">Buscar tienda</label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Nombre, descripción o zona"
              />
            </div>
            <select
              className="mt-3 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink shadow-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              value={idCategoria}
              onChange={(event) => {
                const next = new URLSearchParams(params);
                if (event.target.value) next.set("idCategoria", event.target.value);
                else next.delete("idCategoria");
                setParams(next, { replace: true });
              }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((category) => (
                <option key={category.idCategoria} value={category.idCategoria}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <StoreSkeleton key={index} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            className="mt-12"
            icon={Store}
            title="No hay tiendas"
            description="No encontramos tiendas activas con esos filtros."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((store) => (
              <Link
                key={store.idTienda}
                to={`/tiendas/${store.idTienda}/catalogo`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-32 overflow-hidden bg-slate-900">
                  {store.bannerUrl ? (
                    <img
                      src={resolveAssetUrl(store.bannerUrl)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,#064e3b_0%,#0e7490_50%,#f59e0b_100%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-semibold text-white">
                    <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    4.8 · Tienda activa
                  </div>
                </div>
                <div className="relative p-5">
                  <div className="-mt-12 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                    {store.logoUrl ? (
                      <img src={resolveAssetUrl(store.logoUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-8 w-8 text-brand-700" />
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-ink">{store.nombre}</h2>
                      <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">
                        {store.descripcion || "Catálogo local con productos seleccionados para la comunidad."}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-brand-700" />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="inline-flex min-w-0 items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{store.direccion || "Urabá, Colombia"}</span>
                    </span>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">Ver tienda</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
