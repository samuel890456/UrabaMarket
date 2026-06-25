import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Clock, Grid3X3, MapPin, Package, ShieldCheck, Star, Store, Truck } from "lucide-react";
import { getProductosByTienda, getTienda } from "../../services/api/catalog.api";
import { CardProducto } from "../../components/product/CardProducto";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

export function TiendaCatalogoPage() {
  const { idTienda } = useParams();

  const { data: tienda, isLoading: loadingTienda } = useQuery({
    queryKey: ["tienda", idTienda],
    queryFn: () => getTienda(idTienda)
  });

  const { data: productos, isLoading: loadingProductos } = useQuery({
    queryKey: ["productos", "tienda", idTienda],
    queryFn: () => getProductosByTienda(idTienda)
  });

  const isLoading = loadingTienda || loadingProductos;
  const items = productos ?? [];
  const banner = resolveAssetUrl(tienda?.bannerUrl);
  const logo = resolveAssetUrl(tienda?.logoUrl);
  const destacados = items.slice(0, 4);

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Link to="/tiendas" className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Volver a tiendas
        </Link>
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          <div className="relative h-72 bg-slate-950">
            {banner ? <img src={banner} alt="" className="h-full w-full object-cover" /> : <div className="h-full bg-gradient-to-r from-slate-950 via-emerald-900 to-amber-500" />}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-card">
                  {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Store className="h-10 w-10 text-slate-400" />}
                </div>
                <div className="min-w-0 text-white">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Tienda verificada
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      4.8
                    </span>
                  </div>
                  <h1 className="truncate text-3xl font-bold sm:text-5xl">{tienda?.nombre || `Tienda #${idTienda}`}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{tienda?.descripcion || "Catalogo de productos disponibles para compra local."}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-white">
                <HeroStat label="Productos" value={items.length} />
                <HeroStat label="Ventas" value="1.2k" />
                <HeroStat label="Despacho" value="24h" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-4">
            <InfoChip icon={MapPin} text={tienda?.direccion || "Uraba, Colombia"} />
            <InfoChip icon={Truck} text="Entrega local y regional" />
            <InfoChip icon={ShieldCheck} text="Compra protegida" />
            <InfoChip icon={Clock} text="Atencion comercial" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {isLoading ? (
          <StoreSkeleton />
        ) : !items.length ? (
          <EmptyState className="mt-12" icon={Package} title="Sin productos" description="Esta tienda aun no publica productos." />
        ) : (
          <div className="space-y-10">
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-700">Seleccion destacada</p>
                  <h2 className="text-2xl font-bold text-ink">Productos recomendados</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-soft">
                  <Grid3X3 className="h-4 w-4" />
                  {items.length} publicados
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {destacados.map((p) => <CardProducto key={p.idProducto} producto={p} />)}
              </div>
            </section>

            <section>
              <div className="mb-5 border-b border-slate-200">
                <div className="flex gap-2 overflow-x-auto">
                  {["Todos", "Mas vendidos", "Nuevos", "Ofertas"].map((tab, index) => (
                    <button key={tab} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${index === 0 ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500"}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((p) => <CardProducto key={p.idProducto} producto={p} />)}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-3 text-center backdrop-blur">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function InfoChip({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
      <Icon className="h-4 w-4 text-brand-700" />
      {text}
    </div>
  );
}

function StoreSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => <div key={item} className="h-80 rounded-2xl bg-slate-200" />)}
    </div>
  );
}
