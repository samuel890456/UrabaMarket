import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAdminUserById, patchAdminUser } from "../../services/api/admin.api"; // Use dedicated API calls
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Package, ReceiptText, ShoppingCart, Store } from "lucide-react";

const adminUserSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Formato de email inválido"),
  telefono: z.string().optional().nullable(),
  roles: z.array(z.enum(["Cliente", "Vendedor", "Proveedor", "Administrador"])).min(1, "Selecciona al menos un rol"),
  activo: z.boolean().optional().default(true),
});

export function UserAdminDetailPage() {
  const { idUsuario } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["admin-user", idUsuario],
    queryFn: () => getAdminUserById(Number(idUsuario)),
    enabled: !!idUsuario,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, body }) => patchAdminUser(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user", idUsuario] });
      qc.invalidateQueries({ queryKey: ["admin-usuarios"] }); // Invalidate list for consistency
      toast.success("Usuario actualizado correctamente.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al actualizar el usuario.");
    },
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      roles: ["Cliente"],
      activo: true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        nombre: user.nombre ?? "",
        email: user.email ?? "",
        telefono: user.telefono ?? "",
        roles: user.roles?.length ? user.roles : user.primaryRole ? [user.primaryRole] : ["Cliente"],
        activo: !!user.activo,
      });
    }
  }, [user, reset]);

  const isLoadingPage = isLoadingUser;

  if (isLoadingPage) return <Loader />;
  if (!user) return <div>Usuario no encontrado.</div>;

  const onSubmit = async (vals) => {
    updateUserMutation.mutate({ id: Number(idUsuario), body: vals });
  };

  const roles = ["Cliente", "Vendedor", "Proveedor", "Administrador"]; // Define possible roles

  const relations = user.relations ?? {};

  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink mb-4">Detalles del Usuario: {user.nombre}</h2>
      <Card padding="md" className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nombre" error={errors.nombre?.message} {...register("nombre")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Teléfono" error={errors.telefono?.message} {...register("telefono")} />

          <div>
            <span className="block text-sm font-medium text-gray-700">Roles</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {roles.map((r) => {
                const selected = watch("roles")?.includes(r);
                return (
                  <label key={r} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        const current = watch("roles") ?? [];
                        setValue("roles", event.target.checked ? [...new Set([...current, r])] : current.filter((role) => role !== r), { shouldValidate: true });
                      }}
                    />
                    {r}
                  </label>
                );
              })}
            </div>
            {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register("activo")} />
            Usuario activo
          </label>
          <Button type="submit" className="w-full" disabled={updateUserMutation.isPending}>
            {updateUserMutation.isPending
                ? "Guardando…"
                : "Guardar cambios"
            }
          </Button>
        </form>
      </Card>

      <div className="mx-auto mt-8 grid max-w-6xl gap-4 lg:grid-cols-2">
        <RelationPanel
          icon={Store}
          title="Tiendas del usuario"
          empty="Este usuario no tiene tiendas."
          items={relations.tiendas}
          renderItem={(store) => (
            <div className="flex items-center justify-between gap-3">
              <div>
                <Link className="font-semibold text-brand-700 hover:underline" to={`/admin/stores/${store.idTienda}`}>
                  {store.nombre}
                </Link>
                <p className="text-xs text-slate-500">{store.productosCount} productos · {store.activo ? "Activa" : "Inactiva"}</p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/admin/stores/${store.idTienda}/products`}>Productos</Link>
              </Button>
            </div>
          )}
        />

        <RelationPanel
          icon={Building2}
          title="Perfil proveedor"
          empty="Este usuario no tiene perfil de proveedor."
          items={relations.proveedor ? [relations.proveedor] : []}
          renderItem={(provider) => (
            <div>
              <p className="font-semibold text-ink">{provider.nombreEmpresa}</p>
              <p className="text-xs text-slate-500">{provider.productosQueDistribuye || "Sin descripción comercial"}</p>
              <Link className="mt-2 inline-flex text-sm font-semibold text-brand-700 hover:underline" to={`/admin/productos?idProveedor=${provider.idProveedor}`}>
                Ver productos relacionados
              </Link>
            </div>
          )}
        />

        <RelationPanel
          icon={Package}
          title="Productos retail recientes"
          empty="No hay productos retail asociados."
          items={relations.productosTienda}
          renderItem={(product) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Link className="truncate font-semibold text-brand-700 hover:underline" to={`/admin/products/${product.idProducto}`}>
                  {product.nombre}
                </Link>
                <p className="text-xs text-slate-500">Stock {product.stock} · ${Number(product.precio || 0).toLocaleString("es-CO")}</p>
              </div>
            </div>
          )}
        />

        <RelationPanel
          icon={Package}
          title="Catálogo mayorista reciente"
          empty="No hay productos mayoristas asociados."
          items={relations.productosProveedor}
          renderItem={(product) => (
            <div>
              <p className="font-semibold text-ink">{product.nombre}</p>
              <p className="text-xs text-slate-500">Stock {product.stockMayorista} · ${Number(product.precioMayorista || 0).toLocaleString("es-CO")}</p>
            </div>
          )}
        />

        <RelationPanel
          icon={ShoppingCart}
          title="Compras B2B como tienda"
          empty="No hay compras B2B hechas por sus tiendas."
          items={relations.comprasTienda}
          renderItem={(purchase) => (
            <PurchaseLink purchase={purchase} />
          )}
        />

        <RelationPanel
          icon={ShoppingCart}
          title="Compras B2B como proveedor"
          empty="No hay compras B2B recibidas por este proveedor."
          items={relations.comprasProveedor}
          renderItem={(purchase) => (
            <PurchaseLink purchase={purchase} />
          )}
        />

        <RelationPanel
          icon={ReceiptText}
          title="Pedidos recientes"
          empty="No hay pedidos recientes."
          items={relations.pedidos}
          renderItem={(order) => (
            <div className="flex items-center justify-between gap-3">
              <div>
                <Link className="font-semibold text-brand-700 hover:underline" to={`/admin/pedidos/${order.idpedido ?? order.idPedido}`}>
                  Pedido #{order.idpedido ?? order.idPedido}
                </Link>
                <p className="text-xs text-slate-500">{order.estado} · ${Number(order.total || 0).toLocaleString("es-CO")}</p>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

function RelationPanel({ icon: Icon, title, empty, items = [], renderItem }) {
  return (
    <Card padding="md">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-brand-700" />
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.idProducto || item.idTienda || item.idCompra || item.idPedido || item.idpedido || index} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{empty}</p>
      )}
    </Card>
  );
}

function PurchaseLink({ purchase }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <Link className="font-semibold text-brand-700 hover:underline" to={`/admin/compras-proveedor/${purchase.idCompra}`}>
          Compra #{purchase.idCompra}
        </Link>
        <p className="text-xs text-slate-500">
          {purchase.nombreTienda || "Tienda"} · {purchase.estado} · ${Number(purchase.total || 0).toLocaleString("es-CO")}
        </p>
      </div>
    </div>
  );
}
