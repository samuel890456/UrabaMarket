import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const variants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-600 text-white shadow-soft hover:bg-brand-700",
        secondary: "bg-premium text-white shadow-soft hover:bg-slate-800",
        outline:
          "border border-slate-200 bg-white text-ink shadow-soft hover:bg-slate-50 hover:border-slate-300",
        ghost: "text-ink hover:bg-slate-100",
        accent: "bg-accent text-premium shadow-soft hover:brightness-95"
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-3 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export function Button({ className, variant, size, type = "button", ...props }) {
  return <button type={type} className={cn(variants({ variant, size }), className)} {...props} />;
}
