import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCarrito, patchCarritoItem, deleteCarritoItem } from "../../services/api/cliente.api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { ShoppingCart } from "lucide-react";

export function CarritoClientePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["carrito"], queryFn: getCarrito });

  const updateQty = useMutation({
    mutationFn: ({ idProducto, cantidad }) => patchCarritoItem(idProducto, { cantidad }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carrito"] }),
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  const remove = useMutation({
    mutationFn: (idProducto) => deleteCarritoItem(idProducto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carrito"] })
  });

  if (isLoading) return <Loader />;

  const items = data?.items ?? [];
  const subtotal = data?.subtotal ?? 0;

  if (!items.length) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Tu carrito está vacío"
        description="Explora el catálogo y agrega productos."
      >
        <Link to="/productos">
          <Button>Ir al catálogo</Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Carrito</h2>
      <div className="mt-6 space-y-4">
        {items.map((row) => (
          <Card key={row.idProducto}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">{row.producto?.nombre || "Producto"}</p>
                <p className="text-sm text-slate-500">
                  ${Number(row.precioFijado).toLocaleString("es-CO")} c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  className="h-10 w-16 rounded-lg border border-slate-200 px-2 text-center text-sm"
                  defaultValue={row.cantidad}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 0) updateQty.mutate({ idProducto: row.idProducto, cantidad: v });
                  }}
                />
                <Button variant="ghost" size="sm" onClick={() => remove.mutate(row.idProducto)}>
                  Quitar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg font-semibold text-ink">
          Subtotal: <span className="text-brand-600">${Number(subtotal).toLocaleString("es-CO")}</span>
        </p>
        <Link to="/cliente/checkout">
          <Button size="lg">Ir a checkout</Button>
        </Link>
      </Card>
    </div>
  );
}
