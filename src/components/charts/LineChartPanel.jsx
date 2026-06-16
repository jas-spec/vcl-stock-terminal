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

export default function LineChartPanel({ data }) {
  const { gridColor, textColor, axisColor } = useChartTheme();

  if (!data || data.length === 0) return null;

  return (
    <ChartCard
      id="chart-line"
      title="VCL Real-Time Price"
      subtitle="Live stock values and 5-tick rolling average"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              minTickGap={15}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: textColor }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip valuePrefix="$" />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: textColor }}
            />
            <Line
              type="monotone"
              dataKey="price"
              name="Stock Price"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: 'var(--color-accent)' }}
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="avgPrice"
              name="5-Tick Moving Average"
              stroke="#EC4899"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 1, fill: '#EC4899' }}
              strokeDasharray="4 4"
              animationDuration={300}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
