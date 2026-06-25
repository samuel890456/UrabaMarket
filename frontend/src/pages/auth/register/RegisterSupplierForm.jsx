import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BadgeCheck, BriefcaseBusiness, Building2, FileText, Globe2, PackageSearch, Truck, UserRound } from "lucide-react";

import { register as registerApi } from "../../../services/api/auth.api";
import { useAuthStore } from "../../../store/authStore";
import { homeForUser } from "../../../utils/rbac";
import { Input } from "../../../components/ui/Input";
import {
  ChoiceChips,
  FieldGroup,
  FormError,
  SelectField,
  StepperFrame,
  TextareaField,
  UploadDropzone
} from "./_partials/StepperFrame";

const draftKey = "urabamarket-register-proveedor";
const coverageOptions = ["Uraba", "Antioquia", "Costa Caribe", "Nacional"];
const paymentOptions = ["Credito empresarial", "Transferencia", "Contra entrega", "Pago anticipado"];
const sectors = ["Alimentos", "Tecnologia", "Aseo", "Textil", "Ferreteria", "Papeleria", "Salud", "Otro"];
const steps = [
  { title: "Empresa", caption: "Datos B2B", fields: ["nombreEmpresa", "nit", "sector", "productosQueDistribuye"] },
  { title: "Responsable", caption: "Contacto principal", fields: ["responsable", "cargo", "email", "telefono", "password"] },
  { title: "Operacion", caption: "Cobertura y catalogo", fields: ["cobertura", "cantidadMinima", "tiempoEntrega", "metodosPago"] },
  { title: "Confirmacion", caption: "Verificacion", fields: ["terminos"] }
];

const schema = z.object({
  nombreEmpresa: z.string().min(2, "Nombre de empresa requerido").max(150),
  nit: z.string().min(5, "NIT requerido"),
  sector: z.string().min(1, "Selecciona un sector"),
  productosQueDistribuye: z.string().min(5, "Indica que productos distribuyes").max(500),
  paginaWeb: z.string().optional(),
  responsable: z.string().min(3, "Nombre del responsable requerido").max(100),
  cargo: z.string().min(2, "Cargo requerido"),
  email: z.string().email("Email invalido"),
  telefono: z.string().min(7, "Telefono requerido").max(20),
  password: z.string().min(8, "Minimo 8 caracteres"),
  cobertura: z.array(z.string()).min(1, "Selecciona al menos una cobertura"),
  cantidadMinima: z.string().min(1, "Cantidad minima requerida"),
  tiempoEntrega: z.string().min(1, "Tiempo de entrega requerido"),
  metodosPago: z.array(z.string()).min(1, "Selecciona al menos un metodo de pago"),
  terminos: z.literal(true, { errorMap: () => ({ message: "Debes aceptar los terminos B2B" }) })
});

const defaults = {
  nombreEmpresa: "",
  nit: "",
  sector: "",
  productosQueDistribuye: "",
  paginaWeb: "",
  responsable: "",
  cargo: "",
  email: "",
  telefono: "",
  password: "",
  cobertura: [],
  cantidadMinima: "",
  tiempoEntrega: "",
  metodosPago: [],
  terminos: false
};

