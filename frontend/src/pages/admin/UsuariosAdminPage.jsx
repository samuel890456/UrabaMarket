import { useQuery } from "@tanstack/react-query";
import { getUsuarios } from "../../services/api/admin.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";

export function UsuariosAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: () => getUsuarios({ limit: 50, page: 1 })
  });

  if (isLoading) return <Loader />;

  const items = data?.items ?? [];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Usuarios</h2>
      <p className="mt-1 text-slate-600">Listado de cuentas registradas</p>
      <div className="mt-6 space-y-2">
        {items.map((u) => (
          <Card key={u.idUsuario} padding="sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{u.nombre}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{u.rol}</span>
            </div>
            <p className="text-sm text-slate-500">{u.email}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
