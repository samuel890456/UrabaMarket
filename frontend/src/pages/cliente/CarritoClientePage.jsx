import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCarrito, patchCarritoItem, deleteCarritoItem, clearCarrito } from "../../services/api/cliente.api";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/EmptyState";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";
import { AlertTriangle, CreditCard, Minus, PackageCheck, Plus, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";

export function CarritoClientePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["carrito"], queryFn: getCarrito });

  const updateQty = useMutation({
    mutationFn: ({ idProducto, cantidad }) => patchCarritoItem(idProducto, { cantidad }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carrito"] }),
    onError: (e) => {
      qc.invalidateQueries({ queryKey: ["carrito"] });
      toast.error(e.response?.data?.message || "No se pudo actualizar la cantidad");
    }
  });

  const remove = useMutation({
    mutationFn: (idProducto) => deleteCarritoItem(idProducto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carrito"] })
  });

  const clear = useMutation({
    mutationFn: clearCarrito,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carrito"] });
      toast.success("Carrito vacío");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo vaciar")
  });

  if (isLoading) return <CartSkeleton />;

  const items = data?.items ?? [];
  const total = Number(data?.total ?? data?.subtotal ?? 0);
  const subtotal = Number(data?.subtotal ?? Math.round(total / 1.19));
  const iva = Number(data?.iva ?? total - subtotal);
  const tieneProblemas = Boolean(data?.tieneProblemas);
  const totalItems = items.reduce((sum, item) => sum + Number(item.cantidad ?? 0), 0);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-6xl animate-fade-in">
        <Breadcrumbs items={[{ to: "/cliente", label: "Cliente" }, { label: "Carrito" }]} />
        <EmptyState
          icon={ShoppingCart}
          title="Tu carrito está vacío"
          description="Explora el catálogo y agrega productos."
        >
          <Link to="/productos">
            <Button>Ir al catálogo</Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <Breadcrumbs items={[{ to: "/cliente", label: "Cliente" }, { label: "Carrito" }]} />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-700">Compra segura</p>
          <h2 className="text-3xl font-bold text-ink">Carrito</h2>
          <p className="mt-1 text-sm text-slate-500">{totalItems} producto{totalItems === 1 ? "" : "s"} listo{totalItems === 1 ? "" : "s"} para checkout</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/productos">
            <Button variant="outline" size="sm">
              Seguir comprando
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clear.mutate()}
            disabled={clear.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Vaciar carrito
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((row) => {
            const unit = Number(row.precioActual ?? row.precioFijado ?? row.producto?.precio ?? 0);
            const line = Number(row.subtotalLinea ?? unit * Number(row.cantidad ?? 0));
            const image = row.producto?.imagenPrincipal;
            const maxStock = Number(row.stockDisponible ?? row.producto?.stock ?? 0);
            const blocked = !row.disponible;
            return (
              <Card key={row.idProducto} className={`overflow-hidden ${blocked ? "border-red-200 bg-red-50/30" : ""}`} padding="none">
                <div className="grid gap-4 p-4 sm:grid-cols-[112px_1fr_auto] sm:p-5">
                  <Link
                    to={`/productos/${row.idProducto}`}
                    className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:w-28"
                  >
                    {image ? (
                      <img src={resolveAssetUrl(image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingCart className="h-8 w-8 text-slate-300" />
                    )}
                  </Link>
                  <div className="min-w-0">
                    <Link to={`/productos/${row.idProducto}`} className="font-semibold text-ink hover:text-brand-700">
                      {row.producto?.nombre || "Producto"}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {row.producto?.marca || "UrabáMarket"} · {maxStock > 0 ? `${maxStock} disponibles` : "Agotado"}
                    </p>
                    {row.mensaje ? (
                      <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${blocked ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {row.mensaje}
                      </p>
                    ) : null}
                    <p className="mt-3 text-lg font-bold text-ink">${unit.toLocaleString("es-CO")}</p>
                    {row.precioCambio ? (
                      <p className="text-xs text-amber-700">
                        Antes: ${Number(row.precioFijado).toLocaleString("es-CO")} · precio actualizado
                      </p>
                    ) : null}
                    <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-l-full text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        onClick={() =>
                          updateQty.mutate({ idProducto: row.idProducto, cantidad: Math.max(1, row.cantidad - 1) })
                        }
                        disabled={updateQty.isPending || row.cantidad <= 1 || row.eliminado}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        className="h-9 w-12 border-x border-slate-200 text-center text-sm font-semibold outline-none"
                        value={row.cantidad}
                        inputMode="numeric"
                        onChange={(e) => {
                          const next = Math.max(1, Number(e.target.value || 1));
                          updateQty.mutate({ idProducto: row.idProducto, cantidad: next });
                        }}
                        disabled={row.eliminado}
                        aria-label="Cantidad"
                      />
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-r-full text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        onClick={() =>
                          updateQty.mutate({ idProducto: row.idProducto, cantidad: row.cantidad + 1 })
                        }
                        disabled={updateQty.isPending || row.eliminado || (maxStock > 0 && row.cantidad >= maxStock)}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Subtotal</p>
                      <p className={`text-lg font-bold ${blocked ? "text-red-700" : "text-brand-700"}`}>${line.toLocaleString("es-CO")}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove.mutate(row.idProducto)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Quitar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-slate-200 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-ink">Resumen de compra</h3>
                <p className="text-xs text-slate-500">IVA incluido en precios publicados</p>
              </div>
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
                <span>Envío</span>
                <span className="font-medium text-brand-700">Se calcula al pagar</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="text-2xl font-bold text-ink">${total.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>
            <Link to="/cliente/checkout" className="mt-5 block">
              <Button size="lg" className="w-full" disabled={!items.length || tieneProblemas}>
                Continuar compra
              </Button>
            </Link>
            {tieneProblemas ? (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Ajusta o retira los productos con alerta antes de continuar.
              </p>
            ) : null}
            <div className="mt-4 grid gap-2 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-700" />
                Pago y datos protegidos
              </p>
              <p className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-brand-700" />
                Confirmación de pedido inmediata
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="h-8 w-48 rounded bg-slate-200" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="h-28 w-28 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="h-9 w-32 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
