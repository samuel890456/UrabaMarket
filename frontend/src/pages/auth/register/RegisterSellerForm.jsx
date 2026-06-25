import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Clock, CreditCard, MapPin, MessageCircle, Palette, Store, Truck, UserRound } from "lucide-react";

import { register as registerApi } from "../../../services/api/auth.api";
import { getCategorias } from "../../../services/api/catalog.api";
import { useAuthStore } from "../../../store/authStore";
import { homeForUser } from "../../../utils/rbac";
import { Input } from "../../../components/ui/Input";
import { LocationSelects } from "../../../components/location/LocationSelects";
import {
  ChoiceChips,
  FieldGroup,
  FormError,
  SelectField,
  StepperFrame,
  TextareaField,
  UploadDropzone
} from "./_partials/StepperFrame";

const draftKey = "urabamarket-register-vendedor";
const deliveryOptions = ["Domicilio local", "Recoger en tienda", "Envio regional", "Contra entrega"];
const paymentOptions = ["Efectivo", "Transferencia", "Nequi", "Daviplata", "Tarjeta"];
const steps = [
  { title: "Cuenta", caption: "Responsable", fields: ["nombre", "email", "password", "telefono"] },
  { title: "Tienda", caption: "Identidad comercial", fields: ["nombreTienda", "idCategoria", "descripcionTienda", "direccionTienda", "ciudadTienda"] },
  { title: "Comercial", caption: "Entrega y pagos", fields: ["horarios", "whatsappNegocio"] },
  { title: "Branding", caption: "Vista previa", fields: ["colorPrincipal", "terminos"] }
];

const schema = z.object({
  nombre: z.string().min(3, "Nombre del responsable requerido"),
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "Minimo 8 caracteres"),
  telefono: z.string().min(7, "Telefono requerido").max(20),
  nombreTienda: z.string().min(2, "Nombre de tienda requerido"),
  idCategoria: z.coerce.number().int().positive("Selecciona una categoria"),
  descripcionTienda: z.string().min(10, "Describe tu tienda en al menos 10 caracteres"),
  direccionTienda: z.string().min(5, "Direccion requerida").max(255),
  ciudadTienda: z.string().min(2, "Ciudad requerida"),
  paisTienda: z.string().optional(),
  paisTiendaIso2: z.string().optional(),
  departamentoTienda: z.string().optional(),
  departamentoTiendaIso2: z.string().optional(),
  horarios: z.string().min(3, "Indica horarios de atencion"),
  metodosEntrega: z.array(z.string()).default([]),
  metodosPago: z.array(z.string()).default([]),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  whatsappNegocio: z.string().min(7, "WhatsApp de negocio requerido").max(20),
  colorPrincipal: z.string().min(1),
  colorSecundario: z.string().min(1),
  terminos: z.literal(true, { errorMap: () => ({ message: "Debes confirmar la informacion" }) })
});

const defaults = {
  nombre: "",
  email: "",
  password: "",
  telefono: "",
  nombreTienda: "",
  idCategoria: "",
  descripcionTienda: "",
  direccionTienda: "",
  ciudadTienda: "",
  paisTienda: "Colombia",
  paisTiendaIso2: "CO",
  departamentoTienda: "",
  departamentoTiendaIso2: "",
  horarios: "Lunes a sabado, 8:00 a.m. - 6:00 p.m.",
  metodosEntrega: [],
  metodosPago: [],
  instagram: "",
  facebook: "",
  whatsappNegocio: "",
  colorPrincipal: "#15803d",
  colorSecundario: "#f59e0b",
  terminos: false
};

