import { Link } from "react-router-dom";
import { Card } from "../../../../components/ui/Card";

export function RegisterShell({ title, subtitle, children, backTo = "/register" }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <Link to={backTo} className="text-sm font-medium text-brand-700 hover:underline">
          ← Volver
        </Link>
      </div>
      <Card className="overflow-hidden border-slate-200" padding="none">
        <div className="border-b border-slate-100 bg-slate-950 px-6 py-6 text-white">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
        </div>
        <div className="p-6">{children}</div>
      </Card>
    </div>
  );
}
