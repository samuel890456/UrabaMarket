import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, PackageCheck } from "lucide-react";
import {
  getSellerExpiredProducts,
  getSellerLowStockProducts,
  getSellerSoonToExpireProducts
} from "../../services/api/vendedor.api";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Loader } from "../../components/Loader.jsx";

function ProductList({ items, emptyTitle, emptyDescription, tone = "slate" }) {
  if (!items?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className="py-10" />;
  }

  const toneClass = tone === "red" ? "text-red-600" : tone === "amber" ? "text-amber-600" : "text-slate-600";

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {items.map((product) => (
        <div key={product.idProducto} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-medium text-ink">{product.nombre}</p>
            <p className="text-xs text-slate-500">{product.marca || "Sin marca"}</p>
          </div>
          <p className={`text-sm font-semibold ${toneClass}`}>
            Stock {product.stock}
            {product.stockMinimo != null ? ` / mínimo ${product.stockMinimo}` : ""}
            {product.fechaVencimiento ? ` · vence ${new Date(product.fechaVencimiento).toLocaleDateString("es-CO")}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SellerInventoryPage() {
  const [daysToExpire, setDaysToExpire] = useState(30);

  const { data: lowStockProducts, isLoading: loadingLowStock } = useQuery({
    queryKey: ["sellerLowStockProducts"],
    queryFn: getSellerLowStockProducts
  });

  const { data: expiredProducts, isLoading: loadingExpired } = useQuery({
    queryKey: ["sellerExpiredProducts"],
    queryFn: getSellerExpiredProducts
  });

  const { data: soonToExpireProducts, isLoading: loadingSoonToExpire } = useQuery({
    queryKey: ["sellerSoonToExpireProducts", daysToExpire],
    queryFn: () => getSellerSoonToExpireProducts(daysToExpire)
  });

  if (loadingLowStock || loadingExpired || loadingSoonToExpire) return <Loader />;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Inventario</h1>
        <p className="mt-1 text-slate-600">Alertas de stock y vencimientos para tu tienda.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <AlertTriangle className="h-7 w-7 text-red-600" />
          <p className="mt-3 text-sm text-slate-500">Bajo stock</p>
          <p className="text-2xl font-bold text-ink">{lowStockProducts?.length ?? 0}</p>
        </Card>
        <Card>
          <CalendarClock className="h-7 w-7 text-amber-600" />
          <p className="mt-3 text-sm text-slate-500">Por vencer</p>
          <p className="text-2xl font-bold text-ink">{soonToExpireProducts?.length ?? 0}</p>
        </Card>
        <Card>
          <PackageCheck className="h-7 w-7 text-brand-600" />
          <p className="mt-3 text-sm text-slate-500">Vencidos</p>
          <p className="text-2xl font-bold text-ink">{expiredProducts?.length ?? 0}</p>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">Productos con bajo stock</h2>
        <ProductList
          items={lowStockProducts}
          emptyTitle="Sin alertas de stock"
          emptyDescription="Tus productos están por encima del stock mínimo."
          tone="red"
        />
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Próximos a vencer</h2>
          <Input
            className="w-28"
            label="Días"
            type="number"
            min="0"
            value={daysToExpire}
            onChange={(e) => setDaysToExpire(Number(e.target.value || 0))}
          />
        </div>
        <ProductList
          items={soonToExpireProducts}
          emptyTitle="Sin vencimientos próximos"
          emptyDescription="No hay productos dentro del rango seleccionado."
          tone="amber"
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">Productos vencidos</h2>
        <ProductList
          items={expiredProducts}
          emptyTitle="Sin productos vencidos"
          emptyDescription="No tienes productos vencidos registrados."
          tone="red"
        />
      </section>
    </div>
  );
}
