import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, MapPin, Package, Plus, ShieldCheck } from "lucide-react";
import { getCarrito, getDirecciones, postCheckout, postDireccion } from "../../services/api/cliente.api";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { Input } from "../../components/ui/Input";
import { LocationSelects } from "../../components/location/LocationSelects";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

const quickAddressSchema = z.object({
  direccion: z.string().min(1, "Direccion requerida"),
  ciudad: z.string().min(1, "Selecciona una ciudad"),
  departamento: z.string().optional(),
  pais: z.string().optional(),
  paisIso2: z.string().optional(),
  departamentoIso2: z.string().optional(),
  esPrincipal: z.boolean().optional()
});

export function CheckoutClientePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [idDir, setIdDir] = useState("");
  const [quickAddressOpen, setQuickAddressOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(quickAddressSchema),
    defaultValues: { direccion: "", ciudad: "", departamento: "", pais: "Colombia", paisIso2: "CO", departamentoIso2: "", esPrincipal: false }
  });
  const quickAddress = watch();

  const { data: dirs, isLoading } = useQuery({
    queryKey: ["direcciones"],
    queryFn: getDirecciones
  });

  const { data: carrito, isLoading: lc } = useQuery({
    queryKey: ["carrito"],
    queryFn: getCarrito
  });

  const mutation = useMutation({
    mutationFn: postCheckout,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["carrito"] });
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      toast.success("Pedido realizado");
      navigate(data?.pedido?.idPedido ? `/cliente/pedidos/${data.pedido.idPedido}` : "/cliente/pedidos");
    },
    onError: (e) => {
      queryClient.invalidateQueries({ queryKey: ["carrito"] });
      toast.error(e.response?.data?.message || "No se pudo completar la compra");
    }
  });

  const createAddressMutation = useMutation({
    mutationFn: postDireccion,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["direcciones"] });
      setIdDir(String(created?.idDireccion ?? ""));
      setQuickAddressOpen(false);
      reset();
      toast.success("Direccion agregada");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo guardar la direccion")
  });

  if (isLoading || lc) return <Loader />;

  const items = carrito?.items ?? [];
  const total = Number(carrito?.total ?? 0);
  const subtotal = Number(carrito?.subtotal ?? Math.round(total / 1.19));
  const iva = Number(carrito?.iva ?? total - subtotal);
  const tieneProblemas = Boolean(carrito?.tieneProblemas);
  const selectedDir = dirs?.find((dir) => String(dir.idDireccion) === String(idDir));

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl animate-fade-in">
        <Card className="text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-2xl font-bold text-ink">Tu carrito está vacío</h2>
          <p className="mt-2 text-sm text-slate-500">Agrega productos antes de continuar al checkout.</p>
          <Link to="/productos" className="mt-6 inline-block">
            <Button>Ir al catálogo</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <Breadcrumbs
        items={[
          { to: "/cliente", label: "Cliente" },
          { to: "/cliente/carrito", label: "Carrito" },
          { label: "Checkout" }
        ]}
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Checkout seguro</p>
          <h2 className="text-3xl font-bold text-ink">Finalizar compra</h2>
          <p className="mt-1 text-sm text-slate-500">Validamos stock y precios otra vez antes de crear el pedido.</p>
        </div>
        <Link to="/productos">
          <Button variant="outline" size="sm">
            Seguir comprando
          </Button>
        </Link>
      </div>

      {tieneProblemas ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Hay productos agotados, inactivos, con stock insuficiente o precio actualizado. Revisa el carrito antes de pagar.</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="border-slate-200">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-700" />
              <h3 className="font-semibold text-ink">Dirección de envío</h3>
            </div>
            <select
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-ink shadow-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              value={idDir}
              onChange={(e) => setIdDir(e.target.value)}
            >
              <option value="">Selecciona una dirección</option>
              {dirs?.map((d) => (
                <option key={d.idDireccion} value={d.idDireccion}>
                  {d.direccion}, {d.ciudad}
                </option>
              ))}
            </select>
            {selectedDir ? (
              <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
                Enviar a {selectedDir.direccion}, {selectedDir.ciudad}
              </div>
            ) : null}
            <Link to="/cliente/direcciones" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
              Gestionar direcciones
            </Link>
            <button
              type="button"
              onClick={() => setQuickAddressOpen((value) => !value)}
              className="ml-4 mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              <Plus className="h-4 w-4" />
              Agregar aqui
            </button>
            {quickAddressOpen ? (
              <form
                onSubmit={handleSubmit((vals) => createAddressMutation.mutate(vals))}
                className="mt-4 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <Input label="Direccion" error={errors.direccion?.message} {...register("direccion")} />
                <LocationSelects
                  value={{
                    countryIso2: quickAddress.paisIso2,
                    countryName: quickAddress.pais,
                    stateIso2: quickAddress.departamentoIso2,
                    stateName: quickAddress.departamento,
                    cityName: quickAddress.ciudad
                  }}
                  errors={{ city: errors.ciudad?.message }}
                  onChange={(location) => {
                    setValue("paisIso2", location.countryIso2, { shouldDirty: true });
                    setValue("pais", location.countryName, { shouldDirty: true });
                    setValue("departamentoIso2", location.stateIso2, { shouldDirty: true });
                    setValue("departamento", location.stateName, { shouldDirty: true });
                    setValue("ciudad", location.cityName, { shouldDirty: true, shouldValidate: true });
                  }}
                />
                <Button type="submit" disabled={createAddressMutation.isPending}>
                  {createAddressMutation.isPending ? "Guardando..." : "Guardar direccion"}
                </Button>
              </form>
            ) : null}
          </Card>

          <Card className="border-slate-200">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-700" />
              <h3 className="font-semibold text-ink">Productos</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.idProducto} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[72px_1fr_auto]">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                    {item.producto?.imagenPrincipal ? (
                      <img src={resolveAssetUrl(item.producto.imagenPrincipal)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{item.producto?.nombre || "Producto"}</p>
                    <p className="text-sm text-slate-500">Cantidad: {item.cantidad} · Stock: {item.stockDisponible ?? 0}</p>
                    {item.mensaje ? <p className="mt-1 text-xs font-medium text-amber-700">{item.mensaje}</p> : null}
                  </div>
                  <p className="font-bold text-ink">${Number(item.subtotalLinea ?? 0).toLocaleString("es-CO")}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-slate-200 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-ink">Resumen</h3>
                <p className="text-xs text-slate-500">Total recalculado desde inventario</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA incluido</span>
                <span>${iva.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Envío</span>
                <span className="font-medium text-brand-700">Por confirmar</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Total final</span>
                  <span className="text-2xl font-bold text-ink">${total.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!idDir || mutation.isPending || tieneProblemas}
              onClick={() => mutation.mutate({ idDireccionEnvio: Number(idDir) })}
            >
              {mutation.isPending ? "Validando compra..." : "Confirmar compra"}
            </Button>
            <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-700" />
              Antes de crear el pedido volvemos a validar stock, precio, estado del producto y dirección.
            </p>
            {!tieneProblemas && idDir ? (
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">
                <CheckCircle2 className="h-4 w-4" />
                Listo para confirmar
              </p>
            ) : null}
          </Card>
        </aside>
      </div>
    </div>
  );
}
