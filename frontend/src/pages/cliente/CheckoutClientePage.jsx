import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDirecciones, postCheckout } from "../../services/api/cliente.api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/Loader";
import { useState } from "react";

export function CheckoutClientePage() {
  const navigate = useNavigate();
  const [idDir, setIdDir] = useState("");

  const { data: dirs, isLoading } = useQuery({
    queryKey: ["direcciones"],
    queryFn: getDirecciones
  });

  const mutation = useMutation({
    mutationFn: postCheckout,
    onSuccess: () => {
      toast.success("Pedido realizado");
      navigate("/cliente/pedidos");
    },
    onError: (e) => toast.error(e.response?.data?.message || "No se pudo completar")
  });

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-ink">Checkout</h2>
      <p className="mt-1 text-slate-600">Selecciona la dirección de envío.</p>
      <Card className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">Dirección de envío</label>
        <select
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
          value={idDir}
          onChange={(e) => setIdDir(e.target.value)}
        >
          <option value="">— selecciona —</option>
          {dirs?.map((d) => (
            <option key={d.idDireccion} value={d.idDireccion}>
              {d.direccion}, {d.ciudad}
            </option>
          ))}
        </select>
        <Button
          className="w-full"
          disabled={!idDir || mutation.isPending}
          onClick={() => mutation.mutate({ idDireccionEnvio: Number(idDir) })}
        >
          Confirmar compra
        </Button>
      </Card>
    </div>
  );
}
