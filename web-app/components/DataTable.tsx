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
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-6 py-3 text-left text-sm font-semibold text-gray-900 ${col.width || ""}`}
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
        <tbody className="divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-700">
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
