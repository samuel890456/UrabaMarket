import { cn } from "../../utils/cn";

export function Card({ className, children, padding = "md" }) {
  const p = padding === "none" ? "" : padding === "sm" ? "p-4" : "p-6";
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white shadow-card transition-shadow hover:shadow-md",
        p,
        className
      )}
    >
      {children}
    </div>
  );
}
