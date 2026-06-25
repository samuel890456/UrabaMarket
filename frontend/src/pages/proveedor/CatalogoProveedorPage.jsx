import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PackagePlus, Save, Search } from "lucide-react";
import {
  deleteProductoMayorista,
  getMisProductosMayoristas,
  patchProductoMayorista,
  postProductoMayorista,
  uploadProductoMayoristaImagen
} from "../../services/api/proveedor.api";
import { getCategorias } from "../../services/api/catalog.api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DataTable } from "../../components/table/DataTable";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/Loader";

const initialForm = {
  tipoProducto: "General",
  nombre: "",
  descripcion: "",
  precioMayorista: "",
  stockMayorista: "",
  marca: "",
  idCategoria: "",
  ivaMayorista: "",
  fechaVencimiento: "",
  imagenPrincipal: ""
};

const productTypes = ["General", "Alimento", "Medicamento", "Cosmetico", "Limpieza", "Perecedero", "Tecnologia", "Ropa", "Hogar"];
const usesExpiration = new Set(["Alimento", "Medicamento", "Cosmetico", "Limpieza", "Perecedero"]);
const usesTechSpecs = new Set(["Tecnologia"]);

function cleanPayload(form) {
  const needsExpiration = usesExpiration.has(form.tipoProducto);
  const needsTechSpecs = usesTechSpecs.has(form.tipoProducto);
  return {
    tipoProducto: form.tipoProducto || "General",
    nombre: form.nombre,
    descripcion: form.descripcion || null,
    precioMayorista: Number(form.precioMayorista || 0),
    stockMayorista: Number(form.stockMayorista || 0),
    marca: form.marca || null,
    idCategoria: form.idCategoria ? Number(form.idCategoria) : null,
    ivaMayorista: form.ivaMayorista ? Number(form.ivaMayorista) : null,
    fechaVencimiento: needsExpiration ? form.fechaVencimiento || null : null,
    imagenPrincipal: form.imagenPrincipal || null,
    lote: needsExpiration ? form.lote || null : null,
    fechaFabricacion: form.fechaFabricacion || null,
    garantiaMeses: needsTechSpecs && form.garantiaMeses ? Number(form.garantiaMeses) : null,
    vidaUtilMeses: form.vidaUtilMeses ? Number(form.vidaUtilMeses) : null,
    modelo: needsTechSpecs ? form.modelo || null : null,
    compatibilidad: needsTechSpecs ? form.compatibilidad || null : null,
    numeroSerie: needsTechSpecs ? form.numeroSerie || null : null,
    activo: true
  };
}

