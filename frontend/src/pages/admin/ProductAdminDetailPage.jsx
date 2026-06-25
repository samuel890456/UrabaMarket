import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getProducto, getCategorias } from "../../services/api/catalog.api"; // Reusing public getProducto
import { patchProducto, uploadProductoImagen } from "../../services/api/vendedor.api"; // Reusing seller's patch and upload
import { getSellerProviders } from "../../services/api/vendedor.api"; // Reusing seller's getSellerProviders
import { Loader } from "../../components/Loader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Image } from "lucide-react";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl.js";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";

// Zod schema for product validation (similar to seller's but might include admin specific fields)
const adminProductSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional().nullable(),
  precio: z.coerce.number().nonnegative("El precio no puede ser negativo"),
  precioCosto: z.coerce.number().nonnegative("El precio de costo no puede ser negativo").optional().nullable(),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo o decimal"),
  imagenPrincipal: z.string().optional().or(z.literal("")),
  activo: z.boolean().optional().default(true),
  marca: z.string().optional().nullable(),
  iva: z.coerce.number().min(0).max(100, "El IVA debe ser entre 0 y 100").optional().nullable(),
  fechaVencimiento: z.string().datetime({ message: "Formato de fecha inválido" }).optional().nullable(),
  idProveedor: z.coerce.number().int().positive("Selecciona un proveedor válido").optional().nullable(),
  stockMinimo: z.coerce.number().int().nonnegative("El stock mínimo no puede ser negativo o decimal").optional().default(0),
  idCategoria: z.coerce.number().int().positive("Selecciona una categoría válida").optional().nullable(),
});


export function ProductAdminDetailPage() {
  const { idProducto } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [file, setFile] = useState(null);

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", idProducto],
    queryFn: () => getProducto(Number(idProducto), { visita: false }), // Admin view, no increment visits
    enabled: !!idProducto,
  });

  const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const { data: proveedores, isLoading: isLoadingProveedores } = useQuery({
    queryKey: ["proveedores-admin"], // Admin might fetch all providers, not just seller's
    queryFn: getSellerProviders, // Reusing this for now, will need specific admin API later
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => patchProducto(id, body), // Reusing seller's patch, but this should be an admin patch eventually
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product", idProducto] });
      qc.invalidateQueries({ queryKey: ["admin-productos"] });
      toast.success("Producto actualizado correctamente.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al actualizar el producto.");
    },
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(adminProductSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio: 0,
      precioCosto: 0,
      stock: 0,
      imagenPrincipal: "",
      activo: true,
      marca: "",
      iva: 0,
      fechaVencimiento: "",
      idProveedor: null,
      stockMinimo: 0,
      idCategoria: null,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        nombre: product.nombre ?? "",
        descripcion: product.descripcion ?? "",
        precio: Number(product.precio ?? 0),
        precioCosto: Number(product.precioCosto ?? 0),
        stock: product.stock ?? 0,
        imagenPrincipal: product.imagenPrincipal ?? "",
        activo: !!product.activo,
        marca: product.marca ?? "",
        iva: Number(product.iva ?? 0),
        fechaVencimiento: product.fechaVencimiento ? product.fechaVencimiento.split('T')[0] : "",
        idProveedor: product.idProveedor ?? null,
        stockMinimo: product.stockMinimo ?? 0,
        idCategoria: product.idCategoria ?? null,
      });
    }
  }, [product, reset]);

  const imagenPreview = watch("imagenPrincipal");
  const localPreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const isLoadingPage = isLoadingProduct || isLoadingCategorias || isLoadingProveedores;

  if (isLoadingPage) return <Loader />;
  if (!product) return <div>Producto no encontrado.</div>;


  const onSubmit = async (vals) => {
    try {
      const payload = { ...vals };
      if (file) {
        const up = await uploadProductoImagen(file); // Reusing seller's upload
        payload.imagenPrincipal = up.url;
      } else if (!payload.imagenPrincipal) {
        delete payload.imagenPrincipal;
      }
      if (payload.fechaVencimiento === "") payload.fechaVencimiento = null;

      updateMutation.mutate({ id: Number(idProducto), body: payload });
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo actualizar la imagen o el producto.");
    }
  };


  return (
    <div className="animate-fade-in p-4">
      <h2 className="text-2xl font-bold text-ink mb-4">Detalles del Producto: {product.nombre}</h2>
      <Card padding="md" className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nombre" error={errors.nombre?.message} {...register("nombre")} />
          <Input label="Descripción" error={errors.descripcion?.message} {...register("descripcion")} />
          <Input label="Marca" error={errors.marca?.message} {...register("marca")} />
          <Input label="Precio Venta" type="number" step="0.01" error={errors.precio?.message} {...register("precio")} />
          <Input label="Precio Costo" type="number" step="0.01" error={errors.precioCosto?.message} {...register("precioCosto")} />
          <Input label="IVA (%)" type="number" step="0.01" error={errors.iva?.message} {...register("iva")} />
          <Input label="Stock" type="number" error={errors.stock?.message} {...register("stock")} />
          <Input label="Stock Mínimo" type="number" error={errors.stockMinimo?.message} {...register("stockMinimo")} />
          <Input label="Fecha de Vencimiento" type="date" error={errors.fechaVencimiento?.message} {...register("fechaVencimiento")} />

          {/* Categoría Select */}
          <div>
            <label htmlFor="idCategoria" className="block text-sm font-medium text-gray-700">Categoría</label>
            <Select
              value={watch("idCategoria") ? String(watch("idCategoria")) : ""}
              onValueChange={(val) => setValue("idCategoria", val === "" ? null : Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin Categoría</SelectItem>
                {categorias?.map((cat) => (
                  <SelectItem key={cat.idCategoria} value={String(cat.idCategoria)}>
                    {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idCategoria && <p className="mt-1 text-sm text-red-600">{errors.idCategoria.message}</p>}
          </div>

          {/* Proveedor Select */}
          <div>
            <label htmlFor="idProveedor" className="block text-sm font-medium text-gray-700">Proveedor</label>
            <Select
              value={watch("idProveedor") ? String(watch("idProveedor")) : ""}
              onValueChange={(val) => setValue("idProveedor", val === "" ? null : Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin Proveedor</SelectItem>
                {proveedores?.map((prov) => (
                  <SelectItem key={prov.idProveedor} value={String(prov.idProveedor)}>
                    {prov.nombreEmpresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idProveedor && <p className="mt-1 text-sm text-red-600">{errors.idProveedor.message}</p>}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Imagen principal</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="mt-1 text-xs text-slate-500">PNG/JPG/WEBP · máx 5MB</p>
          </label>

          {localPreview || imagenPreview ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Image className="h-4 w-4" />
                Vista previa
              </div>
              <img
                src={localPreview || resolveAssetUrl(imagenPreview)}
                alt=""
                className="mt-2 h-40 w-full rounded-lg object-cover"
              />
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register("activo")} />
            Producto activo
          </label>
          <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending
                ? "Guardando…"
                : "Guardar cambios"
            }
          </Button>
        </form>
      </Card>
    </div>
  );
}
