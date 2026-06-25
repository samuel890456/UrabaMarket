import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCompraProveedor } from "../../services/api/proveedor.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";

export function CompraB2BDetallePage() {
  const { idCompra } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["compra-proveedor", idCompra],
    queryFn: () => getCompraProveedor(idCompra)
  });

  if (isLoading) return <Loader />;

  const compra = data?.compra;
  const detalles = data?.detalles ?? [];

  return (
    <div className="max-w-3xl animate-fade-in">
      <Link to="/proveedor/compras-b2b" className="text-sm font-medium text-brand-700 hover:underline">
        ← Volver
      </Link>
      <h2 className="mt-4 text-2xl font-bold text-ink">Compra #{compra?.idCompra}</h2>
      <p className="mt-1 text-slate-600">
        Estado: <span className="font-medium">{compra?.estado}</span> · Total: $
        {Number(compra?.total || 0).toLocaleString("es-CO")}
      </p>

      <div className="mt-6 space-y-2">
        {detalles.map((d) => (
          <Card key={d.idDetalleCompra} padding="sm">
            <p className="text-sm font-medium text-ink">
              {d.nombreItem ? d.nombreItem : `Item #${d.idDetalleCompra}`}
            </p>
            <p className="text-sm text-slate-500">
              Cantidad: {d.cantidad} · ${Number(d.precioMayoreo).toLocaleString("es-CO")} c/u
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

