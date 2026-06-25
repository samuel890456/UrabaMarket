import { cn } from "../../utils/cn";
import { forwardRef } from "react";

export const Input = forwardRef(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label className="block w-full">
        {label ? (
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10",
            error && "border-red-400 focus:ring-red-200",
            className
          )}
          {...props}
        />
        {error ? (
          <span className="mt-1 block text-xs text-red-600">{error}</span>
        ) : null}
      </label>
    );
  }
);
