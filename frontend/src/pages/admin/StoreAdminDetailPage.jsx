import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  DollarSign,
  MapPin,
  Package,
  ReceiptText,
  ShoppingBag,
  Store,
  Truck,
  UserRound
} from "lucide-react";
import { getCategorias } from "../../services/api/catalog.api";
import { getAdminStoreById, updateAdminStore } from "../../services/api/admin.api";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select.jsx";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

const adminStoreSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional().nullable(),
  direccion: z.string().min(1, "La direccion es obligatoria"),
  activo: z.boolean().optional().default(true),
  idCategoria: z.coerce.number().int().positive().optional().nullable()
});

const tabs = [
  { key: "overview", label: "Resumen" },
  { key: "products", label: "Productos" },
  { key: "finance", label: "Finanzas" },
  { key: "b2b", label: "B2B" },
  { key: "activity", label: "Actividad" },
  { key: "settings", label: "Gestion" }
];

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("es-CO");

export function StoreAdminDetailPage() {
  const { idTienda } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-store-detail", idTienda],
    queryFn: () => getAdminStoreById(Number(idTienda)),
    enabled: !!idTienda
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias
  });

  const updateMutation = useMutation({
    mutationFn: (body) => updateAdminStore(Number(idTienda), body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-store-detail", idTienda] });
      qc.invalidateQueries({ queryKey: ["admin-tiendas"] });
      toast.success("Tienda actualizada correctamente.");
    },
    onError: (error) => toast.error(error.response?.data?.message || "No se pudo actualizar la tienda.")
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(adminStoreSchema),
    defaultValues: { nombre: "", descripcion: "", direccion: "", activo: true, idCategoria: null }
  });

  const store = data?.store;
  const metrics = data?.metrics ?? {};
  const products = data?.products ?? [];

  useEffect(() => {
    if (!store) return;
    reset({
      nombre: store.nombre ?? "",
      descripcion: store.descripcion ?? "",
      direccion: store.direccion ?? "",
      activo: !!store.activo,
      idCategoria: store.idCategoria ?? null
    });
  }, [store, reset]);

  const topProducts = useMemo(
    () => [...products].sort((a, b) => (b.ingresos || 0) - (a.ingresos || 0)).slice(0, 6),
    [products]
  );

  if (isLoading) return <StoreDetailSkeleton />;
  if (isError || !store) {
    return <EmptyState icon={Store} title="Tienda no encontrada" description="No fue posible cargar el detalle administrativo de esta tienda." />;
  }

  const logo = resolveAssetUrl(store.logoUrl);
  const banner = resolveAssetUrl(store.bannerUrl);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/admin/tiendas" className="inline-flex items-center gap-1 hover:text-brand-700">
              <ArrowLeft className="h-4 w-4" />
              Tiendas
            </Link>
            <span>/</span>
            <span>{store.nombre}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-ink md:text-3xl">{store.nombre}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/tiendas/${store.idTienda}/catalogo`}>Ver storefront</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to={`/admin/stores/${store.idTienda}/products`}>Gestionar productos</Link>
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="relative h-48 bg-slate-900 md:h-64">
          {banner ? <img src={banner} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[linear-gradient(135deg,#0f172a,#115e59,#16a34a)]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Store className="h-9 w-9 text-slate-400" />}
              </div>
              <div className="pb-1 text-white">
                <StatusBadge active={store.activo} />
                <p className="mt-2 max-w-2xl text-sm text-white/85">{store.descripcion || "Sin descripcion registrada."}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-4">
          <InfoPill icon={Building2} label="Categoria" value={store.categoriaNombre || "Sin categoria"} />
          <InfoPill icon={MapPin} label="Ubicacion" value={[store.ciudad, store.direccion].filter(Boolean).join(" - ") || "Sin direccion"} />
          <InfoPill icon={CalendarDays} label="Creada" value={formatDate(store.createdAt)} />
          <InfoPill icon={UserRound} label="Vendedor" value={store.vendedor?.nombre || "Sin responsable"} to={`/admin/users/${store.vendedor?.idUsuario}`} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={DollarSign} label="Ingresos" value={currency.format(metrics.ingresos || 0)} hint={`${number.format(metrics.pedidosCompletados || 0)} pedidos completados`} />
        <MetricCard icon={ShoppingBag} label="Ventas" value={number.format(metrics.ventasTotales || 0)} hint={`Ticket ${currency.format(metrics.ticketPromedio || 0)}`} />
        <MetricCard icon={Package} label="Productos" value={number.format(metrics.productosTotales || 0)} hint={`${metrics.productosActivos || 0} activos / ${metrics.productosInactivos || 0} inactivos`} />
        <MetricCard icon={Truck} label="Abastecimiento B2B" value={currency.format(metrics.abastecimientoTotal || 0)} hint={`${number.format(metrics.comprasB2B || 0)} compras a proveedores`} />
      </div>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-card">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${activeTab === tab.key ? "bg-slate-950 text-white shadow-soft" : "text-slate-600 hover:bg-slate-100 hover:text-ink"}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? <OverviewTab data={data} topProducts={topProducts} /> : null}
      {activeTab === "products" ? <ProductsTab products={products} storeId={store.idTienda} /> : null}
      {activeTab === "finance" ? <FinanceTab financial={data.financial} metrics={metrics} /> : null}
      {activeTab === "b2b" ? <B2BTab b2b={data.b2b} /> : null}
      {activeTab === "activity" ? <ActivityTab recent={data.recent} /> : null}
      {activeTab === "settings" ? (
        <SettingsTab
          categorias={categorias}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={(vals) => updateMutation.mutate(vals)}
          register={register}
          setValue={setValue}
          watch={watch}
          isPending={updateMutation.isPending}
        />
      ) : null}
    </div>
  );
}

function OverviewTab({ data, topProducts }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Card className="min-h-[320px]">
        <SectionTitle title="Ingresos recientes" subtitle="Ventas de la tienda por fecha" />
        <RevenueChart data={data.financial.byDate} />
      </Card>
      <Card>
        <SectionTitle title="Productos destacados" subtitle="Mayor ingreso registrado" />
        <div className="mt-4 space-y-3">
          {topProducts.length ? topProducts.map((product) => <ProductMini key={product.idProducto} product={product} />) : <CompactEmpty text="Aun no hay ventas por producto." />}
        </div>
      </Card>
    </div>
  );
}

