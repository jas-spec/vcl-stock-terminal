/* eslint-disable react-refresh/only-export-components */
import { useTheme } from '../../context/ThemeContext';

// Shared chart tooltip component
export function CustomTooltip({ active, payload, label, valuePrefix = '', valueSuffix = '' }) {
  const { isDark } = useTheme();

  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 text-sm shadow-xl backdrop-blur-sm"
      style={{
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
        color: isDark ? '#F1F5F9' : '#0F172A',
      }}
    >
      {label && (
        <p className="text-xs font-medium mb-2" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            {entry.name}:
          </span>
          <span className="text-xs font-semibold">
            {valuePrefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}

// Shared chart wrapper
export function ChartCard({ title, subtitle, children, id }) {
  return (
    <div
      id={id}
      className="rounded-2xl p-5 transition-all duration-300 animate-fade-in-up"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// Common chart colors
export const CHART_COLORS = {
  primary: '#6366F1',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EC4899',
  fifth: '#8B5CF6',
  sixth: '#06B6D4',
};

export const DONUT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export function useChartTheme() {
  const { isDark } = useTheme();
  return {
    gridColor: isDark ? '#1E293B' : '#F1F5F9',
    textColor: isDark ? '#64748B' : '#94A3B8',
    axisColor: isDark ? '#334155' : '#E2E8F0',
    isDark,
  };
}
