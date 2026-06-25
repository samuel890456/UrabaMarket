import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "../../services/api/cliente.api";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import { Button } from "../../components/ui/Button";
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
      <div className="max-w-3xl animate-fade-in">
        <Breadcrumbs items={[{ to: "/cliente", label: "Cliente" }, { label: "Mis pedidos" }]} />
        <EmptyState
          icon={Package}
          title="Sin pedidos aún"
          description="Cuando compres, verás el historial aquí."
        >
          <Link to="/productos">
            <Button>Seguir comprando</Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumbs items={[{ to: "/cliente", label: "Cliente" }, { label: "Mis pedidos" }]} />
          <h2 className="text-2xl font-bold text-ink">Mis pedidos</h2>
        </div>
        <Link to="/productos">
          <Button variant="outline" size="sm">
            Seguir comprando
          </Button>
        </Link>
      </div>
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
