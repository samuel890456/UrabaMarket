import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MapPin, Package, ReceiptText, Store } from "lucide-react";
import { getPedidoTiendaById } from "../../services/api/vendedor.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

export function PedidoVentaDetallePage() {
  const { idPedido } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["pedido-venta", idPedido],
    queryFn: () => getPedidoTiendaById(idPedido)
  });

  if (isLoading) return <Loader />;

  const pedido = data?.pedido;
  const detalles = data?.detalles ?? [];
  const direccion = data?.direccion;
  const resumen = data?.resumen ?? {};
  const total = Number(resumen.total ?? pedido?.total ?? 0);

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
      <Link to="/vendedor/ventas" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ChevronLeft className="h-4 w-4" />
        Volver a ventas
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-700">Detalle de venta</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">Pedido #{pedido?.idPedido}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {pedido?.fecha ? new Date(pedido.fecha).toLocaleString("es-CO") : ""}
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-800">
            {pedido?.estado}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-slate-200">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-700" />
            <h3 className="font-semibold text-ink">Productos de tu venta</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {detalles.map((item) => {
              const unit = Number(item.precioUnitario ?? 0);
              const line = unit * Number(item.cantidad ?? 0);
              return (
                <div key={item.idDetalle} className="grid gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[80px_1fr_auto]">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    {item.imagenProducto ? (
                      <img src={resolveAssetUrl(item.imagenProducto)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-7 w-7 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{item.nombreProducto || `Producto #${item.idProducto}`}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <Store className="h-4 w-4" />
                      {item.nombreTienda || "Tu tienda"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">Cantidad: {item.cantidad}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">${unit.toLocaleString("es-CO")} c/u</p>
                    <p className="mt-1 text-lg font-bold text-ink">${line.toLocaleString("es-CO")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <ReceiptText className="h-5 w-5 text-brand-700" />
              <h3 className="font-semibold text-ink">Resumen</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${Number(resumen.subtotal ?? Math.round(total / 1.19)).toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA incluido</span>
                <span>${Number(resumen.iva ?? 0).toLocaleString("es-CO")}</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between font-semibold text-ink">
                  <span>Total pedido</span>
                  <span>${total.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-brand-700" />
              <div>
                <h3 className="font-semibold text-ink">Entrega</h3>
                <p className="mt-2 text-sm text-slate-600">{direccion?.direccion || "Dirección no disponible"}</p>
                <p className="text-sm text-slate-500">{direccion?.ciudad || ""}</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
