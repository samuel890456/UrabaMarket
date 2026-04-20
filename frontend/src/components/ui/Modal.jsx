import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

export function Modal({ open, onClose, title, children, className }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-premium/40 backdrop-blur-sm animate-fade-in"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg animate-fade-in rounded-2xl border border-slate-100 bg-white p-6 shadow-xl",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title ? <h2 className="text-lg font-semibold text-ink">{title}</h2> : <span />}
          <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