export function RegisterSupplierForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [activeStep, setActiveStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState("");
  const [catalogPreview, setCatalogPreview] = useState("");
  const saved = useMemo(() => readDraft(draftKey, defaults), []);

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
      const { token, user } = await registerApi({
        rol: "Proveedor",
        nombreEmpresa: values.nombreEmpresa,
        responsable: values.responsable,
        email: values.email,
        telefono: values.telefono,
        productosQueDistribuye: values.productosQueDistribuye,
        password: values.password
      });
      localStorage.removeItem(draftKey);
      setAuth(token, user);
      toast.success("Cuenta de Proveedor creada");
      navigate(homeForUser(user) || "/proveedor", { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo registrar");
    }
  }

  return (
    <StepperFrame
      title="Registro de Proveedor"
      subtitle="Un onboarding B2B serio para empresas que abastecen tiendas: operacion, cobertura, catalogo y verificacion."
      steps={steps}
      activeStep={activeStep}
      onBack={() => setActiveStep((step) => Math.max(step - 1, 0))}
      onNext={nextStep}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      canSubmitLabel="Crear proveedor"
      side={<SupplierPreview values={values} logoPreview={logoPreview} catalogPreview={catalogPreview} />}
    >
      {activeStep === 0 ? (
        <FieldGroup title="Empresa" description="Datos comerciales para validar tu perfil mayorista.">
          <Input label="Nombre empresa" error={errors.nombreEmpresa?.message} {...register("nombreEmpresa")} />
          <Input label="NIT" error={errors.nit?.message} {...register("nit")} />
          <SelectField label="Sector" error={errors.sector?.message} defaultValue="" {...register("sector")}>
            <option value="" disabled>Selecciona un sector</option>
            {sectors.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
          </SelectField>
          <Input label="Pagina web (opcional)" error={errors.paginaWeb?.message} {...register("paginaWeb")} />
          <TextareaField className="sm:col-span-2" label="Productos que distribuye" error={errors.productosQueDistribuye?.message} {...register("productosQueDistribuye")} />
        </FieldGroup>
      ) : null}

      {activeStep === 1 ? (
        <FieldGroup title="Responsable" description="Contacto principal para negociaciones y soporte B2B.">
          <Input label="Nombre completo" error={errors.responsable?.message} {...register("responsable")} />
          <Input label="Cargo" error={errors.cargo?.message} {...register("cargo")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Telefono" error={errors.telefono?.message} {...register("telefono")} />
          <Input label="Contrasena" type="password" error={errors.password?.message} {...register("password")} />
        </FieldGroup>
      ) : null}

      {activeStep === 2 ? (
        <FieldGroup title="Operacion comercial" description="Define condiciones operativas para tiendas compradoras.">
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Cobertura</p>
            <ChoiceChips options={coverageOptions} values={values.cobertura ?? []} onToggle={(option) => toggleArray(values.cobertura ?? [], option, (next) => setValue("cobertura", next, { shouldDirty: true, shouldValidate: true }))} />
            <FormError message={errors.cobertura?.message} />
          </div>
          <Input label="Cantidad minima de compra" error={errors.cantidadMinima?.message} {...register("cantidadMinima")} />
          <Input label="Tiempo de entrega promedio" error={errors.tiempoEntrega?.message} {...register("tiempoEntrega")} />
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Metodos de pago</p>
            <ChoiceChips options={paymentOptions} values={values.metodosPago ?? []} onToggle={(option) => toggleArray(values.metodosPago ?? [], option, (next) => setValue("metodosPago", next, { shouldDirty: true, shouldValidate: true }))} />
            <FormError message={errors.metodosPago?.message} />
          </div>
          <UploadDropzone label="Catalogo PDF (opcional)" hint="Solo UI por ahora." preview={catalogPreview} onChange={setCatalogPreview} />
          <UploadDropzone label="Logo empresa" hint="Vista previa local." preview={logoPreview} onChange={setLogoPreview} />
        </FieldGroup>
      ) : null}

      {activeStep === 3 ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-ink">Resumen de verificacion</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Summary label="Empresa" value={values.nombreEmpresa || "Pendiente"} />
              <Summary label="NIT" value={values.nit || "Pendiente"} />
              <Summary label="Responsable" value={values.responsable || "Pendiente"} />
              <Summary label="Cobertura" value={(values.cobertura ?? []).join(", ") || "Pendiente"} />
            </div>
          </div>
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" {...register("terminos")} />
            <span>Acepto terminos B2B, verificacion comercial y tratamiento de datos empresariales.</span>
          </label>
          <FormError message={errors.terminos?.message} />
        </div>
      ) : null}
    </StepperFrame>
  );
}

function SupplierPreview({ values, logoPreview, catalogPreview }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
          {logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-7 w-7 text-slate-400" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-ink">{values.nombreEmpresa || "Empresa proveedora"}</p>
          <p className="text-sm text-slate-500">{values.sector || "Sector pendiente"}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            Perfil B2B
          </span>
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm">
        <PreviewLine icon={FileText} label="NIT" value={values.nit || "Pendiente"} />
        <PreviewLine icon={PackageSearch} label="Distribuye" value={values.productosQueDistribuye || "Pendiente"} />
        <PreviewLine icon={UserRound} label="Responsable" value={[values.responsable, values.cargo].filter(Boolean).join(" - ") || "Pendiente"} />
        <PreviewLine icon={Truck} label="Cobertura" value={(values.cobertura ?? []).join(", ") || "Sin cobertura"} />
        <PreviewLine icon={BriefcaseBusiness} label="Minimo" value={values.cantidadMinima || "Por definir"} />
        <PreviewLine icon={Globe2} label="Web / Catalogo" value={values.paginaWeb || (catalogPreview ? "Catalogo cargado" : "Opcional")} />
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

function Summary({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-700">{value}</p>
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
