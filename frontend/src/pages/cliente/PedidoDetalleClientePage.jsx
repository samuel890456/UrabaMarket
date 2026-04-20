import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPedido } from "../../services/api/cliente.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";

export function PedidoDetalleClientePage() {
  const { idPedido } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["pedido", idPedido],
    queryFn: () => getPedido(idPedido)
  });

  if (isLoading) return <Loader />;

  const pedido = data?.pedido;
  const detalles = data?.detalles ?? [];

  return (
    <div className="max-w-2xl animate-fade-in">
      <Link to="/cliente/pedidos" className="text-sm text-brand-700 hover:underline">
        ← Volver a pedidos
      </Link>
      <h2 className="mt-4 text-2xl font-bold text-ink">Pedido #{pedido?.idPedido}</h2>
      <p className="text-slate-600">
        Estado: {pedido?.estado} · Total: ${Number(pedido?.total).toLocaleString("es-CO")}
      </p>
      <div className="mt-6 space-y-2">
        {detalles.map((d) => (
          <Card key={d.idDetalle} padding="sm">
            <p className="text-sm font-medium">Producto #{d.idProducto}</p>
            <p className="text-sm text-slate-500">
              Cantidad: {d.cantidad} · ${Number(d.precioUnitario).toLocaleString("es-CO")} c/u
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
