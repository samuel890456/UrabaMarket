import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { register as registerApi } from "../../services/api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { ROLE_HOME } from "../../config/nav";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const schema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  telefono: z.string().optional(),
  rol: z.enum(["Cliente", "Vendedor", "Proveedor"])
});

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rol: "Cliente" }
  });

  async function onSubmit(values) {
    try {
      const { token, user } = await registerApi(values);
      setAuth(token, user);
      toast.success("Cuenta creada");
      navigate(ROLE_HOME[user.rol] || "/cliente", { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo registrar");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">Únete al marketplace local</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Nombre" error={errors.nombre?.message} {...register("nombre")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input
            label="Contraseña"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input label="Teléfono (opcional)" {...register("telefono")} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Rol</span>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              {...register("rol")}
            >
              <option value="Cliente">Cliente</option>
              <option value="Vendedor">Vendedor (tienda)</option>
              <option value="Proveedor">Proveedor</option>
            </select>
          </label>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando…" : "Registrarme"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Ingresar
          </Link>
        </p>
      </Card>
    </div>
  );
}
