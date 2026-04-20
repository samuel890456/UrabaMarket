import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { cn } from "../../utils/cn";

export function DataTable({ data, columns, className }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-soft", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/80">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-4 py-3 font-semibold text-slate-600"
                >
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-slate-800">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
