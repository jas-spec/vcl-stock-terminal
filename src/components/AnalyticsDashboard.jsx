import { FileText, Calendar } from 'lucide-react';
import KPICards from './KPICards';
import DataGrid from './DataGrid';
import LineChartPanel from './charts/LineChartPanel';
import BarChartPanel from './charts/BarChartPanel';
import DonutChartPanel from './charts/DonutChartPanel';
import ScatterPlotPanel from './charts/ScatterPlotPanel';

export default function AnalyticsDashboard({ data }) {
  if (!data) return null;

  const { kpi, timeSeries, categories, donut, scatter, table } = data;
  const isLive = kpi.fileName === 'VCL_Live_Feed.xlsx' || kpi.fileName?.includes('Live');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              VCL Stock Terminal
            </h2>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase animate-pulse-glow"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Feed
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {isLive ? 'Real-time liquidity, trade volumes, and transaction order books' : 'Insights and metrics processed from static ledger upload'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
            <FileText size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="max-w-[140px] truncate">{kpi.fileName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
            <Calendar size={14} style={{ color: 'var(--color-accent)' }} />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards data={kpi} />

      {/* Charts – Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineChartPanel data={timeSeries} />
        <BarChartPanel data={categories} />
      </div>

      {/* Charts – Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutChartPanel data={donut} />
        <ScatterPlotPanel data={scatter} />
      </div>

      {/* Data Grid */}
      <DataGrid data={table} />
    </div>
  );
}
