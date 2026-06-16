import { useEffect, useState, useRef } from 'react';
import {
  Package,
  AlertTriangle,
  XCircle,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Single KPI Card with real-time flash updates
function KPICard({ label, value, format, icon: Icon, trend, isPercentageTrend = true, gradient, bgColor, iconColor }) {
  const [flashClass, setFlashClass] = useState('');
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      if (typeof value === 'number') {
        const isUp = value >= prevValueRef.current;
        setFlashClass(isUp ? 'flash-up' : 'flash-down');
        const timer = setTimeout(() => {
          setFlashClass('');
        }, 800);
        prevValueRef.current = value;
        return () => clearTimeout(timer);
      }
      prevValueRef.current = value;
    }
  }, [value]);

  const isPositive = trend >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  const flashStyle = {};
  if (flashClass === 'flash-up') {
    flashStyle.borderColor = '#10B981';
    flashStyle.boxShadow = '0 0 15px rgba(16, 185, 129, 0.25)';
  } else if (flashClass === 'flash-down') {
    flashStyle.borderColor = '#EF4444';
    flashStyle.boxShadow = '0 0 15px rgba(239, 68, 68, 0.25)';
  }

  return (
    <div
      className={`group relative rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 animate-fade-in-up ${flashClass}`}
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.4s ease',
        ...flashStyle
      }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: gradient,
          opacity: 0,
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: bgColor }}>
            <Icon size={20} style={{ color: iconColor }} />
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
            }}>
            <TrendIcon size={12} />
            {Math.abs(trend).toFixed(1)}{isPercentageTrend ? '%' : ''}
          </div>
        </div>

        <p className="text-2xl font-extrabold tracking-tight mb-1"
          style={{ color: 'var(--color-text-primary)' }}>
          {format(value)}
        </p>
        <p className="text-sm font-semibold"
          style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </p>

        {/* Sparkline track indicator */}
        <div className="mt-4 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
          <div className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(Math.max(20, Math.abs(trend) * 12), 95)}%`,
              background: gradient,
            }} />
        </div>
      </div>
    </div>
  );
}

export default function KPICards({ data }) {
  if (!data) return null;

  const cards = [
    {
      key: 'totalItems',
      label: 'Total Products',
      value: data.totalItems,
      format: (v) => `${v} Items`,
      icon: Package,
      trend: data.quantityChange || 1.2,
      isPercentageTrend: true,
      gradient: 'linear-gradient(135deg, var(--color-accent), #818CF8)',
      bgColor: 'var(--color-accent-soft)',
      iconColor: 'var(--color-accent)',
    },
    {
      key: 'lowStock',
      label: 'Low Stock Items',
      value: data.lowStock,
      format: (v) => `${v} Items`,
      icon: AlertTriangle,
      trend: data.lowStockChange || -1.5,
      isPercentageTrend: false,
      gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      iconColor: '#F59E0B',
    },
    {
      key: 'outOfStock',
      label: 'Out of Stock',
      value: data.outOfStock,
      format: (v) => `${v} Items`,
      icon: XCircle,
      trend: data.outOfStockChange || 2.0,
      isPercentageTrend: false,
      gradient: 'linear-gradient(135deg, #EF4444, #F87171)',
      bgColor: 'rgba(239, 68, 68, 0.08)',
      iconColor: '#EF4444',
    },
    {
      key: 'totalValue',
      label: 'Inventory Value',
      value: data.totalValue,
      format: (v) => `₹${Number(v).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      trend: data.valueChange || 3.2,
      isPercentageTrend: true,
      gradient: 'linear-gradient(135deg, #10B981, #34D399)',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      iconColor: '#10B981',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
      {cards.map((card) => (
        <KPICard 
          key={card.key}
          label={card.label}
          value={card.value}
          format={card.format}
          icon={card.icon}
          trend={card.trend}
          isPercentageTrend={card.isPercentageTrend}
          gradient={card.gradient}
          bgColor={card.bgColor}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
}
