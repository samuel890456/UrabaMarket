import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getPedidosTienda, updatePedidoEstado } from "../../services/api/vendedor.api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { BarChart3, Eye } from "lucide-react";

export function VentasVendedorPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pedidos-tienda"],
    queryFn: getPedidosTienda
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ idPedido, estado }) => updatePedidoEstado(idPedido, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-tienda"] });
      toast.success("Estado actualizado");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error al actualizar")
  });

  if (isLoading) return <Loader />;

  const items = data ?? [];

  if (!items.length) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Sin ventas aún"
        description="Cuando un cliente compre productos de tu tienda, aparecerán aquí."
      />
    );
  }

  const handleEstadoChange = (idPedido, newEstado) => {
    updateEstadoMutation.mutate({ idPedido, estado: newEstado });
  };

  const estadosPosibles = ['Pendiente', 'Pagado', 'En Proceso', 'Completado', 'Cancelado'];
  const updatingId = updateEstadoMutation.variables?.idPedido;

  return (
    <div className="max-w-3xl animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Ventas</h2>
      <p className="mt-1 text-slate-600">Pedidos que incluyen productos de tu tienda.</p>
      <div className="mt-6 space-y-3">
        {items.map((p) => (
          <Card key={p.idPedido}>
            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Pedido #{p.idPedido}</span>
                <Link to={`/vendedor/ventas/${p.idPedido}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                  </Button>
                </Link>
              </div>
              {/* Dropdown para el estado del pedido */}
              <select
                value={p.estado}
                onChange={(e) => handleEstadoChange(p.idPedido, e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={updateEstadoMutation.isPending && updatingId === p.idPedido}
              >
                {estadosPosibles.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {p.fecha ? new Date(p.fecha).toLocaleString("es-CO") : ""} · Total pedido: $
              {Number(p.total).toLocaleString("es-CO")}
            </p>
            {updateEstadoMutation.isPending && updatingId === p.idPedido && (
                <p className="text-blue-500 text-sm mt-1">Actualizando estado...</p>
            )}
            {updateEstadoMutation.isError && updatingId === p.idPedido && (
                <p className="text-red-500 text-sm mt-1">Error al actualizar.</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
