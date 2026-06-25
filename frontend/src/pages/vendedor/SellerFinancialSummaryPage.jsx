import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Banknote, BarChart3, CalendarDays, PackageCheck, ReceiptText, TrendingUp } from "lucide-react";
import { getSellerFinancialSummary } from "../../services/api/vendedor.api";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Loader } from "../../components/Loader.jsx";

function money(value) {
  return `$${Number(value || 0).toLocaleString("es-CO")}`;
}

function StatCard({ title, value, icon: Icon, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700"
  };
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
        </div>
        <span className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

export function SellerFinancialSummaryPage() {
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: ""
  });

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["sellerFinancialSummary", filters],
    queryFn: () => getSellerFinancialSummary(filters)
  });

  if (isLoading) return <Loader />;

  const byDate = summary?.byDate ?? [];
  const topProducts = summary?.topProducts ?? [];
  const maxIngresos = Math.max(...byDate.map((item) => Number(item.ingresos || 0)), 1);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0f172a_0%,#155e75_48%,#16a34a_100%)] px-6 py-8 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <BarChart3 className="h-3.5 w-3.5" />
            Dashboard financiero
          </p>
          <h1 className="mt-4 text-3xl font-bold">Resumen financiero</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            KPIs calculados desde pedidos reales de tu tienda: ingresos, margen, unidades vendidas y rendimiento por fecha.
          </p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Input
            label="Fecha inicio"
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => setFilters((prev) => ({ ...prev, fechaInicio: e.target.value }))}
          />
          <Input
            label="Fecha fin"
            type="date"
            value={filters.fechaFin}
            onChange={(e) => setFilters((prev) => ({ ...prev, fechaFin: e.target.value }))}
          />
        </div>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-red-600">No se pudo cargar el resumen financiero.</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Ingresos" value={money(summary?.totalIngresos)} icon={Banknote} tone="emerald" />
            <StatCard title="Ganancia" value={money(summary?.totalGanancias)} icon={TrendingUp} />
            <StatCard title="Pedidos" value={summary?.totalVentasCount ?? 0} icon={ReceiptText} tone="sky" />
            <StatCard title="Ticket promedio" value={money(summary?.ticketPromedio)} icon={CalendarDays} tone="amber" />
            <StatCard title="Unidades" value={summary?.unidadesVendidas ?? 0} icon={PackageCheck} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink">Ventas por fecha</h2>
                  <p className="text-sm text-slate-500">Ingresos diarios del periodo seleccionado.</p>
                </div>
              </div>
              {byDate.length ? (
                <div className="space-y-3">
                  {byDate.map((item) => (
                    <div key={item.fecha} className="grid gap-2 sm:grid-cols-[120px_1fr_110px] sm:items-center">
                      <span className="text-sm font-medium text-slate-600">
                        {new Date(item.fecha).toLocaleDateString("es-CO", { month: "short", day: "numeric" })}
                      </span>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${Math.max(6, (Number(item.ingresos || 0) / maxIngresos) * 100)}%` }}
                        />
                      </div>
                      <span className="text-right text-sm font-semibold text-ink">{money(item.ingresos)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No hay ventas registradas en este periodo.
                </div>
              )}
            </Card>

            <Card>
              <h2 className="font-semibold text-ink">Productos más vendidos</h2>
              <p className="mt-1 text-sm text-slate-500">Top por unidades vendidas.</p>
              <div className="mt-5 space-y-3">
                {topProducts.length ? (
                  topProducts.map((product, index) => (
                    <div key={product.idProducto} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            #{index + 1} {product.nombre}
                          </p>
                          <p className="text-xs text-slate-500">{product.unidades} unidades</p>
                        </div>
                        <span className="text-sm font-bold text-brand-700">{money(product.ingresos)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Aún no hay productos vendidos.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
