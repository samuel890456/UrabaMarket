import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, Package, ShoppingCart, Star, Truck } from "lucide-react";
import { cn } from "../../utils/cn";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";
import { useAuthStore } from "../../store/authStore";
import { postCarritoItem } from "../../services/api/cliente.api";
import { hasRole } from "../../utils/rbac";

export function CardProducto({ producto, className }) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const precio = producto.precio != null ? Number(producto.precio) : 0;
  const descuento = Number(producto.descuento || 0);
  const precioAntes = descuento > 0 ? precio / (1 - descuento / 100) : null;
  const sinStock = Number(producto.stock || 0) < 1;

  async function quickAdd(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!user || !hasRole(user, "Cliente")) {
      toast.error("Inicia sesion como cliente para comprar");
      return;
    }
    try {
      await postCarritoItem({ idProducto: Number(producto.idProducto), cantidad: 1, sumarCantidad: true });
      queryClient.invalidateQueries({ queryKey: ["carrito"] });
      toast.success("Producto agregado");
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo agregar");
    }
  }

  return (
    <article className={cn("group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-xl", className)}>
      <Link to={`/productos/${producto.idProducto}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          {producto.imagenPrincipal ? (
            <img src={resolveAssetUrl(producto.imagenPrincipal)} alt={producto.nombre} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-14 w-14 text-slate-300" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {descuento > 0 ? <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">-{descuento}%</span> : null}
            {sinStock ? <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-bold text-white">Agotado</span> : null}
          </div>
          <button
            type="button"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-card transition-colors hover:text-red-600"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toast.success("Agregado a favoritos");
            }}
            aria-label="Agregar a favoritos"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-current" />
            4.8
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{producto.vendidosTotales || 0} vendidos</span>
          </div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink group-hover:text-brand-700">
            {producto.nombre}
          </h3>
          <p className="text-xs text-slate-500">{producto.marca || "Producto local"}</p>
          <div className="flex items-end gap-2">
            <p className="text-xl font-black text-red-600">${precio.toLocaleString("es-CO")}</p>
            {precioAntes ? <p className="text-xs text-slate-400 line-through">${precioAntes.toLocaleString("es-CO")}</p> : null}
          </div>
          <p className="flex items-center gap-1 text-xs font-medium text-brand-700">
            <Truck className="h-3.5 w-3.5" />
            Envio local disponible
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          type="button"
          disabled={sinStock}
          onClick={quickAdd}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          <ShoppingCart className="h-4 w-4" />
          Agregar rapido
        </button>
      </div>
    </article>
  );
}
