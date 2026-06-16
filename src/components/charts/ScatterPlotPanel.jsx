import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
} from 'recharts';
import { useMemo } from 'react';
import { ChartCard, useChartTheme } from './ChartComponents';

const SCATTER_COLORS = {
  'Bids': '#10B981',        // Green buy orders
  'Asks': '#EF4444',        // Red sell orders
  'Stop Orders': '#F59E0B', // Amber stop orders
};

function CustomScatterTooltip({ active, payload }) {
  const { isDark } = useChartTheme();

  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isBid = data.category === 'Bids';
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm shadow-xl backdrop-blur-sm"
      style={{
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
        color: isDark ? '#F1F5F9' : '#0F172A',
      }}
    >
      <p className="text-xs font-bold mb-1.5" style={{ color: SCATTER_COLORS[data.category] || 'var(--color-accent)' }}>
        {data.category}
      </p>
      <div className="space-y-0.5 text-xs font-medium">
        <p>
          <span style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Offset:</span>{' '}
          <span className="font-semibold">{data.x >= 0 ? '+' : ''}${data.x.toFixed(2)}</span>
        </p>
        <p>
          <span style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Order Qty:</span>{' '}
          <span className="font-semibold">{data.y.toLocaleString()} shares</span>
        </p>
      </div>
    </div>
  );
}

export default function ScatterPlotPanel({ data }) {
  const { gridColor, textColor, axisColor } = useChartTheme();

  const groupedData = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, item) => {
      const key = item.category || 'Default';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <ChartCard
      id="chart-scatter"
      title="Order Book Depth Scatter"
      subtitle="Bids, asks, and stops offset from current midprice"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              type="number"
              dataKey="x"
              name="Price Offset"
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              tickFormatter={(v) => `${v >= 0 ? '+' : ''}$${v}`}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Order Size"
              tick={{ fontSize: 11, fill: textColor }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}sh`}
            />
            <ZAxis type="number" dataKey="z" range={[40, 180]} />
            <Tooltip content={<CustomScatterTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: textColor }}
            />
            {Object.entries(groupedData).map(([group, points]) => (
              <Scatter
                key={group}
                name={group}
                data={points}
                fill={SCATTER_COLORS[group] || 'var(--color-accent)'}
                fillOpacity={0.75}
                animationDuration={300}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
