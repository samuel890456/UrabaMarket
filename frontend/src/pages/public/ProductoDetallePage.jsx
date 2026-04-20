import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";
import { getProducto } from "../../services/api/catalog.api";
import { postCarritoItem } from "../../services/api/cliente.api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

export function ProductoDetallePage() {
  const { idProducto } = useParams();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["producto", idProducto],
    queryFn: () => getProducto(idProducto, { visita: true })
  });

  async function agregar() {
    if (!user || user.rol !== "Cliente") {
      toast.error("Inicia sesión como cliente para comprar");
      return;
    }
    try {
      await postCarritoItem({ idProducto: Number(idProducto), cantidad: 1, sumarCantidad: true });
      toast.success("Producto agregado al carrito");
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo agregar");
    }
  }

  if (isLoading) return <Loader className="py-24" />;
  if (!data) return <p className="p-10 text-center text-slate-500">Producto no encontrado</p>;

  const precio = Number(data.precio).toLocaleString("es-CO");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/productos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <Card padding="none" className="overflow-hidden">
          <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50">
            {data.imagenPrincipal ? (
              <img src={data.imagenPrincipal} alt="" className="h-full w-full object-cover" />
            ) : (
              <Package className="h-24 w-24 text-brand-200" />
            )}
          </div>
        </Card>
        <div>
          <h1 className="text-3xl font-bold text-ink">{data.nombre}</h1>
          <p className="mt-4 text-3xl font-bold text-brand-600">${precio}</p>
          <p className="mt-4 text-slate-600 leading-relaxed">{data.descripcion || "Sin descripción."}</p>
          <p className="mt-4 text-sm text-slate-500">Stock disponible: {data.stock}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={agregar} disabled={data.stock < 1}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Agregar al carrito
            </Button>
            <Link to="/cliente/carrito">
              <Button variant="outline" size="lg">
                Ver carrito
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
