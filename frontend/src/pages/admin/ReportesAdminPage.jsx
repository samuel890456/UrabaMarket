import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { BarChart3 } from "lucide-react";

export function ReportesAdminPage() {
  return (
    <div className="max-w-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Reportes</h2>
      <p className="mt-2 text-slate-600">
        Los indicadores clave están en el dashboard. Próximos pasos: exportación, filtros por fecha y gráficos
        con Recharts.
      </p>
      <Card className="mt-8">
        <BarChart3 className="h-10 w-10 text-brand-500" />
        <p className="mt-4 text-sm text-slate-600">
          Mientras tanto, usa el resumen numérico en <strong>Dashboard</strong>.
        </p>
        <Link
          to="/admin"
          className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Ir al dashboard →
        </Link>
      </Card>
    </div>
  );
}
