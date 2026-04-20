import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "../../utils/cn";

export function CardProducto({ producto, className }) {
  const precio = producto.precio != null ? Number(producto.precio).toLocaleString("es-CO") : "—";
  return (
    <Link to={`/productos/${producto.idProducto}`} className={cn("group block", className)}>
      <Card className="h-full overflow-hidden p-0 transition-transform duration-200 group-hover:-translate-y-0.5">
        <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50">
          {producto.imagenPrincipal ? (
            <img
              src={producto.imagenPrincipal}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-14 w-14 text-brand-300" />
          )}
        </div>
        <div className="p-4">
          <p className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-brand-700">
            {producto.nombre}
          </p>
          <p className="mt-2 text-lg font-bold text-brand-600">${precio}</p>
        </div>
      </Card>
    </Link>
  );
}
