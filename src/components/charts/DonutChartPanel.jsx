import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartCard, useChartTheme } from './ChartComponents';

const STATUS_COLORS = {
  'In Stock': '#10B981',
  'Low Stock': '#F59E0B',
  'Out of Stock': '#EF4444',
  'Overstocked': '#6366F1',
};

const PIE_COLOR_ORDER = ['#10B981', '#F59E0B', '#EF4444', '#6366F1'];

function CustomDonutTooltip({ active, payload }) {
  const { isDark } = useChartTheme();

  if (!active || !payload || !payload.length) return null;

  const { name, value, count } = payload[0].payload;
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
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[name] || '#6366F1' }} />
        <span className="text-xs font-semibold">{name}</span>
      </div>
      <p className="text-lg font-extrabold mt-1">{value}%</p>
      {count !== undefined && (
        <p className="text-[10px] font-medium mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          {count} item{count !== 1 ? 's' : ''}
        </p>
      )}
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
      title="Stock Status Distribution"
      subtitle="Proportion of inventory by stock health status"
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
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={STATUS_COLORS[entry.name] || PIE_COLOR_ORDER[idx % PIE_COLOR_ORDER.length]}
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
