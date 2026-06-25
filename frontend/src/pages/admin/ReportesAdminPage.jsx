import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrders, getAdminSupplierPurchases, getUsuarios, getTiendasAdmin } from "../../services/api/admin.api";
import { Card } from "../../components/ui/Card.jsx";
import { Loader } from "../../components/Loader.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";
import { useState } from "react";
import { Search, ShoppingCart, Truck, Ban, CheckCircle } from "lucide-react";
import { format } from 'date-fns';

export function ReportesAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "pedidos"; // Default to 'pedidos'

  const handleTabChange = (tab) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", tab);
    setSearchParams(nextSearchParams);
  };

  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink">Reportes y Gestión Avanzada</h2>
      <p className="mt-1 text-slate-600">Gestión de ventas (pedidos) y compras a proveedores</p>

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => handleTabChange("pedidos")}
              className={`${
                currentTab === "pedidos"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Gestión de Pedidos
            </button>
            <button
              onClick={() => handleTabChange("compras")}
              className={`${
                currentTab === "compras"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Gestión de Compras a Proveedores
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {currentTab === "pedidos" && <OrderListAdmin />}
          {currentTab === "compras" && <SupplierPurchaseListAdmin />}
        </div>
      </div>
    </div>
  );
}

// Sub-component for Admin Order List
function OrderListAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const idUsuario = searchParams.get("idUsuario") || "";
  const estado = searchParams.get("estado") || "";
  const fechaInicio = searchParams.get("fechaInicio") || "";
  const fechaFin = searchParams.get("fechaFin") || "";
  const sortBy = searchParams.get("sortBy") || "fecha";
  const sortOrder = searchParams.get("sortOrder") || "DESC";

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["admin-orders", idUsuario, estado, fechaInicio, fechaFin, sortBy, sortOrder, page, limit],
    queryFn: () =>
      getAdminOrders({
        idUsuario: idUsuario || undefined,
        estado: estado || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      }),
  });

  const orders = ordersData?.items ?? [];
  const totalPages = ordersData?.meta?.totalPages ?? 0;

  function applyFilters(e) {
    e.preventDefault();
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", "pedidos"); // Ensure tab remains pedidos

    if (idUsuario) nextSearchParams.set("idUsuario", idUsuario); else nextSearchParams.delete("idUsuario");
    if (estado) nextSearchParams.set("estado", estado); else nextSearchParams.delete("estado");
    if (fechaInicio) nextSearchParams.set("fechaInicio", fechaInicio); else nextSearchParams.delete("fechaInicio");
    if (fechaFin) nextSearchParams.set("fechaFin", fechaFin); else nextSearchParams.delete("fechaFin");
    nextSearchParams.set("sortBy", sortBy);
    nextSearchParams.set("sortOrder", sortOrder);
    nextSearchParams.set("page", "1");
    nextSearchParams.set("limit", String(limit));
    setSearchParams(nextSearchParams);
  }

  function handlePageChange(newPage) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", String(newPage));
    setSearchParams(nextSearchParams);
  }

  // Fetch users for filter dropdown (if needed)
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users-all"],
    queryFn: () => getUsuarios({ limit: 9999 }),
  });

  const orderStates = ["Pendiente", "Pagado", "En Proceso", "Completado", "Cancelado"];

  if (isLoadingOrders || isLoadingUsers) return <Loader className="mt-8" />;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Listado de Pedidos</h3>
      <form onSubmit={applyFilters} className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="idUsuario" className="block text-sm font-medium text-gray-700">Usuario</label>
          <Select value={idUsuario} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("idUsuario", val); else nextSearchParams.delete("idUsuario");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los usuarios</SelectItem>
              {users?.items.map((user) => (
                <SelectItem key={user.idUsuario} value={String(user.idUsuario)}>
                  {user.nombre} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
          <Select value={estado} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("estado", val); else nextSearchParams.delete("estado");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              {orderStates.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Input type="date" label="Fecha Inicio" value={fechaInicio} onChange={(e) => {
            const nextSearchParams = new URLSearchParams(searchParams);
            if (e.target.value) nextSearchParams.set("fechaInicio", e.target.value); else nextSearchParams.delete("fechaInicio");
            nextSearchParams.set("page", "1");
            setSearchParams(nextSearchParams);
          }} />
        </div>
        <div>
          <Input type="date" label="Fecha Fin" value={fechaFin} onChange={(e) => {
            const nextSearchParams = new URLSearchParams(searchParams);
            if (e.target.value) nextSearchParams.set("fechaFin", e.target.value); else nextSearchParams.delete("fechaFin");
            nextSearchParams.set("page", "1");
            setSearchParams(nextSearchParams);
          }} />
        </div>

        <Button type="submit" className="md:col-span-2 lg:col-span-4">
          <Search className="mr-2 h-4 w-4" /> Aplicar Filtros
        </Button>
      </form>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Sin pedidos" description="No se encontraron pedidos con los filtros aplicados." />
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order, index) => (
            <Card key={`pedido-${order.idPedido ?? index}`} padding="sm">
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-medium">Pedido #{order.idPedido} de {order.nombre_usuario}</span>
                  <span className="text-sm text-slate-500">{order.email_usuario}</span>
                  <span className="text-xs text-slate-400">Fecha: {format(new Date(order.fecha), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-lg text-brand-700">Total: ${Number(order.total).toLocaleString('es-CO')}</span>
                  <span className="text-sm text-green-600">Ganancia: ${Number(order.ganancia_pedido).toLocaleString('es-CO')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      order.estado === 'Cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}>{order.estado}</span>
                </div>
              </div>
              <div className="mt-2 text-right">
                <Link to={`/admin/pedidos/${order.idPedido}`} className="text-sm font-medium text-indigo-600 hover:underline">
                  Ver Detalles
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <Button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} variant="outline">
            Anterior
          </Button>
          <span className="flex items-center text-sm font-medium text-gray-700">
            Página {page} de {totalPages}
          </span>
          <Button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} variant="outline">
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

// Sub-component for Admin Supplier Purchase List
function SupplierPurchaseListAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const idTienda = searchParams.get("idTienda") || "";
  const idUsuarioProveedor = searchParams.get("idUsuarioProveedor") || "";
  const estado = searchParams.get("estado") || "";
  const fechaInicio = searchParams.get("fechaInicio") || "";
  const fechaFin = searchParams.get("fechaFin") || "";
  const sortBy = searchParams.get("sortBy") || "fecha";
  const sortOrder = searchParams.get("sortOrder") || "DESC";

  const { data: purchasesData, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ["admin-supplier-purchases", idTienda, idUsuarioProveedor, estado, fechaInicio, fechaFin, sortBy, sortOrder, page, limit],
    queryFn: () =>
      getAdminSupplierPurchases({
        idTienda: idTienda || undefined,
        idUsuarioProveedor: idUsuarioProveedor || undefined,
        estado: estado || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      }),
  });

  const purchases = purchasesData?.items ?? [];
  const totalPages = purchasesData?.meta?.totalPages ?? 0;

  function applyFilters(e) {
    e.preventDefault();
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", "compras"); // Ensure tab remains compras

    if (idTienda) nextSearchParams.set("idTienda", idTienda); else nextSearchParams.delete("idTienda");
    if (idUsuarioProveedor) nextSearchParams.set("idUsuarioProveedor", idUsuarioProveedor); else nextSearchParams.delete("idUsuarioProveedor");
    if (estado) nextSearchParams.set("estado", estado); else nextSearchParams.delete("estado");
    if (fechaInicio) nextSearchParams.set("fechaInicio", fechaInicio); else nextSearchParams.delete("fechaInicio");
    if (fechaFin) nextSearchParams.set("fechaFin", fechaFin); else nextSearchParams.delete("fechaFin");
    nextSearchParams.set("sortBy", sortBy);
    nextSearchParams.set("sortOrder", sortOrder);
    nextSearchParams.set("page", "1");
    setSearchParams(nextSearchParams);
  }

  function handlePageChange(newPage) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", String(newPage));
    setSearchParams(nextSearchParams);
  }

  // Fetch users (suppliers) and stores for filter dropdowns
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users-all-suppliers"],
    queryFn: () => getUsuarios({ rol: "Proveedor", limit: 9999 }),
  });

  const { data: tiendas, isLoading: isLoadingTiendas } = useQuery({
    queryKey: ["admin-tiendas-all"],
    queryFn: () => getTiendasAdmin({ limit: 9999 }),
  });

  const purchaseStates = ["Pendiente", "Aceptado", "Rechazado", "Enviado", "Recibido", "Cancelado"];

  if (isLoadingPurchases || isLoadingUsers || isLoadingTiendas) return <Loader className="mt-8" />;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Listado de Compras a Proveedores</h3>
      <form onSubmit={applyFilters} className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="idTienda" className="block text-sm font-medium text-gray-700">Tienda Compradora</label>
          <Select value={idTienda} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("idTienda", val); else nextSearchParams.delete("idTienda");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las tiendas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las tiendas</SelectItem>
              {tiendas?.items.map((store) => (
                <SelectItem key={store.idTienda} value={String(store.idTienda)}>
                  {store.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="idUsuarioProveedor" className="block text-sm font-medium text-gray-700">Proveedor</label>
          <Select value={idUsuarioProveedor} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("idUsuarioProveedor", val); else nextSearchParams.delete("idUsuarioProveedor");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los proveedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los proveedores</SelectItem>
              {users?.items.map((user) => (
                <SelectItem key={user.idUsuario} value={String(user.idUsuario)}>
                  {user.nombre} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
          <Select value={estado} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("estado", val); else nextSearchParams.delete("estado");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              {purchaseStates.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Input type="date" label="Fecha Inicio" value={fechaInicio} onChange={(e) => {
            const nextSearchParams = new URLSearchParams(searchParams);
            if (e.target.value) nextSearchParams.set("fechaInicio", e.target.value); else nextSearchParams.delete("fechaInicio");
            nextSearchParams.set("page", "1");
            setSearchParams(nextSearchParams);
          }} />
        </div>
        <div>
          <Input type="date" label="Fecha Fin" value={fechaFin} onChange={(e) => {
            const nextSearchParams = new URLSearchParams(searchParams);
            if (e.target.value) nextSearchParams.set("fechaFin", e.target.value); else nextSearchParams.delete("fechaFin");
            nextSearchParams.set("page", "1");
            setSearchParams(nextSearchParams);
          }} />
        </div>

        <Button type="submit" className="md:col-span-2 lg:col-span-4">
          <Search className="mr-2 h-4 w-4" /> Aplicar Filtros
        </Button>
      </form>

      {purchases.length === 0 ? (
        <EmptyState icon={Truck} title="Sin compras a proveedores" description="No se encontraron compras con los filtros aplicados." />
      ) : (
        <div className="mt-8 space-y-3">
          {purchases.map((purchase, index) => (
            <Card key={`compra-${purchase.idCompra ?? purchase.idcompra ?? index}`} padding="sm">
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-medium">Compra #{purchase.idCompra ?? purchase.idcompra} por {purchase.nombreTienda ?? purchase.nombre_tienda}</span>
                  <span className="text-sm text-slate-500">Proveedor: {purchase.nombreProveedor ?? purchase.nombre_proveedor} ({purchase.emailProveedor ?? purchase.email_proveedor})</span>
                  <span className="text-xs text-slate-400">Fecha: {format(new Date(purchase.fecha), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-lg text-brand-700">Total: ${Number(purchase.total).toLocaleString('es-CO')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      purchase.estado === 'Recibido' ? 'bg-green-100 text-green-800' :
                      purchase.estado === 'Cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}>{purchase.estado}</span>
                </div>
              </div>
              <div className="mt-2 text-right">
                <Link to={`/admin/compras-proveedor/${purchase.idCompra ?? purchase.idcompra}`} className="text-sm font-medium text-indigo-600 hover:underline">
                  Ver Detalles
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <Button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} variant="outline">
            Anterior
          </Button>
          <span className="flex items-center text-sm font-medium text-gray-700">
            Página {page} de {totalPages}
          </span>
          <Button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} variant="outline">
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
