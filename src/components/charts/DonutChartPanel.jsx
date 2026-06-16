import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartCard, useChartTheme } from './ChartComponents';

const PIE_COLORS = [
  'var(--color-accent)',
  '#10B981',
  '#EC4899',
  '#F59E0B',
  '#8B5CF6'
];

function CustomDonutTooltip({ active, payload }) {
  const { isDark } = useChartTheme();

  if (!active || !payload || !payload.length) return null;

  const { name, value } = payload[0].payload;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm shadow-xl backdrop-blur-sm"
      style={{
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
        color: isDark ? '#F1F5F9' : '#0F172A',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
        <span className="text-xs font-semibold">{name}</span>
      </div>
      <p className="text-lg font-extrabold mt-1">{value}%</p>
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DonutChartPanel({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ChartCard
      id="chart-donut"
      title="Trade Type Breakdown"
      subtitle="Proportional share of order executions today"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="42%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
              animationBegin={0}
              animationDuration={400}
            >
              {data.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={PIE_COLORS[idx % PIE_COLORS.length]}
                  className="transition-all duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomDonutTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
