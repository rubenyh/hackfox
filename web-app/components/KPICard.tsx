interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export function KPICard({ label, value, change, icon }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${change >= 0 ? "text-red-600" : "text-green-600"}`}>
              {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs semana anterior
            </p>
          )}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}
