import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DemoBadge } from "@/components/common";

const BLUE = "var(--bps-blue)";
const ORANGE = "var(--bps-orange)";
const GREEN = "var(--bps-green)";
const GRAY = "var(--color-chart-5)";

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  tickLine: false,
  axisLine: false,
  fontSize: 12,
} as const;

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--color-border)",
    background: "var(--color-popover)",
    color: "var(--color-popover-foreground)",
    fontSize: 12,
    boxShadow: "var(--shadow-soft)",
  },
  cursor: { stroke: "var(--color-border)" },
} as const;

export function ChartCard({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="panel animate-fade-up p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <DemoBadge full />
        </div>
      </div>
      <div className="h-[260px] w-full">{children}</div>
    </div>
  );
}

export function GrowthLineChart({
  data,
  compare = true,
}: {
  data: { year: string; value: number; national?: number }[];
  compare?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="year" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} />
        {compare && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />}
        <Line
          type="monotone"
          dataKey="value"
          name="Kalimantan Tengah"
          stroke={BLUE}
          strokeWidth={2.5}
          dot={{ r: 3, fill: BLUE }}
          activeDot={{ r: 5 }}
          animationDuration={700}
        />
        {compare && (
          <Line
            type="monotone"
            dataKey="national"
            name="Nasional"
            stroke={ORANGE}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            animationDuration={700}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PovertyAreaChart({ data }: { data: { year: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="bpsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.28} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="year" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey="value"
          name="Tingkat kemiskinan (%)"
          stroke={BLUE}
          strokeWidth={2.5}
          fill="url(#bpsArea)"
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MoversBarChart({
  data,
}: {
  data: { region: string; delta: number }[];
}) {
  const min = Math.min(...data.map((d) => d.delta));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="region" {...axisProps} interval={0} height={50} angle={-18} dy={12} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
        <Bar dataKey="delta" name="Perubahan (poin)" radius={[6, 6, 0, 0]} animationDuration={700}>
          {data.map((d) => (
            <Cell key={d.region} fill={d.delta === min ? ORANGE : BLUE} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SectorDonutChart({ data }: { data: { name: string; value: number }[] }) {
  const colors = [BLUE, ORANGE, GREEN, "var(--color-chart-4)", GRAY];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={92}
          paddingAngle={2}
          stroke="var(--color-card)"
          strokeWidth={2}
          animationDuration={700}
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={colors[i % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
