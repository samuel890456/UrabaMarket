import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminOrderById, updateAdminOrderStatus } from "../../services/api/admin.api"; // Use dedicated API for order detail and status update
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { Button } from "../../components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";
import { useEffect } from "react";
import { toast } from "sonner";
import { format } from 'date-fns';

export function PedidoAdminDetailPage() {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["admin-order", idPedido],
    queryFn: () => getAdminOrderById(Number(idPedido)),
    enabled: !!idPedido,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, estado }) => updateAdminOrderStatus(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", idPedido] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] }); // Invalidate list for consistency
      toast.success("Estado del pedido actualizado.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al actualizar el estado del pedido.");
    },
  });

  const orderStates = ["Pendiente", "Pagado", "En Proceso", "Completado", "Cancelado"];

  if (isLoadingOrder) return <Loader />;
  if (!order) return <div>Pedido no encontrado.</div>;

  const handleStatusChange = (newStatus) => {
    if (confirm(`¿Estás seguro de cambiar el estado del pedido #${order.idPedido} a "${newStatus}"?`)) {
      updateStatusMutation.mutate({ id: order.idPedido, estado: newStatus });
    }
  };

  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink mb-4">Detalles del Pedido #{order.idPedido}</h2>
      <Card padding="md" className="max-w-3xl mx-auto">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Cliente:</p>
            <p className="text-lg text-gray-900">{order.nombre_usuario} ({order.email_usuario})</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Fecha del Pedido:</p>
            <p className="text-lg text-gray-900">{format(new Date(order.fecha), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Total del Pedido:</p>
            <p className="text-lg text-gray-900">${Number(order.total).toLocaleString('es-CO')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Ganancia Estimada:</p>
            <p className="text-lg text-gray-900 text-green-600">${Number(order.ganancia_pedido).toLocaleString('es-CO')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Estado Actual:</p>
            <p className={`text-lg font-bold ${
                order.estado === 'Completado' ? 'text-green-600' :
                order.estado === 'Cancelado' ? 'text-red-600' :
                'text-yellow-600'
            }`}>{order.estado}</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Cambiar Estado del Pedido</h3>
            <div className="flex items-center space-x-2">
              <Select value={order.estado} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar Estado" />
                </SelectTrigger>
                <SelectContent>
                  {orderStates.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => updateStatusMutation.mutate({ id: order.idPedido, estado: order.estado })} disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? "Actualizando..." : "Guardar"}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Ítems del Pedido</h3>
            {order.detalles_items && order.detalles_items.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {order.detalles_items.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item.nombreProducto || `Producto ID: ${item.idProducto}`} - {item.cantidad} x ${Number(item.precioUnitario).toLocaleString('es-CO')} (Costo: ${Number(item.costoUnitario).toLocaleString('es-CO')}) - Ganancia: ${Number(item.ganancia).toLocaleString('es-CO')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay ítems en este pedido.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
