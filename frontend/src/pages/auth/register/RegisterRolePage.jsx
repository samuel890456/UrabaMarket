import { Link } from "react-router-dom";
import { BadgeCheck, Factory, Store, User } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const roles = [
  {
    key: "Cliente",
    to: "/register/cliente",
    icon: User,
    title: "Cliente",
    desc: "Compra fácil: explora tiendas, agrega al carrito y realiza pedidos en minutos."
  },
  {
    key: "Vendedor",
    to: "/register/vendedor",
    icon: Store,
    title: "Vendedor",
    desc: "Crea tu tienda, publica productos y gestiona inventario y ventas."
  },
  {
    key: "Proveedor",
    to: "/register/proveedor",
    icon: Factory,
    title: "Proveedor",
    desc: "Ofrece productos al por mayor y recibe solicitudes B2B de tiendas."
  }
];

export function RegisterRolePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-800 shadow-soft">
          <BadgeCheck className="h-3.5 w-3.5 text-accent" />
          Registro sin fricción
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Elige el tipo de cuenta
        </h1>
        <p className="mt-3 text-slate-600">
          Selecciona tu rol para crear una cuenta con el flujo adecuado.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {roles.map(({ key, to, icon: Icon, title, desc }) => (
          <Link key={key} to={to} className="group block">
            <Card className="h-full p-6 transition-transform duration-200 group-hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              <div className="mt-6">
                <Button className="w-full" variant={title === "Cliente" ? "default" : "outline"}>
                  Continuar
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Ingresar
        </Link>
      </p>
    </div>
  );
}
