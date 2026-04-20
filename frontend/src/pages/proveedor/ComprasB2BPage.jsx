import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getComprasMiProveedor, patchCompraEstado } from "../../services/api/proveedor.api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { Truck } from "lucide-react";

export function ComprasB2BPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["compras-proveedor"],
    queryFn: getComprasMiProveedor
  });

  const mutation = useMutation({
    mutationFn: ({ id, estado }) => patchCompraEstado(id, { estado }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compras-proveedor"] });
      toast.success("Estado actualizado");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  if (isLoading) return <Loader />;

  const items = data ?? [];

  if (!items.length) {
    return (
      <EmptyState
        icon={Truck}
        title="Sin solicitudes"
        description="Cuando una tienda te compre a través de la plataforma, verás el pedido aquí."
      />
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Solicitudes B2B</h2>
      <div className="mt-6 space-y-4">
        {items.map((c) => (
          <Card key={c.idCompra}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">Compra #{c.idCompra}</p>
                <p className="text-sm text-slate-500">
                  {c.fecha ? new Date(c.fecha).toLocaleString("es-CO") : ""} · $
                  {Number(c.total).toLocaleString("es-CO")}
                </p>
                <p className="mt-1 text-xs font-medium text-brand-800">{c.estado}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: c.idCompra, estado: "Recibido" })}
                >
                  Marcar recibido
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: c.idCompra, estado: "Cancelado" })}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
