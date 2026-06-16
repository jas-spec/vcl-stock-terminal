import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartCard, CustomTooltip, useChartTheme } from './ChartComponents';

const BAR_COLORS = [
  'var(--color-accent)',
  '#10B981',
  '#EC4899',
  '#F59E0B',
  '#8B5CF6',
  '#06B6D4'
];

export default function BarChartPanel({ data }) {
  const { gridColor, textColor, axisColor } = useChartTheme();

  if (!data || data.length === 0) return null;

  return (
    <ChartCard
      id="chart-bar"
      title="Stock by Category"
      subtitle="Total inventory quantity across product categories"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              height={40}
            />
            <YAxis
              tick={{ fontSize: 11, fill: textColor }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v} qty`}
            />
            <Tooltip content={<CustomTooltip valueSuffix=" units" />} cursor={{ fill: 'var(--color-accent-soft)' }} />
            <Bar
              dataKey="value"
              name="Quantity"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
              animationDuration={300}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
