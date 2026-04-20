import { useQuery } from "@tanstack/react-query";
import { getPedidosTienda } from "../../services/api/vendedor.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { BarChart3 } from "lucide-react";

export function VentasVendedorPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["pedidos-tienda"],
    queryFn: getPedidosTienda
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

  return (
    <div className="max-w-3xl animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Ventas</h2>
      <p className="mt-1 text-slate-600">Pedidos que incluyen productos de tu tienda.</p>
      <div className="mt-6 space-y-3">
        {items.map((p) => (
          <Card key={p.idPedido}>
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-medium">Pedido #{p.idPedido}</span>
              <span className="text-sm text-slate-500">{p.estado}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {p.fecha ? new Date(p.fecha).toLocaleString("es-CO") : ""} · Total pedido: $
              {Number(p.total).toLocaleString("es-CO")}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
