import { cn } from "../../utils/cn";

export function Input({ className, label, error, id, ...props }) {
  const inputId = id || props.name;
  return (
    <label className="block w-full">
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink shadow-soft transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
          error && "border-red-400 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