export function CatalogoProveedorPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const { data, isLoading } = useQuery({
    queryKey: ["proveedor-productos-mayoristas", q],
    queryFn: () => getMisProductosMayoristas(q ? { q } : {})
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => getCategorias()
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = cleanPayload(form);
      return editing
        ? patchProductoMayorista(editing.idProductoMayorista, payload)
        : postProductoMayorista(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proveedor-productos-mayoristas"] });
      setForm(initialForm);
      setEditing(null);
      toast.success(editing ? "Producto actualizado" : "Producto creado");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo guardar")
  });

  const uploadMutation = useMutation({
    mutationFn: uploadProductoMayoristaImagen,
    onSuccess: (file) => {
      setForm((prev) => ({ ...prev, imagenPrincipal: file.url }));
      toast.success("Imagen subida");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo subir la imagen")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductoMayorista,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proveedor-productos-mayoristas"] });
      toast.success("Producto retirado del catálogo");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo eliminar")
  });

  const columns = useMemo(
    () => [
      {
        id: "producto",
        header: "Producto",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink">{row.original.nombre}</p>
            <p className="text-xs text-slate-500">
              {row.original.tipoProducto || "General"} · {row.original.marca || "Sin marca"}
            </p>
          </div>
        )
      },
      {
        id: "precioMayorista",
        header: "Mayorista",
        cell: ({ row }) => `$${Number(row.original.precioMayorista || 0).toLocaleString("es-CO")}`
      },
      { header: "Stock", accessorKey: "stockMayorista" },
      {
        id: "ivaMayorista",
        header: "IVA",
        cell: ({ row }) => (row.original.ivaMayorista != null ? `${row.original.ivaMayorista}%` : "N/A")
      },
      {
        id: "fechaVencimiento",
        header: "Vence",
        cell: ({ row }) =>
          row.original.fechaVencimiento
            ? new Date(row.original.fechaVencimiento).toLocaleDateString("es-CO")
            : "No aplica"
      },
      {
        id: "acciones",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const p = row.original;
                setEditing(p);
                setForm({
                  tipoProducto: p.tipoProducto || "General",
                  nombre: p.nombre || "",
                  descripcion: p.descripcion || "",
                  precioMayorista: p.precioMayorista ?? "",
                  stockMayorista: p.stockMayorista ?? "",
                  marca: p.marca || "",
                  idCategoria: p.idCategoria || "",
                  ivaMayorista: p.ivaMayorista ?? "",
                  fechaVencimiento: p.fechaVencimiento ? String(p.fechaVencimiento).slice(0, 10) : "",
                  imagenPrincipal: p.imagenPrincipal || "",
                  lote: p.lote || "",
                  fechaFabricacion: p.fechaFabricacion ? String(p.fechaFabricacion).slice(0, 10) : "",
                  garantiaMeses: p.garantiaMeses ?? "",
                  vidaUtilMeses: p.vidaUtilMeses ?? "",
                  modelo: p.modelo || "",
                  compatibilidad: p.compatibilidad || "",
                  numeroSerie: p.numeroSerie || ""
                });
              }}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(row.original.idProductoMayorista)}
            >
              Eliminar
            </Button>
          </div>
        )
      }
    ],
    [deleteMutation]
  );

  const items = data?.items ?? [];
  const showExpirationFields = usesExpiration.has(form.tipoProducto);
  const showTechFields = usesTechSpecs.has(form.tipoProducto);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Catálogo mayorista</h2>
          <p className="mt-1 text-sm text-slate-600">Productos visibles para tiendas, no para clientes.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto" />
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <PackagePlus className="h-5 w-5 text-brand-700" />
          <h3 className="font-semibold text-ink">{editing ? "Editar producto" : "Nuevo producto mayorista"}</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block w-full">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo de producto</span>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={form.tipoProducto}
              onChange={(e) => setForm({ ...form, tipoProducto: e.target.value, fechaVencimiento: "", lote: "" })}
            >
              {productTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input label="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
          <label className="block w-full">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Categoría</span>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={form.idCategoria}
              onChange={(e) => setForm({ ...form, idCategoria: e.target.value })}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={String(cat.idCategoria)}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </label>
          <Input label="Precio mayorista" type="number" value={form.precioMayorista} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} />
          <Input label="Stock disponible" type="number" value={form.stockMayorista} onChange={(e) => setForm({ ...form, stockMayorista: e.target.value })} />
          <Input label="IVA %" type="number" value={form.ivaMayorista} onChange={(e) => setForm({ ...form, ivaMayorista: e.target.value })} />
          <Input label="Imagen URL" value={form.imagenPrincipal} onChange={(e) => setForm({ ...form, imagenPrincipal: e.target.value })} />
          <Input label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </div>
        {showExpirationFields ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Input label="Fecha de vencimiento" type="date" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })} />
            <Input label="Lote" value={form.lote || ""} onChange={(e) => setForm({ ...form, lote: e.target.value })} />
            <Input label="Fecha de fabricación" type="date" value={form.fechaFabricacion || ""} onChange={(e) => setForm({ ...form, fechaFabricacion: e.target.value })} />
          </div>
        ) : null}
        {showTechFields ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Input label="Garantía (meses)" type="number" value={form.garantiaMeses || ""} onChange={(e) => setForm({ ...form, garantiaMeses: e.target.value })} />
            <Input label="Modelo" value={form.modelo || ""} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
            <Input label="Compatibilidad" value={form.compatibilidad || ""} onChange={(e) => setForm({ ...form, compatibilidad: e.target.value })} />
            <Input label="Número de serie (opcional)" value={form.numeroSerie || ""} onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })} />
            <Input label="Vida útil (meses, opcional)" type="number" value={form.vidaUtilMeses || ""} onChange={(e) => setForm({ ...form, vidaUtilMeses: e.target.value })} />
            <Input label="Fecha de fabricación" type="date" value={form.fechaFabricacion || ""} onChange={(e) => setForm({ ...form, fechaFabricacion: e.target.value })} />
          </div>
        ) : null}
        <div className="mt-4 max-w-sm">
          <Input
            label="Subir imagen"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadMutation.mutate(file);
            }}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <Button disabled={saveMutation.isPending || !form.nombre} onClick={() => saveMutation.mutate()}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
          {editing ? (
            <Button variant="ghost" onClick={() => { setEditing(null); setForm(initialForm); }}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </Card>

      {isLoading ? <Loader /> : <DataTable data={items} columns={columns} />}
    </div>
  );
}