export function RegisterSellerForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [activeStep, setActiveStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const saved = useMemo(() => readDraft(draftKey, defaults), []);

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => (await getCategorias()) ?? []
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema), defaultValues: saved, mode: "onBlur" });

  const values = watch();

  useEffect(() => {
    const subscription = watch((formValues) => {
      localStorage.setItem(draftKey, JSON.stringify({ ...formValues, password: "" }));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  async function nextStep() {
    const ok = await trigger(steps[activeStep].fields, { shouldFocus: true });
    if (ok) setActiveStep((step) => Math.min(step + 1, steps.length - 1));
  }

  async function onSubmit(values) {
    try {
      const payload = {
        rol: "Vendedor",
        nombre: values.nombre,
        email: values.email,
        password: values.password,
        telefono: values.telefono,
        nombreTienda: values.nombreTienda,
        categoriaTienda: values.idCategoria,
        direccionTienda: [values.direccionTienda, values.ciudadTienda, values.departamentoTienda, values.paisTienda].filter(Boolean).join(", ")
      };
      const { token, user } = await registerApi(payload);
      localStorage.removeItem(draftKey);
      setAuth(token, user);
      toast.success("Cuenta de Vendedor creada");
      navigate(homeForUser(user) || "/vendedor", { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo registrar");
    }
  }

  return (
    <StepperFrame
      title="Registro de Vendedor"
      subtitle="Configura tu tienda como un negocio real: identidad, operacion comercial, branding y una vista previa tipo storefront."
      steps={steps}
      activeStep={activeStep}
      onBack={() => setActiveStep((step) => Math.max(step - 1, 0))}
      onNext={nextStep}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      canSubmitLabel="Crear tienda"
      side={<StorePreview values={values} logoPreview={logoPreview} bannerPreview={bannerPreview} categorias={categorias} />}
    >
      {activeStep === 0 ? (
        <FieldGroup title="Responsable de la cuenta" description="Datos de acceso y contacto administrativo.">
          <Input label="Nombre responsable" error={errors.nombre?.message} {...register("nombre")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Contrasena" type="password" error={errors.password?.message} {...register("password")} />
          <Input label="Telefono" error={errors.telefono?.message} {...register("telefono")} />
        </FieldGroup>
      ) : null}

      {activeStep === 1 ? (
        <FieldGroup title="Informacion de tienda" description="Asi vera el cliente tu negocio en UrabaMarket.">
          <Input label="Nombre de la tienda" error={errors.nombreTienda?.message} {...register("nombreTienda")} />
          <SelectField label="Categoria" error={errors.idCategoria?.message} defaultValue="" {...register("idCategoria")}>
            <option value="" disabled>Selecciona una categoria</option>
            {categorias.map((c) => (
              <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
            ))}
          </SelectField>
          <TextareaField className="sm:col-span-2" label="Descripcion corta" error={errors.descripcionTienda?.message} {...register("descripcionTienda")} />
          <Input label="Direccion" error={errors.direccionTienda?.message} {...register("direccionTienda")} />
          <div className="sm:col-span-2">
            <LocationSelects
              value={{
                countryIso2: values.paisTiendaIso2,
                countryName: values.paisTienda,
                stateIso2: values.departamentoTiendaIso2,
                stateName: values.departamentoTienda,
                cityName: values.ciudadTienda
              }}
              errors={{ city: errors.ciudadTienda?.message }}
              onChange={(location) => {
                setValue("paisTiendaIso2", location.countryIso2, { shouldDirty: true });
                setValue("paisTienda", location.countryName, { shouldDirty: true });
                setValue("departamentoTiendaIso2", location.stateIso2, { shouldDirty: true });
                setValue("departamentoTienda", location.stateName, { shouldDirty: true });
                setValue("ciudadTienda", location.cityName, { shouldDirty: true, shouldValidate: true });
              }}
            />
          </div>
          <UploadDropzone label="Logo de tienda" hint="Vista previa local." preview={logoPreview} onChange={setLogoPreview} />
          <UploadDropzone label="Banner de tienda" hint="Imagen horizontal recomendada." preview={bannerPreview} onChange={setBannerPreview} />
        </FieldGroup>
      ) : null}

      {activeStep === 2 ? (
        <div className="space-y-5">
          <FieldGroup title="Configuracion comercial" description="Define como vendes, entregas y recibes pagos.">
            <Input className="sm:col-span-2" label="Horarios de atencion" error={errors.horarios?.message} {...register("horarios")} />
            <Input label="WhatsApp negocio" error={errors.whatsappNegocio?.message} {...register("whatsappNegocio")} />
            <Input label="Instagram" error={errors.instagram?.message} {...register("instagram")} />
            <Input label="Facebook" error={errors.facebook?.message} {...register("facebook")} />
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">Metodos de entrega</p>
              <ChoiceChips options={deliveryOptions} values={values.metodosEntrega ?? []} onToggle={(option) => toggleArray(values.metodosEntrega ?? [], option, (next) => setValue("metodosEntrega", next, { shouldDirty: true }))} />
            </div>
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">Metodos de pago aceptados</p>
              <ChoiceChips options={paymentOptions} values={values.metodosPago ?? []} onToggle={(option) => toggleArray(values.metodosPago ?? [], option, (next) => setValue("metodosPago", next, { shouldDirty: true }))} />
            </div>
          </FieldGroup>
        </div>
      ) : null}

      {activeStep === 3 ? (
        <div className="space-y-5">
          <FieldGroup title="Branding" description="Elige colores y confirma la apertura de tu tienda.">
            <Input label="Color principal" type="color" className="h-12 p-1" error={errors.colorPrincipal?.message} {...register("colorPrincipal")} />
            <Input label="Color secundario" type="color" className="h-12 p-1" error={errors.colorSecundario?.message} {...register("colorSecundario")} />
          </FieldGroup>
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" {...register("terminos")} />
            <span>Confirmo que la informacion de mi tienda es correcta y acepto las condiciones para vendedores.</span>
          </label>
          <FormError message={errors.terminos?.message} />
        </div>
      ) : null}
    </StepperFrame>
  );
}

function StorePreview({ values, logoPreview, bannerPreview, categorias }) {
  const category = categorias.find((item) => String(item.idCategoria) === String(values.idCategoria))?.nombre || "Categoria";
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="relative h-36" style={{ background: values.colorPrincipal || "#15803d" }}>
        {bannerPreview ? <img src={bannerPreview} alt="" className="h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-card">
            {logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-cover" /> : <Store className="h-7 w-7 text-slate-400" />}
          </div>
          <div className="text-white">
            <p className="text-lg font-bold">{values.nombreTienda || "Tu tienda"}</p>
            <p className="text-sm text-white/80">{category}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5 text-sm">
        <PreviewLine icon={MapPin} label="Ubicacion" value={[values.ciudadTienda, values.direccionTienda].filter(Boolean).join(" - ") || "Direccion pendiente"} />
        <PreviewLine icon={Clock} label="Horario" value={values.horarios || "Por definir"} />
        <PreviewLine icon={Truck} label="Entregas" value={(values.metodosEntrega ?? []).join(", ") || "Sin configurar"} />
        <PreviewLine icon={CreditCard} label="Pagos" value={(values.metodosPago ?? []).join(", ") || "Sin configurar"} />
        <PreviewLine icon={MessageCircle} label="WhatsApp" value={values.whatsappNegocio || "Pendiente"} />
        <PreviewLine icon={Palette} label="Color" value={values.colorPrincipal || "#15803d"} />
      </div>
    </div>
  );
}

function PreviewLine({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 text-brand-700" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function toggleArray(values, option, setNext) {
  setNext(values.includes(option) ? values.filter((value) => value !== option) : [...values, option]);
}

function readDraft(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return fallback;
  }
}
