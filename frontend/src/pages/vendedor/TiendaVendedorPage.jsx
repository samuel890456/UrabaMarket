import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getMiTienda, postTienda, patchTienda } from "../../services/api/vendedor.api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { Store } from "lucide-react";

const schema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  idCategoria: z.coerce.number().optional().nullable()
});

export function TiendaVendedorPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["mi-tienda"], queryFn: getMiTienda });

  const create = useMutation({
    mutationFn: postTienda,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-tienda"] });
      toast.success("Tienda creada");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  const update = useMutation({
    mutationFn: ({ id, body }) => patchTienda(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-tienda"] });
      toast.success("Tienda actualizada");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data) {
      reset({
        nombre: data.nombre,
        descripcion: data.descripcion || "",
        idCategoria: data.idCategoria ?? ""
      });
    }
  }, [data, reset]);

  if (isLoading) return <Loader />;

  if (!data) {
    return (
      <div className="max-w-lg">
        <EmptyState
          icon={Store}
          title="Registra tu tienda"
          description="Completa los datos para aparecer en el marketplace."
        />
        <Card className="mt-8">
          <form
            onSubmit={handleSubmit((vals) => create.mutate(vals))}
            className="space-y-4"
          >
            <Input label="Nombre comercial" {...register("nombre")} />
            <label className="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              className="min-h-[100px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              {...register("descripcion")}
            />
            <Button type="submit" disabled={create.isPending}>
              Crear tienda
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Mi tienda</h2>
      <Card className="mt-6">
        <form
          onSubmit={handleSubmit((vals) =>
            update.mutate({ id: data.idTienda, body: vals })
          )}
          className="space-y-4"
        >
          <Input label="Nombre" {...register("nombre")} />
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea
            className="min-h-[100px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            {...register("descripcion")}
          />
          <Button type="submit" disabled={update.isPending}>
            Guardar
          </Button>
        </form>
      </Card>
    </div>
  );
}