function ProductsTab({ products, storeId }) {
  if (!products.length) return <EmptyState icon={Package} title="Sin productos" description="Esta tienda todavia no tiene productos registrados." />;
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <SectionTitle title="Catalogo completo" subtitle={`${products.length} productos activos e inactivos`} />
        <Button asChild variant="outline" size="sm"><Link to={`/admin/stores/${storeId}/products`}>Abrir gestion completa</Link></Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Producto</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-right">Precio</th>
              <th className="px-5 py-3 text-right">Stock</th>
              <th className="px-5 py-3 text-right">Visitas</th>
              <th className="px-5 py-3 text-right">Ventas</th>
              <th className="px-5 py-3 text-right">Ingresos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.idProducto} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                      {product.imagenPrincipal ? <img src={resolveAssetUrl(product.imagenPrincipal)} alt="" className="h-full w-full object-cover" /> : null}
                    </div>
                    <div>
                      <Link to={`/admin/products/${product.idProducto}`} className="font-semibold text-ink hover:text-brand-700">{product.nombre}</Link>
                      <p className="text-xs text-slate-500">{product.categoriaNombre || product.marca || "Sin categoria"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><ProductStatus active={product.activo} /></td>
                <td className="px-5 py-4 text-right font-semibold">{currency.format(product.precio || 0)}</td>
                <td className="px-5 py-4 text-right">{number.format(product.stock || 0)}</td>
                <td className="px-5 py-4 text-right">{number.format(product.visitas || 0)}</td>
                <td className="px-5 py-4 text-right">{number.format(product.vendidosTotales || 0)}</td>
                <td className="px-5 py-4 text-right font-semibold">{currency.format(product.ingresos || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FinanceTab({ financial, metrics }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <SectionTitle title="Ventas e ingresos" subtitle="Evolucion por dia" />
        <RevenueChart data={financial.byDate} />
      </Card>
      <Card>
        <SectionTitle title="Pedidos por estado" subtitle="Distribucion operacional" />
        <StatusChart data={financial.byStatus} />
        <div className="mt-5 grid gap-3">
          <InfoPill icon={ReceiptText} label="Pedidos totales" value={number.format(metrics.pedidosTotales || 0)} />
          <InfoPill icon={BadgeCheck} label="Completados" value={number.format(metrics.pedidosCompletados || 0)} />
          <InfoPill icon={DollarSign} label="Margen estimado" value={currency.format(metrics.margenEstimado || 0)} />
        </div>
      </Card>
    </div>
  );
}

function B2BTab({ b2b }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <Card>
        <SectionTitle title="Estados B2B" subtitle="Compras a proveedores" />
        <StatusChart data={b2b.byStatus.map((item) => ({ estado: item.estado, pedidos: item.compras, total: item.total }))} />
      </Card>
      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <SectionTitle title="Solicitudes y compras" subtitle="Ultimas operaciones de abastecimiento" />
        </div>
        {b2b.purchases.length ? (
          <div className="divide-y divide-slate-100">
            {b2b.purchases.map((purchase) => (
              <div key={purchase.idCompra} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-slate-50">
                <div>
                  <Link to={`/admin/compras-proveedor/${purchase.idCompra}`} className="font-semibold text-ink hover:text-brand-700">Compra B2B #{purchase.idCompra}</Link>
                  <p className="text-sm text-slate-500">
                    <Link to={`/admin/users/${purchase.idUsuarioProveedor}`} className="hover:text-brand-700">{purchase.nombreProveedor || "Proveedor"}</Link>
                    {" · "}
                    {purchase.items} items · {formatDate(purchase.fecha)}
                  </p>
                </div>
                <div className="text-right">
                  <StateBadge state={purchase.estado} />
                  <p className="mt-1 font-semibold">{currency.format(purchase.total || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <CompactEmpty text="No hay abastecimiento B2B relacionado." />}
      </Card>
    </div>
  );
}

function ActivityTab({ recent }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <ActivityList title="Ultimos productos" items={recent.products} empty="Sin productos recientes" render={(item) => (
        <>
          <Link to={`/admin/products/${item.idProducto}`} className="font-semibold hover:text-brand-700">{item.nombre}</Link>
          <p className="text-xs text-slate-500">{formatDate(item.createdAt)} · Stock {item.stock}</p>
        </>
      )} />
      <ActivityList title="Ultimos pedidos" items={recent.orders} empty="Sin pedidos recientes" render={(item) => (
        <>
          <Link to={`/admin/pedidos/${item.idPedido}`} className="font-semibold hover:text-brand-700">Pedido #{item.idPedido}</Link>
          <p className="text-xs text-slate-500">{item.cliente || "Cliente"} · {currency.format(item.total || 0)}</p>
        </>
      )} />
      <ActivityList title="Movimientos de inventario" items={recent.movements} empty="Sin movimientos recientes" render={(item) => (
        <>
          <p className="font-semibold">{item.nombreProducto || `Producto #${item.idProducto}`}</p>
          <p className="text-xs text-slate-500">{item.tipo} · {item.cantidad} unidades · {formatDate(item.createdAt)}</p>
        </>
      )} />
    </div>
  );
}

function SettingsTab({ categorias, errors, handleSubmit, onSubmit, register, setValue, watch, isPending }) {
  return (
    <Card className="max-w-4xl">
      <SectionTitle title="Gestion administrativa" subtitle="Datos comerciales y visibilidad de la tienda" />
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
        <Input label="Nombre" error={errors.nombre?.message} {...register("nombre")} />
        <Input label="Direccion" error={errors.direccion?.message} {...register("direccion")} />
        <div className="md:col-span-2">
          <Input label="Descripcion" error={errors.descripcion?.message} {...register("descripcion")} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
          <Select value={watch("idCategoria") ? String(watch("idCategoria")) : ""} onValueChange={(val) => setValue("idCategoria", val ? Number(val) : null)}>
            <SelectTrigger className="w-full" />
            <SelectValue placeholder="Selecciona una categoria" />
            <SelectContent>
              <SelectItem value="">Sin categoria</SelectItem>
              {categorias.map((cat) => <SelectItem key={cat.idCategoria} value={String(cat.idCategoria)}>{cat.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" {...register("activo")} />
          Tienda visible y activa
        </label>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar cambios"}</Button>
        </div>
      </form>
    </Card>
  );
}

function RevenueChart({ data }) {
  const chartData = data.length ? data : [{ fecha: "Sin datos", ingresos: 0, pedidos: 0 }];
  return (
    <div className="mt-5 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="fecha" tick={{ fontSize: 12 }} tickFormatter={shortDate} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => currency.format(value).replace(",00", "")} width={82} />
          <Tooltip formatter={(value, name) => [name === "ingresos" ? currency.format(value) : value, name]} labelFormatter={formatDate} />
          <Area type="monotone" dataKey="ingresos" stroke="#16a34a" strokeWidth={3} fill="url(#revenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusChart({ data }) {
  const chartData = data.length ? data : [{ estado: "Sin datos", pedidos: 0 }];
  return (
    <div className="mt-5 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="pedidos" fill="#0f172a" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, hint }) {
  return (
    <Card className="rounded-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="rounded-xl bg-slate-950 p-3 text-white"><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );
}

function InfoPill({ icon: Icon, label, value, to }) {
  const content = (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-brand-700" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-ink">{value || "N/A"}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function ProductMini({ product }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{product.nombre}</p>
        <p className="text-xs text-slate-500">{number.format(product.unidadesVendidasPeriodo || 0)} unidades · {number.format(product.visitas || 0)} visitas</p>
      </div>
      <p className="shrink-0 font-bold text-brand-700">{currency.format(product.ingresos || 0)}</p>
    </div>
  );
}

function ActivityList({ title, items, empty, render }) {
  return (
    <Card>
      <SectionTitle title={title} subtitle="Actividad reciente" />
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item, index) => (
          <div key={item.idProducto || item.idPedido || item.idMovimiento || index} className="rounded-xl border border-slate-100 p-3 text-sm">
            {render(item)}
          </div>
        )) : <CompactEmpty text={empty} />}
      </div>
    </Card>
  );
}

function StatusBadge({ active }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{active ? "Activa" : "Inactiva"}</span>;
}

function ProductStatus({ active }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{active ? "Activo" : "Inactivo"}</span>;
}

function StateBadge({ state }) {
  const tone = state === "Cancelado" || state === "Rechazado" ? "bg-rose-100 text-rose-800" : state === "Completado" || state === "Recibido" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{state}</span>;
}

function CompactEmpty({ text }) {
  return <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">{text}</div>;
}

function StoreDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value));
}

function shortDate(value) {
  if (!value || value === "Sin datos") return value;
  return new Intl.DateTimeFormat("es-CO", { month: "short", day: "numeric" }).format(new Date(value));
}
