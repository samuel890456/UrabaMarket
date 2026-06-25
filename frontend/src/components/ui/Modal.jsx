import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

export function Modal({ open, onClose, title, description, children, className, headerClassName, bodyClassName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full max-w-2xl animate-fade-in flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl ring-1 ring-slate-900/5",
          className
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6",
            headerClassName
          )}
        >
          <div className="min-w-0">
            {title ? <h2 className="text-lg font-semibold text-ink">{title}</h2> : <span />}
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0 rounded-full p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn("min-h-0 overflow-y-auto p-5 sm:p-6", bodyClassName)}>{children}</div>
      </div>
    </div>
  );
}
