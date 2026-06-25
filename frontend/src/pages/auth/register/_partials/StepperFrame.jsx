import { Link } from "react-router-dom";
import { forwardRef } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../utils/cn";

export function StepperFrame({
  title,
  subtitle,
  steps,
  activeStep,
  children,
  side,
  onBack,
  onNext,
  onSubmit,
  isSubmitting,
  canSubmitLabel = "Crear cuenta"
}) {
  const progress = Math.round(((activeStep + 1) / steps.length) * 100);
  const isLast = activeStep === steps.length - 1;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-10">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 bg-white px-5 py-5 sm:px-7">
            <Link to="/register" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
              <ArrowLeft className="h-4 w-4" />
              Volver a roles
            </Link>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Onboarding UrabaMarket</p>
                <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
              <div className="min-w-44 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Progreso</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 px-4 py-4 sm:px-7">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const done = index < activeStep;
                const current = index === activeStep;
                return (
                  <button
                    key={step.title}
                    type="button"
                    className={cn(
                      "flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all",
                      current && "border-brand-300 bg-brand-50 shadow-sm",
                      done && "border-brand-200 bg-white",
                      !current && !done && "border-slate-100 bg-slate-50"
                    )}
                    aria-current={current ? "step" : undefined}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                        current && "border-brand-600 bg-brand-600 text-white",
                        done && "border-brand-600 bg-white text-brand-700",
                        !current && !done && "border-slate-200 bg-white text-slate-400"
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{step.title}</span>
                      <span className="block truncate text-xs text-slate-500">{step.caption}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={onSubmit} className="px-5 py-6 sm:px-7">
            <div className="animate-fade-in">{children}</div>
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={onBack} disabled={activeStep === 0 || isSubmitting}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              {isLast ? (
                <Button type="submit" disabled={isSubmitting} className="sm:min-w-44">
                  {isSubmitting ? "Creando..." : canSubmitLabel}
                </Button>
              ) : (
                <Button type="button" onClick={onNext} className="sm:min-w-44">
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {side}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-card">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-ink">Registro protegido</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">Tus datos se usan para operar tu cuenta y mejorar la experiencia dentro del marketplace.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function FieldGroup({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs font-medium text-red-600">{message}</span>;
}

export const TextareaField = forwardRef(function TextareaField({ label, error, className, ...props }, ref) {
  return (
    <label className={cn("block w-full", className)}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10",
          error && "border-red-400 focus:ring-red-200"
        )}
        {...props}
      />
      <FormError message={error} />
    </label>
  );
});

export const SelectField = forwardRef(function SelectField({ label, error, children, className, ...props }, ref) {
  return (
    <label className={cn("block w-full", className)}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10",
          error && "border-red-400 focus:ring-red-200"
        )}
        {...props}
      >
        {children}
      </select>
      <FormError message={error} />
    </label>
  );
});

export function ChoiceChips({ options, values = [], onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function UploadDropzone({ label, hint, preview, onChange }) {
  const isImagePreview = preview && preview.startsWith("blob:");
  return (
    <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white p-4 transition-colors hover:border-brand-400 hover:bg-brand-50/40">
      <span className="block text-sm font-semibold text-ink">{label}</span>
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs text-slate-400">
          {isImagePreview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : preview ? "OK" : "IMG"}
        </div>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">Seleccionar archivo</span>
      </div>
      <input
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange(file.type.startsWith("image/") ? URL.createObjectURL(file) : file.name, file);
        }}
      />
    </label>
  );
}

export function SocialLoginMock() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300">
        Continuar con Google
      </button>
      <button type="button" className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300">
        Continuar con Facebook
      </button>
    </div>
  );
}
