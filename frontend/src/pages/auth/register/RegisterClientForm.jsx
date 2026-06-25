import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, Heart, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { register as registerApi } from "../../../services/api/auth.api";
import { useAuthStore } from "../../../store/authStore";
import { homeForUser } from "../../../utils/rbac";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { LocationSelects } from "../../../components/location/LocationSelects";
import {
  ChoiceChips,
  FieldGroup,
  FormError,
  SelectField,
  SocialLoginMock,
  StepperFrame,
  TextareaField,
  UploadDropzone
} from "./_partials/StepperFrame";

const draftKey = "urabamarket-register-cliente";
const interests = ["Tecnologia", "Moda", "Hogar", "Belleza", "Mercado", "Deportes", "Mascotas", "Ofertas"];
const steps = [
  { title: "Cuenta", caption: "Acceso y contacto", fields: ["nombre", "email", "password", "confirmPassword", "telefono"] },
  { title: "Ubicacion", caption: "Datos de entrega", fields: ["departamento", "ciudad", "direccion", "referenciaEntrega"] },
  { title: "Perfil", caption: "Preferencias y terminos", fields: ["terminos"] }
];

const schema = z.object({
  nombre: z.string().min(3, "Escribe tu nombre completo"),
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "Minimo 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contrasena"),
  telefono: z.string().min(7, "Telefono requerido").max(20),
  departamento: z.string().min(2, "Departamento requerido"),
  ciudad: z.string().min(2, "Ciudad requerida"),
  pais: z.string().optional(),
  paisIso2: z.string().optional(),
  departamentoIso2: z.string().optional(),
  direccion: z.string().min(5, "Direccion requerida"),
  referenciaEntrega: z.string().min(3, "Agrega una referencia de entrega"),
  codigoPostal: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  genero: z.string().optional(),
  intereses: z.array(z.string()).default([]),
  terminos: z.literal(true, { errorMap: () => ({ message: "Debes aceptar los terminos" }) })
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contrasenas no coinciden"
});

const defaults = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
  telefono: "",
  departamento: "",
  ciudad: "",
  pais: "Colombia",
  paisIso2: "CO",
  departamentoIso2: "",
  direccion: "",
  referenciaEntrega: "",
  codigoPostal: "",
  fechaNacimiento: "",
  genero: "",
  intereses: [],
  terminos: false
};

