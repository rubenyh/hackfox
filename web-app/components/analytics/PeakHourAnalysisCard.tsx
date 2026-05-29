import { Clock } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PeakHourPoint = {
  hour: string;
  occupancy: number;
};

type PeakHourAnalysisCardProps = {
  data: PeakHourPoint[];
};

export function PeakHourAnalysisCard({ data }: PeakHourAnalysisCardProps) {
  return (
    <div className="gov-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold gov-text-tertiary">Peak Hour Analysis</h3>
          <p className="gov-text-muted text-sm">Promedio de ocupacion por hora</p>
        </div>
        <Clock size={20} className="gov-text-accent" />
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7A1F2B" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#7A1F2B" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#D6CABB" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="occupancy"
            name="Ocupacion promedio"
            stroke="#7A1F2B"
            fill="url(#colorOcc)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 text-xs gov-text-muted">
        <span className="analytics-chip analytics-chip-neutral">Pico maniana</span>
        <span className="analytics-chip analytics-chip-neutral">Medio dia</span>
        <span className="analytics-chip analytics-chip-neutral">Pico tarde</span>
      </div>
    </div>
  );
}
