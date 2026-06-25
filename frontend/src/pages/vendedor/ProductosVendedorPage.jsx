import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, Image, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteProducto, getMiTienda, getMisProductos, patchProducto, postProducto, uploadProductoImagen, getSellerProviders } from "../../services/api/vendedor.api";
import { getCategorias } from "../../services/api/catalog.api"; // Import getCategorias
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Loader } from "../../components/Loader.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";

const optionalPositiveInt = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce.number().int().positive().nullable().optional()
);

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional().nullable(),
  precio: z.coerce.number().nonnegative("El precio no puede ser negativo"),
  precioCosto: z.coerce.number().nonnegative("El precio de costo no puede ser negativo").optional().nullable(),
  idCategoria: optionalPositiveInt,
  imagenPrincipal: z.string().optional().or(z.literal("")),
  activo: z.boolean().optional().default(true),
  marca: z.string().optional().nullable(),
  iva: z.coerce.number().min(0).max(100, "El IVA debe ser entre 0 y 100").optional().nullable(),
  fechaVencimiento: z.string().optional().nullable(),
  idProveedor: optionalPositiveInt,
  stockMinimo: z.coerce.number().int().nonnegative("El stock mínimo no puede ser negativo o decimal").optional().default(0),
});

export function ProductosVendedorPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const qc = useQueryClient();

  const { data: tienda, isLoading: lt } = useQuery({ queryKey: ["mi-tienda"], queryFn: getMiTienda });
  const idTienda = tienda?.idTienda;

  const { data: productos, isLoading: lp } = useQuery({
    queryKey: ["productos", "mios"],
    queryFn: getMisProductos,
    enabled: !!idTienda
  });

  const { data: categorias, isLoading: lc } = useQuery({ // Fetch categories
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const { data: proveedores, isLoading: lpr } = useQuery({ // Fetch providers
    queryKey: ["proveedores-vendedor"],
    queryFn: getSellerProviders,
  });


  const create = useMutation({
    mutationFn: postProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos", "mios"] });
      toast.success("Producto creado");
      setOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  const update = useMutation({
    mutationFn: ({ id, body }) => patchProducto(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos", "mios"] });
      toast.success("Producto actualizado");
      setOpen(false);
      setEditing(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  const remove = useMutation({
    mutationFn: (id) => deleteProducto(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos", "mios"] });
      toast.success("Producto eliminado");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo eliminar")
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      precio: 0,
      precioCosto: 0, // New default
      imagenPrincipal: "",
      activo: true,
      marca: "", // New default
      iva: 0, // New default
      fechaVencimiento: "", // New default
      idProveedor: null, // New default
      stockMinimo: 0, // New default
      idCategoria: null, // New default
    }
  });
  const imagenPreview = watch("imagenPrincipal");
  const localPreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  if (lt || lc || lpr) return <Loader />;
  if (!tienda) {
    return (
      <EmptyState
        icon={Package}
        title="Primero crea tu tienda"
        description="Ve a Mi tienda para registrar tu negocio."
      />
    );
  }

  const items = productos ?? [];
  const activos = items.filter((p) => p.activo).length;
  const stockBajo = items.filter(
    (p) => p.stockMinimo !== null && p.stockMinimo !== undefined && Number(p.stock) < Number(p.stockMinimo)
  ).length;
  const valorInventario = items.reduce(
    (sum, p) => sum + Number(p.precioCosto ?? p.precio ?? 0) * Number(p.stock ?? 0),
    0
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-ink">Productos e inventario</h2>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setFile(null);
            reset({
              precio: 0,
              precioCosto: 0,
              nombre: "",
              descripcion: "",
              imagenPrincipal: "",
              activo: true,
              marca: "",
              iva: 0,
              fechaVencimiento: "",
              idProveedor: null,
              stockMinimo: 0,
              idCategoria: null,
            });
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear producto
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-slate-500">Productos</p>
          <p className="mt-1 text-2xl font-bold text-ink">{items.length}</p>
          <p className="text-xs text-slate-500">{activos} activos</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-slate-500">Stock bajo</p>
          <p className={`mt-1 text-2xl font-bold ${stockBajo ? "text-red-600" : "text-ink"}`}>{stockBajo}</p>
          <p className="text-xs text-slate-500">Según mínimo configurado</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-slate-500">Valor inventario</p>
          <p className="mt-1 text-2xl font-bold text-ink">${valorInventario.toLocaleString("es-CO")}</p>
          <p className="text-xs text-slate-500">Costo estimado</p>
        </div>
      </div>

      {lp ? (
        <Loader className="mt-8" />
      ) : items.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon={Package}
          title="Sin productos"
          description="Aún no tienes productos registrados. Puedes crear uno manualmente o recibir compras B2B desde Abastecimiento."
        />
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((p) => (
            <Card key={p.idProducto} padding="sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {p.imagenPrincipal ? (
                      <img
                        src={resolveAssetUrl(p.imagenPrincipal)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-7 w-7 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">{p.nombre}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    ${Number(p.precio).toLocaleString("es-CO")} · Stock: {p.stock}
                  </p>
                  {p.precioCosto != null ? (
                    <p className="text-xs text-slate-500">
                      Costo: ${Number(p.precioCosto).toLocaleString("es-CO")} · Margen: $
                      {(Number(p.precio ?? 0) - Number(p.precioCosto ?? 0)).toLocaleString("es-CO")}
                    </p>
                  ) : null}
                  {p.marca && <p className="text-xs text-slate-500">Marca: {p.marca}</p>}
                  {p.fechaVencimiento && <p className="text-xs text-slate-500">Vence: {new Date(p.fechaVencimiento).toLocaleDateString()}</p>}
                  {p.stockMinimo !== null && p.stockMinimo !== undefined && p.stock < p.stockMinimo && (
                      <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        Stock bajo ({p.stockMinimo})
                      </p>
                  )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setEditing(p);
                      setFile(null);
                      reset({
                        nombre: p.nombre ?? "",
                        descripcion: p.descripcion ?? "",
                        precio: Number(p.precio ?? 0),
                        precioCosto: Number(p.precioCosto ?? 0), // New
                        imagenPrincipal: p.imagenPrincipal ?? "",
                        activo: !!p.activo,
                        marca: p.marca ?? "", // New
                        iva: Number(p.iva ?? 0), // New
                        fechaVencimiento: p.fechaVencimiento ? p.fechaVencimiento.split('T')[0] : "", // New, format for date input
                        idProveedor: p.idProveedor ?? null, // New
                        stockMinimo: p.stockMinimo ?? 0, // New
                        idCategoria: p.idCategoria ?? null, // Existing but ensure it's set
                      });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => remove.mutate(p.idProducto)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          setFile(null);
        }}
        title={editing ? "Editar producto" : "Nuevo producto manual"}
        description={
          editing
            ? "Actualiza precio, imagen y datos comerciales del producto. El stock se mueve desde inventario."
            : "Crea un producto para tu catálogo. El stock inicia en cero hasta recibir inventario."
        }
        className="max-w-5xl"
        bodyClassName="p-0"
      >
        <form
          onSubmit={handleSubmit(async (vals) => {
            try {
              const payload = { ...vals };
              if (file) {
                const up = await uploadProductoImagen(file);
                payload.imagenPrincipal = up.url;
              } else if (!payload.imagenPrincipal) {
                delete payload.imagenPrincipal;
              }
              // Format fechaVencimiento if present
              if (payload.fechaVencimiento === "") payload.fechaVencimiento = null;

              if (editing) {
                update.mutate({ id: editing.idProducto, body: payload });
              } else {
                create.mutate(payload);
              }
            } catch (e) {
              toast.error(e.response?.data?.message || "No se pudo subir la imagen");
            }
          })}
          className="flex max-h-[calc(92vh-88px)] flex-col"
        >
          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1fr_320px]">
            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">1</span>
                  <div>
                    <h3 className="font-semibold text-ink">Información principal</h3>
                    <p className="text-xs text-slate-500">Nombre claro, marca y descripción para el catálogo.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nombre del producto" error={errors.nombre?.message} {...register("nombre")} />
                  <Input label="Marca" error={errors.marca?.message} {...register("marca")} />
                  <label className="block w-full sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">Descripción</span>
                    <textarea
                      className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                      placeholder="Detalles, presentación, uso recomendado..."
                      {...register("descripcion")}
                    />
                    {errors.descripcion ? <span className="mt-1 block text-xs text-red-600">{errors.descripcion.message}</span> : null}
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">2</span>
                  <div>
                    <h3 className="font-semibold text-ink">Precio e inventario</h3>
                    <p className="text-xs text-slate-500">Define precios y alertas. El stock disponible no se edita manualmente.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Precio venta" type="number" step="0.01" error={errors.precio?.message} {...register("precio")} />
                  <Input label="Precio costo" type="number" step="0.01" error={errors.precioCosto?.message} {...register("precioCosto")} />
                  <Input label="IVA (%)" type="number" step="0.01" error={errors.iva?.message} {...register("iva")} />
                  <Input label="Stock mínimo" type="number" error={errors.stockMinimo?.message} {...register("stockMinimo")} />
                  <Input label="Fecha de vencimiento" type="date" error={errors.fechaVencimiento?.message} {...register("fechaVencimiento")} />
                </div>
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Stock actual: <strong>{Number(editing?.stock ?? 0).toLocaleString("es-CO")}</strong>. Las existencias se actualizan con compras B2B, entradas de inventario y ventas.
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">3</span>
                  <div>
                    <h3 className="font-semibold text-ink">Clasificación</h3>
                    <p className="text-xs text-slate-500">Ayuda a que el producto aparezca mejor organizado.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="idCategoria" className="mb-1.5 block text-sm font-medium text-slate-700">Categoría</label>
                    <Select
                      value={watch("idCategoria") ? String(watch("idCategoria")) : ""}
                      onValueChange={(val) => setValue("idCategoria", val === "" ? null : Number(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin categoría</SelectItem>
                        {categorias?.map((cat) => (
                          <SelectItem key={cat.idCategoria} value={String(cat.idCategoria)}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.idCategoria && <p className="mt-1 text-sm text-red-600">{errors.idCategoria.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="idProveedor" className="mb-1.5 block text-sm font-medium text-slate-700">Proveedor</label>
                    <Select
                      value={watch("idProveedor") ? String(watch("idProveedor")) : ""}
                      onValueChange={(val) => setValue("idProveedor", val === "" ? null : Number(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin proveedor</SelectItem>
                        {proveedores?.map((prov) => (
                          <SelectItem key={prov.idProveedor} value={String(prov.idProveedor)}>
                            {prov.nombreEmpresa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.idProveedor && <p className="mt-1 text-sm text-red-600">{errors.idProveedor.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <aside className="border-t border-slate-100 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
              <div className="sticky top-0 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Imagen principal</p>
                  <p className="text-xs text-slate-500">Usa una imagen clara, centrada y con buena luz.</p>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {localPreview || imagenPreview ? (
                    <img
                      src={localPreview || resolveAssetUrl(imagenPreview)}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                      <Image className="h-10 w-10" />
                      <span className="mt-2 text-sm">Sin imagen</span>
                    </div>
                  )}
                </div>
                <label className="block rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/30">
                  <span className="text-sm font-medium text-brand-700">Subir imagen</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <span className="mt-1 block text-xs text-slate-500">PNG, JPG o WEBP hasta 5MB</span>
                </label>
                <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <span>
                    <span className="block font-medium text-ink">Producto activo</span>
                    <span className="text-xs text-slate-500">Visible para compradores</span>
                  </span>
                  <input type="checkbox" className="h-5 w-5 accent-brand-600" {...register("activo")} />
                </label>
              </div>
            </aside>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEditing(null);
                setFile(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {editing
                ? update.isPending
                  ? "Guardando..."
                  : "Guardar cambios"
                : create.isPending
                  ? "Publicando..."
                  : "Publicar producto"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
