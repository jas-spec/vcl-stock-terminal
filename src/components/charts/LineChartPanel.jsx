import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartCard, CustomTooltip, useChartTheme } from './ChartComponents';

// Dynamic color palette for any product names
const COLOR_PALETTE = [
  'var(--color-accent)',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
];

function getProductColor(index) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export default function LineChartPanel({ data }) {
  const { gridColor, textColor, axisColor } = useChartTheme();

  if (!data || !data.data || data.data.length === 0) return null;

  const { data: chartData, products } = data;

  return (
    <ChartCard
      id="chart-line"
      title="Inventory Levels Over Time"
      subtitle="Daily stock quantity trends for key products"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              minTickGap={15}
            />
            <YAxis
              domain={[0, 'auto']}
              tick={{ fontSize: 11, fill: textColor }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v} qty`}
            />
            <Tooltip content={<CustomTooltip valueSuffix=" units" />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: textColor }}
            />
            {products.map((product, idx) => (
              <Line
                key={product}
                type="monotone"
                dataKey={product}
                name={product}
                stroke={getProductColor(idx)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: getProductColor(idx) }}
                animationDuration={300}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
