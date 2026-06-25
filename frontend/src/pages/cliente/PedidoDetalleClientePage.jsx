import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPedido } from "../../services/api/cliente.api";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import { Card } from "../../components/ui/Card";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Store,
  Truck,
  UserRound
} from "lucide-react";

const statusSteps = [
  { key: "Pendiente", label: "Pedido creado", icon: ReceiptText },
  { key: "Pagado", label: "Pago confirmado", icon: CreditCard },
  { key: "En Proceso", label: "Preparando", icon: Package },
  { key: "Completado", label: "Entregado", icon: PackageCheck }
];

export function PedidoDetalleClientePage() {
  const { idPedido } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["pedido", idPedido],
    queryFn: () => getPedido(idPedido)
  });

  if (isLoading) return <OrderSkeleton />;

  const pedido = data?.pedido;
  const detalles = data?.detalles ?? [];
  const direccion = data?.direccion;
  const resumen = data?.resumen ?? {};
  const total = Number(resumen.total ?? pedido?.total ?? 0);
  const subtotal = Number(resumen.subtotal ?? Math.round(total / 1.19));
  const iva = Number(resumen.iva ?? total - subtotal);
  const estado = pedido?.estado ?? "Pendiente";
  const cliente = pedido?.cliente;
  const fechaPedido = pedido?.fecha
    ? new Date(pedido.fecha).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
    : "Fecha no disponible";
  const activeIndex = estado === "Cancelado"
    ? -1
    : Math.max(0, statusSteps.findIndex((step) => step.key === estado));
  const tiendas = [...new Set(detalles.map((item) => item.nombreTienda).filter(Boolean))];

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <Breadcrumbs
        items={[
          { to: "/cliente", label: "Cliente" },
          { to: "/cliente/pedidos", label: "Mis pedidos" },
          { label: `Pedido #${idPedido}` }
        ]}
      />
      <Link to="/cliente/pedidos" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ChevronLeft className="h-4 w-4" />
        Volver a pedidos
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="bg-slate-950 px-5 py-6 text-white sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">Compra confirmada</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Pedido #{pedido?.idPedido}</h2>
              <p className="mt-2 text-sm text-slate-300">ID global autoincremental de UrabaMarket. No se reinicia por usuario.</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${estado === "Cancelado" ? "bg-red-100 text-red-700" : "bg-brand-100 text-brand-800"}`}>
                {estado}
              </span>
              <span className="text-sm text-slate-300">{fechaPedido}</span>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <MetaCard label="Numero de pedido" value={`#${pedido?.idPedido ?? idPedido}`} />
            <MetaCard label="Fecha" value={fechaPedido} />
            <MetaCard label="Cliente" value={cliente?.nombre || cliente?.email || "Cliente UrabaMarket"} />
            <MetaCard label="Productos" value={`${detalles.length} item${detalles.length === 1 ? "" : "s"}`} />
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-4">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const done = activeIndex >= index || estado === "Completado";
            const current = activeIndex === index;
            return (
              <div key={step.key} className="relative flex gap-3 lg:block">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${done ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="min-w-0 lg:mt-3">
                  <p className={`text-sm font-semibold ${current ? "text-brand-700" : "text-ink"}`}>{step.label}</p>
                  <p className="text-xs text-slate-500">{done ? "Completado" : "Pendiente"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card className="border-slate-200" padding="none">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-700" />
                <h3 className="font-semibold text-ink">Productos del pedido</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Vendido por {tiendas.join(", ") || "UrabaMarket"}
              </span>
            </div>
            <div className="divide-y divide-slate-100 px-5">
              {detalles.map((item) => {
                const unit = Number(item.precioUnitario ?? 0);
                const line = unit * Number(item.cantidad ?? 0);
                return (
                  <div key={item.idDetalle} className="grid gap-4 py-5 first:pt-5 last:pb-5 sm:grid-cols-[104px_1fr_auto]">
                    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:w-24">
                      {item.imagenProducto ? (
                        <img src={resolveAssetUrl(item.imagenProducto)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-7 w-7 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-ink">{item.nombreProducto || `Producto #${item.idProducto}`}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <Store className="h-4 w-4" />
                        {item.nombreTienda || "Vendedor UrabaMarket"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-800">Cantidad: {item.cantidad}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Producto #{item.idProducto}</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-left sm:min-w-36 sm:text-right">
                      <p className="text-sm text-slate-500">${unit.toLocaleString("es-CO")} c/u</p>
                      <p className="mt-1 text-xl font-bold text-ink">${line.toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <UserRound className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink">Cliente</h3>
                  <p className="mt-2 truncate text-sm text-slate-600">{cliente?.nombre || "Cliente UrabaMarket"}</p>
                  <p className="truncate text-sm text-slate-500">{cliente?.email || "Email no disponible"}</p>
                </div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">Dirección de envío</h3>
                  <p className="mt-2 text-sm text-slate-600">{direccion?.direccion || "Dirección no disponible"}</p>
                  <p className="text-sm text-slate-500">{direccion?.ciudad || "Urabá"}</p>
                </div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">Vendedor</h3>
                  <p className="mt-2 text-sm text-slate-600">{tiendas.join(", ") || "UrabáMarket"}</p>
                  <p className="text-sm text-slate-500">Preparación y despacho según disponibilidad.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-slate-200 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <ReceiptText className="h-5 w-5 text-brand-700" />
              <h3 className="font-semibold text-ink">Total del pedido</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA incluido</span>
                <span>${iva.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Método de pago</span>
                <span>{data?.metodoPago || "Pago contra entrega"}</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="text-2xl font-bold text-ink">${total.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 bg-slate-50">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-700" />
              <div>
                <p className="font-semibold text-ink">Soporte del pedido</p>
                <p className="mt-1 text-sm text-slate-500">Conserva este número para cualquier consulta: #{pedido?.idPedido}</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function MetaCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6">
      <div className="h-5 w-36 rounded bg-slate-200" />
      <div className="h-48 rounded-2xl bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="h-96 rounded-2xl bg-slate-200" />
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
