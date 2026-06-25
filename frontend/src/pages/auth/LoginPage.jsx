import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { login } from "../../services/api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const from = location.state?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      const { token, user } = await login(values);
      setAuth(token, user);
      toast.success(`Hola, ${user.nombre}`);
      navigate(from && from !== "/login" ? from : "/", { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || "Credenciales inválidas");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-500">Accede a tu cuenta UrabaMarket</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input
            label="Contraseña"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-medium text-brand-700 hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
