import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Search, ShoppingCart, Truck } from "lucide-react";
import {
  getCatalogoMayorista,
  getComprasMiTienda,
  postCompraProveedor,
  updateCompraProveedorEstado
} from "../../services/api/vendedor.api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DataTable } from "../../components/table/DataTable";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/Loader";

export function AbastecimientoB2BPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["catalogo-mayorista", q],
    queryFn: () => getCatalogoMayorista(q ? { q } : {})
  });

  const { data: compras } = useQuery({
    queryKey: ["compras-mi-tienda"],
    queryFn: getComprasMiTienda
  });

  const mutation = useMutation({
    mutationFn: () =>
      postCompraProveedor(
        Object.entries(cart)
          .filter(([, cantidad]) => Number(cantidad) > 0)
          .map(([idProductoMayorista, cantidad]) => ({
            idProductoMayorista: Number(idProductoMayorista),
            cantidad: Number(cantidad)
          }))
      ),
    onSuccess: () => {
      setCart({});
      qc.invalidateQueries({ queryKey: ["catalogo-mayorista"] });
      qc.invalidateQueries({ queryKey: ["compras-mi-tienda"] });
      toast.success("Solicitud enviada al proveedor");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo crear la compra")
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ idCompra, estado }) => updateCompraProveedorEstado(idCompra, estado),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["compras-mi-tienda"] });
      qc.invalidateQueries({ queryKey: ["productos", "mios"] });
      const creados = data?.productosTienda?.length ?? 0;
      toast.success(
        creados
          ? `Compra recibida. ${creados} producto${creados === 1 ? "" : "s"} actualizado${creados === 1 ? "" : "s"} en inventario.`
          : "Estado actualizado"
      );
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo actualizar la compra")
  });

  const productos = data?.items ?? [];
  const historial = compras ?? [];
  const openStatuses = new Set(["Pendiente", "Aceptado", "Enviado"]);
  const openProviderIds = new Set(
    historial
      .filter((compra) => openStatuses.has(compra.estado))
      .map((compra) => compra.idProveedor)
      .filter(Boolean)
  );
  const productsById = new Map(productos.map((producto) => [producto.idProductoMayorista, producto]));
  const selectedItems = Object.entries(cart)
    .filter(([, cantidad]) => Number(cantidad) > 0)
    .map(([idProductoMayorista, cantidad]) => ({
      producto: productsById.get(Number(idProductoMayorista)),
      cantidad: Number(cantidad)
    }))
    .filter((item) => item.producto);
  const selectedProviderIds = [...new Set(selectedItems.map((item) => item.producto.idProveedor))];
  const selectedCount = selectedItems.length;
  const hasOpenProvider = selectedProviderIds.some((idProveedor) => openProviderIds.has(idProveedor));
  const hasMixedProviders = selectedProviderIds.length > 1;
  const submitDisabled = !selectedCount || mutation.isPending || hasOpenProvider || hasMixedProviders;
  const submitMessage = hasMixedProviders
    ? "Selecciona productos de un solo proveedor por solicitud."
    : hasOpenProvider
      ? "Ya tienes una solicitud abierta con este proveedor."
      : "";

  const columns = useMemo(
    () => [
      {
        id: "producto",
        header: "Producto",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink">{row.original.nombre}</p>
            <p className="text-xs text-slate-500">
              {row.original.tipoProducto || "General"} · {row.original.marca || "Sin marca"}
              {row.original.modelo ? ` · ${row.original.modelo}` : ""}
            </p>
            {row.original.garantiaMeses ? (
              <p className="text-xs text-slate-500">Garantía: {row.original.garantiaMeses} meses</p>
            ) : null}
          </div>
        )
      },
      {
        id: "costo",
        header: "Costo",
        cell: ({ row }) => `$${Number(row.original.precioMayorista || 0).toLocaleString("es-CO")}`
      },
      { header: "Stock proveedor", accessorKey: "stockMayorista" },
      {
        id: "cantidad",
        header: "Comprar",
        cell: ({ row }) => {
          const id = row.original.idProductoMayorista;
          const isProviderLocked = openProviderIds.has(row.original.idProveedor);
          return (
            <div>
              <Input
                className="w-24"
                min="0"
                max={row.original.stockMayorista}
                type="number"
                disabled={isProviderLocked || mutation.isPending}
                value={cart[id] ?? ""}
                onChange={(e) => setCart((prev) => ({ ...prev, [id]: e.target.value }))}
              />
              {isProviderLocked ? (
                <p className="mt-1 text-xs font-medium text-amber-700">Solicitud abierta</p>
              ) : null}
            </div>
          );
        }
      }
    ],
    [cart, mutation.isPending, openProviderIds]
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Abastecimiento B2B</h2>
          <p className="mt-1 text-sm text-slate-600">Compra inventario al proveedor y véndelo con tu propio precio final.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar mayorista" />
          </div>
          <Button disabled={submitDisabled} onClick={() => mutation.mutate()}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Enviando..." : "Solicitar compra"}
          </Button>
        </div>
      </div>
      {submitMessage ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitMessage}</span>
        </div>
      ) : null}

      {isLoading ? <Loader /> : <DataTable data={productos} columns={columns} />}

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-brand-700" />
          <h3 className="font-semibold text-ink">Historial de abastecimiento</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {historial.slice(0, 6).map((compra) => (
            <div key={compra.idCompra} className="rounded-lg border border-slate-200 p-4">
              <p className="font-medium text-ink">Compra #{compra.idCompra}</p>
              <p className="mt-1 text-sm text-slate-500">{compra.nombreProveedor || "Proveedor"}</p>
              <p className="mt-2 text-sm font-semibold text-brand-800">{compra.estado}</p>
              <p className="text-sm text-slate-600">${Number(compra.total || 0).toLocaleString("es-CO")}</p>
              {compra.estado === "Enviado" ? (
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  type="button"
                  disabled={updateEstadoMutation.isPending}
                  onClick={() =>
                    updateEstadoMutation.mutate({ idCompra: compra.idCompra, estado: "Recibido" })
                  }
                >
                  Marcar recibido
                </Button>
              ) : null}
              {compra.estado === "Pendiente" ? (
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  variant="ghost"
                  type="button"
                  disabled={updateEstadoMutation.isPending}
                  onClick={() =>
                    updateEstadoMutation.mutate({ idCompra: compra.idCompra, estado: "Cancelado" })
                  }
                >
                  Cancelar solicitud
                </Button>
              ) : null}
            </div>
          ))}
          {!historial.length ? <p className="text-sm text-slate-500">Aún no tienes compras B2B.</p> : null}
        </div>
      </Card>
    </div>
  );
}