export function RegisterClientForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [activeStep, setActiveStep] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState("");
  const saved = useMemo(() => readDraft(draftKey, defaults), []);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: saved,
    mode: "onBlur"
  });

  const values = watch();
  const passwordScore = getPasswordScore(values.password);

  useEffect(() => {
    const subscription = watch((formValues) => {
      localStorage.setItem(draftKey, JSON.stringify({ ...formValues, password: "", confirmPassword: "" }));
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
        rol: "Cliente",
        nombre: values.nombre,
        email: values.email,
        password: values.password,
        telefono: values.telefono,
        direccion: [values.direccion, values.referenciaEntrega, values.codigoPostal ? `CP ${values.codigoPostal}` : ""].filter(Boolean).join(" - "),
        ciudad: [values.ciudad, values.departamento, values.pais].filter(Boolean).join(", "),
        esPrincipal: true
      };
      const { token, user } = await registerApi(payload);
      localStorage.removeItem(draftKey);
      setAuth(token, user);
      toast.success("Cuenta de Cliente creada");
      navigate(homeForUser(user) || "/cliente", { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo registrar");
    }
  }

  return (
    <StepperFrame
      title="Registro de Cliente"
      subtitle="Crea una cuenta con datos de entrega, preferencias y una vista previa clara de tu perfil comprador."
      steps={steps}
      activeStep={activeStep}
      onBack={() => setActiveStep((step) => Math.max(step - 1, 0))}
      onNext={nextStep}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      canSubmitLabel="Crear cuenta cliente"
      side={<ClientPreview values={values} avatarPreview={avatarPreview} score={passwordScore} />}
    >
      {activeStep === 0 ? (
        <div className="space-y-5">
          <SocialLoginMock />
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            o registrate con email
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <FieldGroup title="Cuenta" description="Usaremos estos datos para iniciar sesion y avisarte sobre tus compras.">
            <Input label="Nombre completo" error={errors.nombre?.message} {...register("nombre")} />
            <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
            <div>
              <Input label="Contrasena" type="password" error={errors.password?.message} {...register("password")} />
              <PasswordMeter score={passwordScore} />
            </div>
            <Input label="Confirmar contrasena" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            <Input label="Telefono" error={errors.telefono?.message} {...register("telefono")} />
          </FieldGroup>
        </div>
      ) : null}

      {activeStep === 1 ? (
        <FieldGroup title="Ubicacion de entrega" description="Deja una direccion base para agilizar tus compras.">
          <div className="sm:col-span-2">
            <LocationSelects
              value={{
                countryIso2: values.paisIso2,
                countryName: values.pais,
                stateIso2: values.departamentoIso2,
                stateName: values.departamento,
                cityName: values.ciudad
              }}
              errors={{
                state: errors.departamento?.message,
                city: errors.ciudad?.message
              }}
              onChange={(location) => {
                setValue("paisIso2", location.countryIso2, { shouldDirty: true });
                setValue("pais", location.countryName, { shouldDirty: true });
                setValue("departamentoIso2", location.stateIso2, { shouldDirty: true });
                setValue("departamento", location.stateName, { shouldDirty: true, shouldValidate: true });
                setValue("ciudad", location.cityName, { shouldDirty: true, shouldValidate: true });
              }}
            />
          </div>
          <Input label="Direccion" error={errors.direccion?.message} {...register("direccion")} />
          <Input label="Codigo postal (opcional)" error={errors.codigoPostal?.message} {...register("codigoPostal")} />
          <TextareaField className="sm:col-span-2" label="Referencia de entrega" error={errors.referenciaEntrega?.message} {...register("referenciaEntrega")} />
        </FieldGroup>
      ) : null}

      {activeStep === 2 ? (
        <div className="space-y-5">
          <FieldGroup title="Perfil comprador" description="Personaliza la experiencia y confirma tus preferencias.">
            <div className="sm:col-span-2">
              <UploadDropzone label="Foto de perfil" hint="JPG o PNG. Solo vista previa por ahora." preview={avatarPreview} onChange={setAvatarPreview} />
            </div>
            <Input label="Fecha de nacimiento (opcional)" type="date" error={errors.fechaNacimiento?.message} {...register("fechaNacimiento")} />
            <SelectField label="Genero (opcional)" error={errors.genero?.message} {...register("genero")}>
              <option value="">Prefiero no decirlo</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </SelectField>
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">Preferencias de compra</p>
              <ChoiceChips
                options={interests}
                values={values.intereses ?? []}
                onToggle={(option) => toggleArray(values.intereses ?? [], option, (next) => setValue("intereses", next, { shouldDirty: true }))}
              />
            </div>
          </FieldGroup>
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600" {...register("terminos")} />
            <span>Acepto terminos, tratamiento de datos y politicas de compra de UrabaMarket.</span>
          </label>
          <FormError message={errors.terminos?.message} />
        </div>
      ) : null}
    </StepperFrame>
  );
}

function ClientPreview({ values, avatarPreview, score }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="h-28 bg-gradient-to-r from-emerald-700 via-slate-900 to-amber-500" />
      <div className="-mt-10 p-5">
        <div className="flex items-end gap-3">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 text-slate-400 shadow-card">
            {avatarPreview ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8" />}
          </div>
          <div className="pb-1">
            <p className="text-lg font-bold text-ink">{values.nombre || "Tu nombre"}</p>
            <p className="text-sm text-slate-500">Cliente verificado</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 text-sm">
          <PreviewLine icon={Mail} label="Email" value={values.email || "correo@ejemplo.com"} />
          <PreviewLine icon={Phone} label="Telefono" value={values.telefono || "Sin telefono"} />
          <PreviewLine icon={MapPin} label="Entrega" value={[values.ciudad, values.departamento].filter(Boolean).join(", ") || "Ubicacion pendiente"} />
          <PreviewLine icon={CalendarDays} label="Nacimiento" value={values.fechaNacimiento || "Opcional"} />
          <PreviewLine icon={Heart} label="Intereses" value={(values.intereses ?? []).slice(0, 3).join(", ") || "Aun sin preferencias"} />
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seguridad</p>
          <PasswordMeter score={score} compact />
        </div>
      </div>
    </div>
  );
}

function PreviewLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 text-brand-700" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function PasswordMeter({ score, compact = false }) {
  const labels = ["Muy debil", "Basica", "Aceptable", "Fuerte", "Excelente"];
  return (
    <div className={compact ? "mt-2" : "mt-2"}>
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1.5 rounded-full ${score > i ? "bg-brand-600" : "bg-slate-200"}`} />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">{labels[score]}</p>
    </div>
  );
}

function getPasswordScore(password = "") {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
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
