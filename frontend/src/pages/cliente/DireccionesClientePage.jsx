import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getDirecciones, postDireccion } from "../../services/api/cliente.api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { LocationSelects } from "../../components/location/LocationSelects";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { Modal } from "../../components/ui/Modal";
import { useState } from "react";
import { MapPin } from "lucide-react";

const schema = z.object({
  direccion: z.string().min(1),
  ciudad: z.string().min(1, "Selecciona una ciudad"),
  departamento: z.string().optional(),
  pais: z.string().optional(),
  paisIso2: z.string().optional(),
  departamentoIso2: z.string().optional(),
  esPrincipal: z.boolean().optional()
});

export function DireccionesClientePage() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["direcciones"], queryFn: getDirecciones });

  const mutation = useMutation({
    mutationFn: postDireccion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["direcciones"] });
      toast.success("Dirección guardada");
      setOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error")
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { esPrincipal: false, ciudad: "", departamento: "", pais: "Colombia", paisIso2: "CO", departamentoIso2: "" }
  });
  const values = watch();

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-ink">Direcciones</h2>
        <Button type="button" onClick={() => { reset(); setOpen(true); }}>
          Nueva dirección
        </Button>
      </div>
      <div className="mt-6 space-y-3">
        {data?.map((d) => (
          <Card key={d.idDireccion}>
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="font-medium text-ink">{d.direccion}</p>
                <p className="text-sm text-slate-500">
                  {d.ciudad}
                  {d.esPrincipal ? " · Principal" : ""}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva dirección">
        <form
          onSubmit={handleSubmit((vals) => mutation.mutate(vals))}
          className="space-y-4"
        >
          <Input label="Dirección" error={errors.direccion?.message} {...register("direccion")} />
          <LocationSelects
            value={{
              countryIso2: values.paisIso2,
              countryName: values.pais,
              stateIso2: values.departamentoIso2,
              stateName: values.departamento,
              cityName: values.ciudad
            }}
            errors={{ city: errors.ciudad?.message }}
            onChange={(location) => {
              setValue("paisIso2", location.countryIso2, { shouldDirty: true });
              setValue("pais", location.countryName, { shouldDirty: true });
              setValue("departamentoIso2", location.stateIso2, { shouldDirty: true });
              setValue("departamento", location.stateName, { shouldDirty: true });
              setValue("ciudad", location.cityName, { shouldDirty: true, shouldValidate: true });
            }}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register("esPrincipal")} />
            Marcar como principal
          </label>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Guardar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
