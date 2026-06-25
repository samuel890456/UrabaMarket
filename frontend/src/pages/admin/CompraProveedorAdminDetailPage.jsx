import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminSupplierPurchaseById, updateAdminSupplierPurchaseStatus } from "../../services/api/admin.api"; // Use dedicated API for purchase detail and status update
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

export function CompraProveedorAdminDetailPage() {
  const { idCompra } = useParams();
  const parsedIdCompra = Number(idCompra);
  const hasValidIdCompra = Number.isInteger(parsedIdCompra) && parsedIdCompra > 0;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: purchase, isLoading: isLoadingPurchase } = useQuery({
    queryKey: ["admin-supplier-purchase", idCompra],
    queryFn: () => getAdminSupplierPurchaseById(parsedIdCompra),
    enabled: hasValidIdCompra,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, estado }) => updateAdminSupplierPurchaseStatus(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-supplier-purchase", idCompra] });
      qc.invalidateQueries({ queryKey: ["admin-supplier-purchases"] });
      toast.success("Estado de la compra a proveedor actualizado.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al actualizar el estado de la compra a proveedor.");
    },
  });

  const purchaseStates = ["Pendiente", "Recibido", "Cancelado"];

  if (!hasValidIdCompra) return <div>ID de compra a proveedor inválido.</div>;
  if (isLoadingPurchase) return <Loader />;
  if (!purchase) return <div>Compra a proveedor no encontrada.</div>;

  const handleStatusChange = (newStatus) => {
    if (confirm(`¿Estás seguro de cambiar el estado de la compra a proveedor #${purchase.idCompra} a "${newStatus}"?`)) {
      updateStatusMutation.mutate({ id: purchase.idCompra, estado: newStatus });
    }
  };

  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink mb-4">Detalles de la Compra a Proveedor #{purchase.idCompra}</h2>
      <Card padding="md" className="max-w-3xl mx-auto">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Tienda:</p>
            <p className="text-lg text-gray-900">{purchase.nombre_tienda}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Proveedor:</p>
            <p className="text-lg text-gray-900">{purchase.nombre_proveedor} ({purchase.email_proveedor})</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Fecha de Compra:</p>
            <p className="text-lg text-gray-900">{format(new Date(purchase.fecha), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Total de la Compra:</p>
            <p className="text-lg text-gray-900">${Number(purchase.total).toLocaleString('es-CO')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Estado Actual:</p>
            <p className={`text-lg font-bold ${
                purchase.estado === 'Recibido' ? 'text-green-600' :
                purchase.estado === 'Cancelado' ? 'text-red-600' :
                'text-yellow-600'
            }`}>{purchase.estado}</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Cambiar Estado de la Compra</h3>
            <div className="flex items-center space-x-2">
              <Select value={purchase.estado} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar Estado" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseStates.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => updateStatusMutation.mutate({ id: purchase.idCompra, estado: purchase.estado })} disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? "Actualizando..." : "Guardar"}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Ítems de la Compra</h3>
            {purchase.detalles_items && purchase.detalles_items.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {purchase.detalles_items.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item.nombreItem || `Producto ID: ${item.idProductoVinculado}`} - {item.cantidad} x ${Number(item.precioMayoreo).toLocaleString('es-CO')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay ítems en esta compra.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
