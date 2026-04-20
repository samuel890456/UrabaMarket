import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getMiTienda, getMisProductos, postProducto, patchProducto } from "../../services/api/vendedor.api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/EmptyState";
import { useState } from "react";
import { Package } from "lucide-react";

const schema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative()
});

export function ProductosVendedorPage() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: tienda, isLoading: lt } = useQuery({ queryKey: ["mi-tienda"], queryFn: getMiTienda });
  const idTienda = tienda?.idTienda;

  const { data: productos, isLoading: lp } = useQuery({
    queryKey: ["productos", "mios"],
    queryFn: getMisProductos,
    enabled: !!idTienda
  });

  const create = useMutation({
    mutationFn: postProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos", "mis"] });
      toast.success("Producto creado");
      setOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { stock: 0, precio: 0 }
  });

  if (lt) return <Loader />;
  if (!tienda) {
    return (
      <EmptyState
        icon={Package}
        title="Primero crea tu tienda"
        description="Ve a Mi tienda para registrar tu negocio."
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-ink">Productos e inventario</h2>
        <Button type="button" onClick={() => { reset({ stock: 0, precio: 0, nombre: "", descripcion: "" }); setOpen(true); }}>
          Nuevo producto
        </Button>
      </div>
      {lp ? (
        <Loader className="mt-8" />
      ) : (
        <div className="mt-8 space-y-3">
          {productos?.map((p) => (
            <Card key={p.idProducto} padding="sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{p.nombre}</p>
                  <p className="text-sm text-slate-500">
                    ${Number(p.precio).toLocaleString("es-CO")} · Stock: {p.stock}
                  </p>
                </div>
                <StockEditor
                  id={p.idProducto}
                  stock={p.stock}
                  onSaved={() => qc.invalidateQueries({ queryKey: ["productos", "mis"] })}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo producto">
        <form
          onSubmit={handleSubmit((vals) => create.mutate(vals))}
          className="space-y-4"
        >
          <Input label="Nombre" error={errors.nombre?.message} {...register("nombre")} />
          <Input label="Precio" type="number" step="0.01" error={errors.precio?.message} {...register("precio")} />
          <Input label="Stock" type="number" error={errors.stock?.message} {...register("stock")} />
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea className="min-h-[80px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" {...register("descripcion")} />
          <Button type="submit" className="w-full" disabled={create.isPending}>
            Publicar
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function StockEditor({ id, stock, onSaved }) {
  const [v, setV] = useState(stock);
  const mutation = useMutation({
    mutationFn: (body) => patchProducto(id, body),
    onSuccess: () => {
      toast.success("Stock actualizado");
      onSaved();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Ajustar</span>
      <input
        type="number"
        className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-sm"
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
      />
      <Button size="sm" variant="outline" type="button" onClick={() => mutation.mutate({ stock: v })}>
        Guardar
      </Button>
    </div>
  );
}
