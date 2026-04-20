import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMe, patchMe } from "../../services/api/cliente.api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().optional().nullable(),
  password: z.union([z.literal(""), z.string().min(6, "Mínimo 6 caracteres")]).optional()
});

export function PerfilClientePage() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe
  });

  const mutation = useMutation({
    mutationFn: patchMe,
    onSuccess: (updated) => {
      updateUser(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Perfil actualizado");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error al guardar")
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data) {
      reset({
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || "",
        password: ""
      });
    }
  }, [data, reset]);

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Mi perfil</h2>
      <Card className="mt-6">
        <form
          onSubmit={handleSubmit((vals) => {
            const payload = { ...vals };
            if (!payload.password) delete payload.password;
            mutation.mutate(payload);
          })}
          className="space-y-4"
        >
          <Input label="Nombre" error={errors.nombre?.message} {...register("nombre")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Teléfono" {...register("telefono")} />
          <Input label="Nueva contraseña (opcional)" type="password" {...register("password")} />
          <Button type="submit" disabled={mutation.isPending}>
            Guardar cambios
          </Button>
        </form>
      </Card>
    </div>
  );
}
