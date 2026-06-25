import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Camera,
  CreditCard,
  Heart,
  Lock,
  MapPin,
  Package,
  Pencil,
  Plus,
  Settings,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { getDirecciones, getMe, getPedidos, patchMe, uploadAvatar } from "../../services/api/cliente.api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LocationSelects } from "../../components/location/LocationSelects";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";
import { rolesOf } from "../../utils/rbac";

const schema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email invalido"),
  telefono: z.string().optional().nullable(),
  password: z.union([z.literal(""), z.string().min(6, "Minimo 6 caracteres")]).optional()
});

const tabs = [
  { key: "personal", label: "Perfil", icon: UserRound },
  { key: "direcciones", label: "Direcciones", icon: MapPin },
  { key: "pedidos", label: "Pedidos", icon: Package },
  { key: "favoritos", label: "Favoritos", icon: Heart },
  { key: "seguridad", label: "Seguridad", icon: Lock },
  { key: "notificaciones", label: "Notificaciones", icon: Bell },
  { key: "configuracion", label: "Config", icon: Settings }
];

export function PerfilClientePage() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [activeTab, setActiveTab] = useState("personal");
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [notifications, setNotifications] = useState({
    pedidos: true,
    ofertas: true,
    seguridad: true,
    whatsapp: false
  });

  const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const { data: direcciones = [], isLoading: loadingDirecciones } = useQuery({ queryKey: ["direcciones"], queryFn: getDirecciones });
  const { data: pedidos = [], isLoading: loadingPedidos } = useQuery({ queryKey: ["pedidos"], queryFn: getPedidos });

  const mutation = useMutation({
    mutationFn: patchMe,
    onSuccess: (updated) => {
      updateUser(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success("Perfil actualizado");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error al guardar")
  });

  const avatarMutation = useMutation({
    mutationFn: async (file) => {
      const uploaded = await uploadAvatar(file);
      return patchMe({ avatarUrl: uploaded.url });
    },
    onSuccess: (updated) => {
      updateUser(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Foto de perfil actualizada");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo actualizar la foto")
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

  const stats = useMemo(() => {
    const completed = pedidos.filter((pedido) => pedido.estado === "Completado").length;
    const pending = pedidos.filter((pedido) => pedido.estado !== "Completado" && pedido.estado !== "Cancelado").length;
    const spent = pedidos.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0);
    return { completed, pending, spent };
  }, [pedidos]);

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card">
        <div className="relative min-h-56 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.45),_transparent_36%),linear-gradient(135deg,_#0f172a,_#14532d_55%,_#f59e0b)]" />
          <div className="relative flex h-full min-h-56 flex-col justify-between p-5 text-white sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">Centro de cuenta</p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Mi perfil</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Gestiona tus datos, direcciones, compras, seguridad y preferencias desde un solo lugar.</p>
              </div>
              <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => setEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar perfil
              </Button>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-3xl border-4 border-white bg-white/90 shadow-card">
                {avatarPreview || data?.avatarUrl || data?.fotoPerfil ? (
                  <img src={avatarPreview || resolveAssetUrl(data?.avatarUrl || data?.fotoPerfil)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="m-6 h-10 w-10 text-slate-400" />
                )}
                <span className="absolute inset-0 hidden items-center justify-center bg-black/45 text-white group-hover:flex">
                  {avatarMutation.isPending ? <span className="text-xs font-semibold">Subiendo</span> : <Camera className="h-5 w-5" />}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setAvatarPreview(URL.createObjectURL(file));
                      avatarMutation.mutate(file);
                    }
                  }}
                />
              </label>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold">{data?.nombre || "Cliente UrabaMarket"}</h2>
                <p className="truncate text-sm text-white/75">{data?.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Cliente</span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{pedidos.length} pedidos</span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{direcciones.length} direcciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 bg-white p-4 sm:grid-cols-3 sm:p-5">
          <StatCard label="Compras completadas" value={stats.completed} />
          <StatCard label="Pedidos activos" value={stats.pending} />
          <StatCard label="Total comprado" value={`$${stats.spent.toLocaleString("es-CO")}`} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  activeTab === key ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          {activeTab === "personal" ? (
            <ProfileForm
              editing={editing}
              setEditing={setEditing}
              data={data}
              register={register}
              errors={errors}
              isSaving={mutation.isPending}
              onSubmit={handleSubmit((vals) => {
                const payload = { ...vals };
                if (!payload.password) delete payload.password;
                mutation.mutate(payload);
              })}
            />
          ) : null}
          {activeTab === "direcciones" ? <AddressesSection direcciones={direcciones} isLoading={loadingDirecciones} /> : null}
          {activeTab === "pedidos" ? <OrdersSection pedidos={pedidos} isLoading={loadingPedidos} /> : null}
          {activeTab === "favoritos" ? <FavoritesSection /> : null}
          {activeTab === "seguridad" ? <SecuritySection /> : null}
          {activeTab === "notificaciones" ? <NotificationsSection notifications={notifications} setNotifications={setNotifications} /> : null}
          {activeTab === "configuracion" ? <SettingsSection /> : null}
        </main>
      </div>
    </div>
  );
}

function ProfileForm({ editing, setEditing, data, register, errors, isSaving, onSubmit }) {
  return (
    <Card className="border-slate-200">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">Informacion personal</h2>
          <p className="mt-1 text-sm text-slate-500">Edita tus datos principales sin salir de la pagina.</p>
        </div>
        {!editing ? (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        ) : null}
      </div>
      {editing ? (
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" error={errors.nombre?.message} {...register("nombre")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Telefono" error={errors.telefono?.message} {...register("telefono")} />
          <Input label="Nueva contrasena (opcional)" type="password" error={errors.password?.message} {...register("password")} />
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile label="Nombre" value={data?.nombre || "Sin nombre"} />
          <InfoTile label="Email" value={data?.email || "Sin email"} />
          <InfoTile label="Telefono" value={data?.telefono || "Sin telefono"} />
          <InfoTile label="Roles" value={rolesOf(data).join(" + ") || "Cliente"} />
        </div>
      )}
    </Card>
  );
}

function AddressesSection({ direcciones, isLoading }) {
  if (isLoading) return <SectionSkeleton />;
  return (
    <Card className="border-slate-200">
      <SectionHeader title="Direcciones guardadas" description="Administra tus puntos de entrega." action={<Button asChild><Link to="/cliente/direcciones"><Plus className="mr-2 h-4 w-4" />Agregar direccion</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {direcciones.length ? direcciones.map((dir) => (
          <div key={dir.idDireccion} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-brand-700" />
              <div>
                <p className="font-semibold text-ink">{dir.direccion}</p>
                <p className="mt-1 text-sm text-slate-500">{dir.ciudad}</p>
                {dir.esPrincipal ? <span className="mt-3 inline-flex rounded-full bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-800">Principal</span> : null}
              </div>
            </div>
          </div>
        )) : <EmptyBlock title="Sin direcciones" text="Agrega una direccion para acelerar el checkout." />}
      </div>
    </Card>
  );
}

function OrdersSection({ pedidos, isLoading }) {
  if (isLoading) return <SectionSkeleton />;
  return (
    <Card className="border-slate-200">
      <SectionHeader title="Historial de pedidos" description="Consulta estados, fechas y totales de compra." />
      <div className="space-y-3">
        {pedidos.length ? pedidos.slice(0, 8).map((pedido) => (
          <Link key={pedido.idPedido} to={`/cliente/pedidos/${pedido.idPedido}`} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-ink">Pedido #{pedido.idPedido}</p>
                <p className="text-sm text-slate-500">{pedido.fecha ? new Date(pedido.fecha).toLocaleDateString("es-CO") : "Sin fecha"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:text-right">
              <StatusBadge estado={pedido.estado} />
              <p className="font-bold text-ink">${Number(pedido.total || 0).toLocaleString("es-CO")}</p>
            </div>
          </Link>
        )) : <EmptyBlock title="Sin pedidos" text="Tus compras apareceran aqui con seguimiento visual." />}
      </div>
    </Card>
  );
}

function FavoritesSection() {
  return (
    <Card className="border-slate-200">
      <SectionHeader title="Productos favoritos" description="Colecciona productos para comprarlos luego." />
      <EmptyBlock title="Favoritos listos para conectar" text="La interfaz ya esta preparada para mostrar productos guardados cuando exista el endpoint." icon={Heart} />
    </Card>
  );
}

function SecuritySection() {
  return (
    <Card className="border-slate-200">
      <SectionHeader title="Seguridad de cuenta" description="Controla accesos y credenciales." />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoPanel icon={ShieldCheck} title="Cuenta protegida" text="Recomendamos usar una contrasena de 8 o mas caracteres con numeros y simbolos." />
        <InfoPanel icon={Lock} title="Cambio de contrasena" text="Puedes cambiarla desde la pestana Perfil usando el campo de nueva contrasena." />
      </div>
    </Card>
  );
}

function NotificationsSection({ notifications, setNotifications }) {
  return (
    <Card className="border-slate-200">
      <SectionHeader title="Notificaciones" description="Activa o desactiva avisos de cuenta y compras." />
      <div className="space-y-3">
        {Object.entries({
          pedidos: "Actualizaciones de pedidos",
          ofertas: "Ofertas y recomendaciones",
          seguridad: "Alertas de seguridad",
          whatsapp: "Mensajes por WhatsApp"
        }).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="font-medium text-slate-700">{label}</span>
            <input
              type="checkbox"
              checked={notifications[key]}
              onChange={(event) => setNotifications((state) => ({ ...state, [key]: event.target.checked }))}
              className="h-5 w-5 rounded border-slate-300 text-brand-600"
            />
          </label>
        ))}
      </div>
    </Card>
  );
}

function SettingsSection() {
  const [location, setLocation] = useState({
    countryIso2: "CO",
    countryName: "Colombia",
    stateIso2: "",
    stateName: "",
    cityName: ""
  });

  return (
    <Card className="border-slate-200">
      <SectionHeader title="Configuracion" description="Preferencias generales de la experiencia." />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoPanel icon={Settings} title="Idioma y region" text="Experiencia configurada para Colombia y moneda COP." />
        <InfoPanel icon={CreditCard} title="Metodos de pago" text="Seccion visual preparada para tarjetas, billeteras y pago contra entrega." />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <p className="font-semibold text-ink">Ubicacion preferida</p>
          <p className="mt-1 text-sm text-slate-500">Selecciona una zona base para mejorar recomendaciones y formularios futuros.</p>
          <LocationSelects className="mt-4" value={location} onChange={setLocation} />
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function InfoPanel({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-brand-700" />
      <p className="mt-3 font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function EmptyBlock({ title, text, icon: Icon = Package }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center md:col-span-2">
      <Icon className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function StatusBadge({ estado }) {
  const isBad = estado === "Cancelado";
  const isDone = estado === "Completado";
  return (
    <span className={cn(
      "rounded-full px-3 py-1 text-xs font-bold",
      isBad ? "bg-red-50 text-red-700" : isDone ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
    )}>
      {estado}
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6">
      <div className="h-80 rounded-3xl bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="h-80 rounded-2xl bg-slate-200" />
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="h-6 w-48 rounded bg-slate-200" />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
