import { Link } from "react-router-dom";

export function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">        
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span className="text-slate-300">/</span>}
            {item.to ? (
              <Link
                to={item.to}
                className="text-slate-500 transition-colors hover:text-brand-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
