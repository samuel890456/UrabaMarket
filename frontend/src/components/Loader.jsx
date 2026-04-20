import { cn } from "../utils/cn";

export function Loader({ className, label = "Cargando…" }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}>
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
        aria-hidden
      />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}
