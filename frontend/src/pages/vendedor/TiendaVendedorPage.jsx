import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Camera, Eye, MapPin, Package, Pencil, Star, Store, TrendingUp } from "lucide-react";
import { getMiTienda, getMisProductos, patchTienda, postTienda, uploadTiendaImagen } from "../../services/api/vendedor.api";
import { getCategorias } from "../../services/api/catalog.api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

const schema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  idCategoria: z.coerce.number().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable()
});

export function TiendaVendedorPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [localLogo, setLocalLogo] = useState("");
  const [localBanner, setLocalBanner] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["mi-tienda"], queryFn: getMiTienda });
  const { data: categorias = [] } = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
  const { data: productos = [] } = useQuery({ queryKey: ["mis-productos"], queryFn: getMisProductos });

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
      setEditing(false);
      toast.success("Tienda actualizada");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, field }) => {
      const uploaded = await uploadTiendaImagen(file);
      return { field, url: uploaded.url };
    },
    onSuccess: ({ field, url }) => {
      setValue(field, url, { shouldDirty: true });
      toast.success("Imagen cargada");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo subir la imagen")
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    if (data) {
      reset({
        nombre: data.nombre,
        descripcion: data.descripcion || "",
        direccion: data.direccion || "",
        idCategoria: data.idCategoria ?? "",
        logoUrl: data.logoUrl || "",
        bannerUrl: data.bannerUrl || ""
      });
    }
  }, [data, reset]);

  if (isLoading) return <Loader />;

  if (!data) {
    return (
      <div className="max-w-2xl">
        <EmptyState icon={Store} title="Registra tu tienda" description="Completa los datos para aparecer en el marketplace." />
        <Card className="mt-8">
          <StoreForm
            register={register}
            errors={errors}
            categorias={categorias}
            onSubmit={handleSubmit((vals) => create.mutate(vals))}
            isPending={create.isPending}
          />
        </Card>
      </div>
    );
  }

  const logo = localLogo || resolveAssetUrl(values.logoUrl || data.logoUrl);
  const banner = localBanner || resolveAssetUrl(values.bannerUrl || data.bannerUrl);
  const activos = productos.filter((p) => p.activo !== false).length;
  const stockTotal = productos.reduce((sum, p) => sum + Number(p.stock || 0), 0);

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
        <div className="relative h-64 bg-slate-950">
          {banner ? <img src={banner} alt="" className="h-full w-full object-cover" /> : <div className="h-full bg-gradient-to-r from-slate-950 via-emerald-900 to-amber-500" />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <label className="absolute right-5 top-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-card">
            <Camera className="h-4 w-4" />
            Banner
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setLocalBanner(URL.createObjectURL(file));
                  uploadMutation.mutate({ file, field: "bannerUrl" });
                }
              }}
            />
          </label>
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <label className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-card">
                {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Store className="h-10 w-10 text-slate-400" />}
                <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
                  <Camera className="h-5 w-5" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setLocalLogo(URL.createObjectURL(file));
                      uploadMutation.mutate({ file, field: "logoUrl" });
                    }
                  }}
                />
              </label>
              <div className="text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-100">Storefront vendedor</p>
                <h1 className="text-3xl font-bold">{data.nombre}</h1>
                <p className="mt-1 max-w-2xl text-sm text-white/75">{data.descripcion || "Tu perfil comercial listo para vender."}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => setEditing((value) => !value)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button asChild variant="accent">
                <Link to={`/tiendas/${data.idTienda}/catalogo`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver publica
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-4">
          <Metric icon={Package} label="Productos" value={productos.length} />
          <Metric icon={TrendingUp} label="Activos" value={activos} />
          <Metric icon={Store} label="Stock total" value={stockTotal} />
          <Metric icon={Star} label="Rating" value="4.8" />
        </div>
      </section>

      {editing ? (
        <Card className="border-slate-200">
          <StoreForm
            register={register}
            errors={errors}
            categorias={categorias}
            onSubmit={handleSubmit((vals) => update.mutate({ id: data.idTienda, body: vals }))}
            isPending={update.isPending}
          />
        </Card>
      ) : null}

      <Card className="border-slate-200">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">Vista rapida de productos</h2>
            <p className="text-sm text-slate-500">Los primeros productos que forman tu vitrina publica.</p>
          </div>
          <Link to="/vendedor/productos" className="text-sm font-semibold text-brand-700 hover:underline">Gestionar</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {productos.slice(0, 3).map((producto) => (
            <div key={producto.idProducto} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="aspect-video overflow-hidden rounded-xl bg-white">
                {producto.imagenPrincipal ? <img src={resolveAssetUrl(producto.imagenPrincipal)} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <p className="mt-3 line-clamp-1 font-semibold text-ink">{producto.nombre}</p>
              <p className="text-sm text-slate-500">${Number(producto.precio || 0).toLocaleString("es-CO")}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StoreForm({ register, errors, categorias, onSubmit, isPending }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <Input label="Nombre comercial" error={errors.nombre?.message} {...register("nombre")} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Categoria</span>
        <select className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm" {...register("idCategoria")}>
          <option value="">Sin categoria</option>
          {categorias.map((categoria) => <option key={categoria.idCategoria} value={categoria.idCategoria}>{categoria.nombre}</option>)}
        </select>
      </label>
      <Input className="md:col-span-2" label="Direccion comercial" error={errors.direccion?.message} {...register("direccion")} />
      <label className="block md:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Descripcion</span>
        <textarea className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" {...register("descripcion")} />
      </label>
      <input type="hidden" {...register("logoUrl")} />
      <input type="hidden" {...register("bannerUrl")} />
      <Button type="submit" disabled={isPending} className="md:col-span-2">
        {isPending ? "Guardando..." : "Guardar storefront"}
      </Button>
    </form>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-brand-700" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
