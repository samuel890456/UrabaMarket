import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, Heart, Package, ShieldCheck, ShoppingCart, Star, Store, Truck, ZoomIn } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getProducto, getProductos } from "../../services/api/catalog.api";
import { postCarritoItem } from "../../services/api/cliente.api";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Loader } from "../../components/Loader.jsx";
import { CardProducto } from "../../components/product/CardProducto.jsx";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl.js";
import { hasRole } from "../../utils/rbac.js";

export function ProductoDetallePage() {
  const { idProducto } = useParams();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [cantidad, setCantidad] = useState(1);
  const [activeTab, setActiveTab] = useState("descripcion");
  const [zoomed, setZoomed] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["producto", idProducto],
    queryFn: () => getProducto(idProducto, { visita: true })
  });

  const { data: relacionados } = useQuery({
    queryKey: ["productos", "relacionados", data?.idCategoria, idProducto],
    queryFn: () => getProductos({ idCategoria: data?.idCategoria, limit: 4, page: 1 }),
    enabled: Boolean(data?.idCategoria)
  });

  const gallery = useMemo(() => {
    const main = data?.imagenPrincipal ? [data.imagenPrincipal] : [];
    return main.length ? main : [null, null, null];
  }, [data]);

  async function agregar() {
    if (!user || !hasRole(user, "Cliente")) {
      toast.error("Inicia sesion como cliente para comprar");
      return;
    }
    try {
      await postCarritoItem({ idProducto: Number(idProducto), cantidad, sumarCantidad: true });
      queryClient.invalidateQueries({ queryKey: ["carrito"] });
      toast.success("Producto agregado al carrito");
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo agregar");
    }
  }

  if (isLoading) return <Loader className="py-24" />;
  if (!data) return <p className="p-10 text-center text-slate-500">Producto no encontrado</p>;

  const precio = Number(data.precio || 0);
  const sinStock = Number(data.stock || 0) < 1;
  const stockPct = Math.min(100, Math.max(8, Number(data.stock || 0) * 10));
  const relatedItems = (relacionados?.items ?? []).filter((item) => item.idProducto !== data.idProducto).slice(0, 4);

  return (
    <div className="bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link to="/productos" className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Volver al catalogo
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
          <Card padding="none" className="overflow-hidden border-slate-200">
            <div className="grid gap-4 p-4 md:grid-cols-[88px_1fr]">
              <div className="order-2 flex gap-3 md:order-1 md:flex-col">
                {gallery.map((image, index) => (
                  <button key={index} type="button" className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {image ? <img src={resolveAssetUrl(image)} alt="" className="h-full w-full object-cover" /> : <Package className="h-6 w-6 text-slate-300" />}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setZoomed(true)} className="group relative order-1 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white md:order-2">
                {data.imagenPrincipal ? (
                  <img src={resolveAssetUrl(data.imagenPrincipal)} alt={data.nombre} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <Package className="h-24 w-24 text-slate-300" strokeWidth={1.25} />
                )}
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-card">
                  <ZoomIn className="h-4 w-4" />
                  Zoom
                </span>
              </button>
            </div>
          </Card>

          <aside className="space-y-4">
            <Card className="border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-brand-700">{data.marca || "Producto local"}</p>
                  <h1 className="mt-2 text-3xl font-black leading-tight text-ink">{data.nombre}</h1>
                </div>
                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-red-600" type="button">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-700">
                  <Star className="h-4 w-4 fill-current" />
                  4.8
                </span>
                <span className="text-slate-500">{data.vendidosTotales || 0} vendidos</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-800">
                  <BadgeCheck className="h-4 w-4" />
                  Verificado
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">Precio especial</p>
                <p className="text-4xl font-black text-red-600">${precio.toLocaleString("es-CO")}</p>
                <p className="mt-1 text-xs text-red-700">IVA incluido cuando aplique.</p>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Stock disponible</span>
                  <span className="font-bold text-ink">{data.stock}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${sinStock ? "bg-red-500" : "bg-brand-600"}`} style={{ width: `${stockPct}%` }} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <input
                  type="number"
                  min="1"
                  max={data.stock || 1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.min(Number(data.stock || 1), Math.max(1, Number(e.target.value || 1))))}
                  className="h-12 w-24 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  disabled={sinStock}
                />
                <Button size="lg" onClick={agregar} disabled={sinStock} className="flex-1">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Agregar al carrito
                </Button>
              </div>
            </Card>

            <Card className="border-slate-200">
              <div className="grid gap-3">
                <InfoLine icon={Truck} title="Envio estimado" text="Entrega local segun cobertura del vendedor." />
                <InfoLine icon={ShieldCheck} title="Compra protegida" text="Validamos stock y precio antes de crear el pedido." />
                <InfoLine icon={Store} title="Vendedor" text={data.nombreTienda || "Tienda UrabaMarket"} />
              </div>
            </Card>
          </aside>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4">
            {["descripcion", "envio", "resenas", "vendedor"].map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-bold capitalize ${activeTab === tab ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "descripcion" ? <p className="leading-7 text-slate-600">{data.descripcion || "Sin descripcion."}</p> : null}
            {activeTab === "envio" ? <p className="leading-7 text-slate-600">El vendedor confirma cobertura, tiempos y costo de envio al procesar el pedido.</p> : null}
            {activeTab === "resenas" ? <ReviewPreview /> : null}
            {activeTab === "vendedor" ? <InfoLine icon={Store} title={data.nombreTienda || "Tienda UrabaMarket"} text="Perfil comercial verificado dentro de UrabaMarket." /> : null}
          </div>
        </section>

        {relatedItems.length ? (
          <section className="mt-10">
            <div className="mb-5">
              <p className="text-sm font-bold text-brand-700">Tambien te puede gustar</p>
              <h2 className="text-2xl font-black text-ink">Productos relacionados</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((item) => <CardProducto key={item.idProducto} producto={item} />)}
            </div>
          </section>
        ) : null}
      </main>

      {zoomed ? (
        <button type="button" onClick={() => setZoomed(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          {data.imagenPrincipal ? <img src={resolveAssetUrl(data.imagenPrincipal)} alt="" className="max-h-full max-w-full rounded-2xl object-contain" /> : null}
        </button>
      ) : null}
    </div>
  );
}

function InfoLine({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-3">
      <Icon className="mt-0.5 h-5 w-5 text-brand-700" />
      <div>
        <p className="font-bold text-ink">{title}</p>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function ReviewPreview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[5, 4, 5].map((rating, index) => (
        <div key={index} className="rounded-2xl bg-slate-50 p-4">
          <div className="flex text-amber-500">
            {Array.from({ length: rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
          </div>
          <p className="mt-3 text-sm text-slate-600">Buena calidad, entrega clara y producto acorde a la descripcion.</p>
        </div>
      ))}
    </div>
  );
}
