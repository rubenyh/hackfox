interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export function KPICard({ label, value, change, icon }: KPICardProps) {
  return (
    <div className="gov-card p-6 transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium gov-text-muted">{label}</p>
          <p className="text-3xl font-bold gov-text-tertiary mt-2">{value}</p>
          {change !== undefined && (
            <p
              className={`text-sm mt-2 font-semibold ${
                change >= 0 ? "gov-text-success" : "gov-text-primary"
              }`}
            >
              {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs semana anterior
            </p>
          )}
        </div>
        {icon && <div className="gov-text-accent">{icon}</div>}
      </div>
    </div>
  );
}
