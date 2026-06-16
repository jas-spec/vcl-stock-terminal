import { FileText, Calendar, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import KPICards from './KPICards';
import DataGrid from './DataGrid';
import LineChartPanel from './charts/LineChartPanel';
import BarChartPanel from './charts/BarChartPanel';
import DonutChartPanel from './charts/DonutChartPanel';
import ScatterPlotPanel from './charts/ScatterPlotPanel';

export default function AnalyticsDashboard({ data }) {
  if (!data) return null;

  const { kpi, timeSeries, categories, donut, scatter, table, alerts } = data;
  const isLive = kpi.fileName === 'VCL_Live_Feed.xlsx' || kpi.fileName?.includes('Live') || kpi.fileName?.includes('Inventory');

  // Split alerts into critical and warning
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical') || [];
  const warningAlerts = alerts?.filter(a => a.severity === 'warning') || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              VCL Inventory Dashboard
            </h2>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase animate-pulse-glow"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Tracking
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {isLive ? 'Real-time inventory levels, stock alerts, and warehouse analytics' : 'Inventory insights processed from uploaded data file'}
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
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── Out-of-Stock Alert Banner ─────────────────────────────── */}
      {criticalAlerts.length > 0 && (
        <div className="rounded-2xl border p-4 space-y-3 animate-scale-in"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.04)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10">
              <XCircle size={16} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-500">
                {criticalAlerts.length} Item{criticalAlerts.length > 1 ? 's' : ''} Out of Stock!
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                These items need immediate restocking
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {criticalAlerts.slice(0, 8).map((alert, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.06)',
                  borderColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                }}>
                <XCircle size={12} />
                {alert.name}
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-500/10">
                  {alert.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Low-Stock Warning Banner ──────────────────────────────── */}
      {warningAlerts.length > 0 && (
        <div className="rounded-2xl border p-4 space-y-3 animate-fade-in-up"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.04)',
            borderColor: 'rgba(245, 158, 11, 0.2)',
          }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#F59E0B' }}>
                {warningAlerts.length} Item{warningAlerts.length > 1 ? 's' : ''} Running Low
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Below reorder level — consider restocking soon
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {warningAlerts.slice(0, 6).map((alert, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.06)',
                  borderColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#D97706',
                }}>
                <AlertTriangle size={12} />
                {alert.name} ({alert.quantity} left)
              </div>
            ))}
          </div>
        </div>
      )}

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
