import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "../../services/api/cliente.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { Package } from "lucide-react";

export function PedidosClientePage() {
  const { data, isLoading } = useQuery({ queryKey: ["pedidos"], queryFn: getPedidos });

  if (isLoading) return <Loader />;

  const items = data ?? [];

  if (!items.length) {
    return (
      <EmptyState
        icon={Package}
        title="Sin pedidos aún"
        description="Cuando compres, verás el historial aquí."
      />
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Mis pedidos</h2>
      <div className="mt-6 space-y-3">
        {items.map((p) => (
          <Link key={p.idPedido} to={`/cliente/pedidos/${p.idPedido}`}>
            <Card className="transition-colors hover:border-brand-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">Pedido #{p.idPedido}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {p.estado}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {p.fecha ? new Date(p.fecha).toLocaleString("es-CO") : ""} · $
                {Number(p.total).toLocaleString("es-CO")}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
