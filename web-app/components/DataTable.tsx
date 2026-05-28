import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T;
  sortDirection?: "asc" | "desc";
}

export function DataTable<T>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto gov-card">
      <table className="w-full">
        <thead className="gov-table-head border-b gov-border">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-6 py-3 text-left text-sm font-semibold gov-text-tertiary ${col.width || ""}`}
              >
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => col.sortable && onSort?.(col.key)}>
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="gov-divide-y">
          {data.map((row, idx) => (
            <tr key={idx} className="gov-table-row transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4 text-sm gov-text-muted">
                  {col.render ? col.render((row as any)[col.key]) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
