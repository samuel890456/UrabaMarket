import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { getProductos } from "../../services/api/catalog.api";
import { CardProducto } from "../../components/product/CardProducto";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/Loader";

export function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["productos", "destacados"],
    queryFn: () => getProductos({ limit: 8, page: 1 })
  });

  const items = data?.items ?? [];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-brand-50/40 to-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:flex lg:items-center lg:gap-12 lg:py-28">
          <div className="max-w-xl animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-800 shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Comercio local, experiencia global
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Compra en Urabá con la claridad de{" "}
              <span className="text-brand-600">Mercado Libre</span> y la calma de{" "}
              <span className="text-premium">Shopify</span>.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Explora tiendas de la región, compara productos y recibe en la puerta de tu casa cuando el
              comercio lo permita.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/productos">
                <Button size="lg">
                  Ver catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/tiendas">
                <Button variant="outline" size="lg">
                  Tiendas
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-12 hidden flex-1 lg:mt-0 lg:block">
            <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-gradient-to-br from-brand-100 to-slate-50"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">Productos destacados</h2>
            <p className="mt-1 text-sm text-slate-500">Selección reciente del marketplace</p>
          </div>
          <Link to="/productos" className="text-sm font-medium text-brand-700 hover:underline">
            Ver todos
          </Link>
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <CardProducto key={p.idProducto} producto={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
