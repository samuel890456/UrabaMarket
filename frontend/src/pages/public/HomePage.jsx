import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Package, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Store, Truck } from "lucide-react";
import { getCategorias, getProductos, getTiendas } from "../../services/api/catalog.api";
import { CardProducto } from "../../components/product/CardProducto";
import { Button } from "../../components/ui/Button";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

export function HomePage() {
  const { data: productosData, isLoading: loadingProductos } = useQuery({
    queryKey: ["productos", "home"],
    queryFn: () => getProductos({ limit: 8, page: 1 })
  });
  const { data: tiendasData } = useQuery({
    queryKey: ["tiendas", "home"],
    queryFn: () => getTiendas({ limit: 4, page: 1 })
  });
  const { data: categorias = [] } = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });

  const productos = productosData?.items ?? [];
  const tiendas = tiendasData?.items ?? [];
  const heroProduct = productos[0];

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.45),_transparent_32%),linear-gradient(135deg,_#0f172a,_#14532d_58%,_#f59e0b)]" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_460px] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-brand-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Marketplace local con experiencia global
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              Compra en Uraba con una vitrina moderna, rapida y confiable.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
              Explora productos, tiendas verificadas, promociones y compras con seguimiento desde un solo lugar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/productos">
                <Button size="lg" variant="accent">
                  Explorar productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/tiendas">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                  Ver tiendas
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <HeroBenefit icon={ShieldCheck} title="Compra protegida" />
              <HeroBenefit icon={Truck} title="Entrega local" />
              <HeroBenefit icon={BadgeCheck} title="Tiendas verificadas" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="overflow-hidden rounded-2xl bg-white text-ink">
              <div className="aspect-[4/3] bg-slate-100">
                {heroProduct?.imagenPrincipal ? <img src={resolveAssetUrl(heroProduct.imagenPrincipal)} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">Trending ahora</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Star className="h-4 w-4 fill-current" />
                    4.8
                  </span>
                </div>
                <h2 className="mt-3 line-clamp-2 text-xl font-black">{heroProduct?.nombre || "Producto destacado"}</h2>
                <p className="mt-2 text-3xl font-black text-red-600">${Number(heroProduct?.precio || 0).toLocaleString("es-CO")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Link to="/productos" className="block h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 pt-4 text-sm font-medium text-slate-500">
                Buscar productos, marcas y tiendas
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {categorias.slice(0, 5).map((cat) => (
                <Link key={cat.idCategoria} to={`/productos?idCategoria=${cat.idCategoria}`} className="rounded-full bg-brand-50 px-3 py-2 text-xs font-bold text-brand-800">
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section title="Categorias destacadas" subtitle="Encuentra rapido lo que buscas">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.slice(0, 8).map((cat) => (
            <Link key={cat.idCategoria} to={`/productos?idCategoria=${cat.idCategoria}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <ShoppingBag className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold text-ink group-hover:text-brand-700">{cat.nombre}</h3>
              <p className="mt-1 text-sm text-slate-500">{cat.descripcion || "Productos seleccionados"}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Productos trending" subtitle="Seleccion reciente del marketplace" action="/productos">
        {loadingProductos ? (
          <SkeletonProducts />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {productos.map((p) => <CardProducto key={p.idProducto} producto={p} />)}
          </div>
        )}
      </Section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <Promo title="Ofertas de temporada" text="Promociones y descuentos de comercios locales." to="/productos?sortBy=popularidad" />
          <Promo title="Vende en UrabaMarket" text="Crea una tienda profesional y publica tu catalogo." to="/register/vendedor" dark />
        </div>
      </section>

      <Section title="Tiendas destacadas" subtitle="Storefronts locales con catalogo activo" action="/tiendas">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiendas.map((tienda) => (
            <Link key={tienda.idTienda} to={`/tiendas/${tienda.idTienda}/catalogo`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="h-28 bg-slate-950">
                {tienda.bannerUrl ? <img src={resolveAssetUrl(tienda.bannerUrl)} alt="" className="h-full w-full object-cover" /> : <div className="h-full bg-gradient-to-r from-slate-950 to-brand-700" />}
              </div>
              <div className="-mt-8 p-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-card">
                  {tienda.logoUrl ? <img src={resolveAssetUrl(tienda.logoUrl)} alt="" className="h-full w-full object-cover" /> : <Store className="h-7 w-7 text-slate-400" />}
                </div>
                <h3 className="mt-3 font-black text-ink">{tienda.nombre}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{tienda.descripcion || "Tienda local verificada."}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

function HeroBenefit({ icon: Icon, title }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-brand-100" />
      <p className="mt-3 text-sm font-bold">{title}</p>
    </div>
  );
}

function Section({ title, subtitle, action, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-brand-700">{subtitle}</p>
          <h2 className="text-2xl font-black text-ink sm:text-3xl">{title}</h2>
        </div>
        {action ? <Link to={action} className="text-sm font-bold text-brand-700 hover:underline">Ver todos</Link> : null}
      </div>
      {children}
    </section>
  );
}

function Promo({ title, text, to, dark }) {
  return (
    <Link to={to} className={`rounded-3xl p-7 shadow-card ${dark ? "bg-slate-950 text-white" : "bg-amber-100 text-slate-950"}`}>
      <Package className="h-8 w-8" />
      <h3 className="mt-5 text-2xl font-black">{title}</h3>
      <p className={`mt-2 text-sm ${dark ? "text-white/70" : "text-slate-700"}`}>{text}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
        Explorar
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function SkeletonProducts() {
  return (
    <div className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => <div key={item} className="h-80 rounded-2xl bg-slate-200" />)}
    </div>
  );
}
