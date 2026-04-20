import { Card } from "../../components/ui/Card";
import { Settings } from "lucide-react";

export function ConfigAdminPage() {
  return (
    <div className="max-w-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Configuración</h2>
      <Card className="mt-6">
        <Settings className="h-10 w-10 text-slate-400" />
        <p className="mt-4 text-sm text-slate-600">
          Zona reservada para ajustes globales (integraciones, parámetros, roles). Conecta aquí futuras APIs de
          configuración.
        </p>
      </Card>
    </div>
  );
}
