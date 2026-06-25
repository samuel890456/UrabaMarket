import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUsuarios } from "../../services/api/admin.api";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";
import { useState } from "react";
import { Search, Users as UsersIcon, Pencil } from "lucide-react"; // Renamed Users to UsersIcon to avoid conflict with import

export function UsuariosAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const rol = searchParams.get("rol") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10); // Default limit for admin view

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-usuarios", q, rol, page, limit],
    queryFn: () =>
      getUsuarios({
        q: q || undefined,
        rol: rol || undefined,
        page,
        limit,
      }),
  });

  const users = usersData?.items ?? [];
  const totalPages = usersData?.meta?.totalPages ?? 0;

  function applyFilters(e) {
    e.preventDefault();
    const nextSearchParams = new URLSearchParams();

    if (q) nextSearchParams.set("q", q);
    if (rol) nextSearchParams.set("rol", rol);
    nextSearchParams.set("page", "1"); // Reset to first page on new filter
    nextSearchParams.set("limit", String(limit));

    setSearchParams(nextSearchParams);
  }

  function handlePageChange(newPage) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", String(newPage));
    setSearchParams(nextSearchParams);
  }

  const isLoading = isLoadingUsers;

  // Define possible roles for filtering
  const roles = ["Cliente", "Vendedor", "Proveedor", "Administrador"];

  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink">Gestión de Usuarios</h2>
      <p className="mt-1 text-slate-600">Vista global de usuarios y acciones administrativas</p>

      <form onSubmit={applyFilters} className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow-md">
        {/* Search Query */}
        <div>
          <Input
            placeholder="Buscar usuarios por nombre o email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            label="Búsqueda"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol</label>
          <Select value={rol} onValueChange={(val) => {
              const nextSearchParams = new URLSearchParams(searchParams);
              if (val) nextSearchParams.set("rol", val);
              else nextSearchParams.delete("rol");
              nextSearchParams.set("page", "1");
              setSearchParams(nextSearchParams);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los roles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" className="md:col-span-1 lg:col-span-1 mt-auto">
          <Search className="mr-2 h-4 w-4" />
          Aplicar Filtros
        </Button>
      </form>

      {isLoading ? (
        <Loader className="mt-8" />
      ) : users.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={UsersIcon}
          title="Sin usuarios"
          description="No se encontraron usuarios con los filtros aplicados."
        />
      ) : (
        <div className="mt-8 space-y-3">
          {users.map((u) => (
            <Card key={u.idUsuario} padding="sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/users/${u.idUsuario}`} className="font-medium text-indigo-600 hover:underline">
                      {u.nombre}
                    </Link>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{(u.roles ?? []).join(" + ") || u.primaryRole || "Sin rol"}</span>
                  </div>
                  <p className="text-sm text-slate-500">{u.email}</p>
                  {u.telefono && <p className="text-xs text-slate-500">Tel: {u.telefono}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/users/${u.idUsuario}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Ver/Editar
                        </Link>
                    </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="flex items-center text-sm font-medium text-gray-700">
            Página {page} de {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            variant="outline"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
