import { cn } from "../utils/cn";

export function EmptyState({ icon: Icon, title, description, children, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center",
        className
      )}
    >
      {Icon ? <Icon className="mb-3 h-12 w-12 text-slate-300" strokeWidth={1.25} /> : null}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
