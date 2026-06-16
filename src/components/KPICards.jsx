import { useEffect, useState, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Single KPI Card Component that handles real-time visual flashing updates
function KPICard({ label, value, format, icon: Icon, trend, isPercentageTrend = true, direction, gradient, bgColor }) {
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

  // Render flashing inline border or background
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
            <Icon size={20} style={{ color: gradient.includes('#6366F1') ? 'var(--color-accent)' :
              gradient.includes('#10B981') ? '#10B981' :
              gradient.includes('#F59E0B') ? '#F59E0B' : '#EC4899' }} />
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
            }}>
            <TrendIcon size={12} />
            {Math.abs(trend).toFixed(2)}{isPercentageTrend ? '%' : ''}
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
      key: 'price',
      label: 'VCL Stock Price',
      value: data.price,
      format: (v) => `$${Number(v).toFixed(2)}`,
      icon: DollarSign,
      trend: data.change, // Daily price percentage delta
      isPercentageTrend: true,
      direction: data.priceDirection,
      gradient: 'linear-gradient(135deg, var(--color-accent), #818CF8)',
      bgColor: 'var(--color-accent-soft)',
    },
    {
      key: 'volume',
      label: 'Accumulated Volume',
      value: data.volume,
      format: (v) => Number(v).toLocaleString(),
      icon: Layers,
      trend: 4.85, // Session growth indicator
      isPercentageTrend: true,
      direction: 'up',
      gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
      bgColor: 'rgba(236, 72, 153, 0.08)',
    },
    {
      key: 'volatility',
      label: 'Volatility Index',
      value: data.volatility,
      format: (v) => `${Number(v).toFixed(2)}%`,
      icon: Activity,
      trend: -0.15,
      isPercentageTrend: false,
      direction: 'down',
      gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      bgColor: 'rgba(245, 158, 11, 0.08)',
    },
    {
      key: 'change',
      label: 'Net Daily Change',
      value: data.change,
      format: (v) => `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`,
      icon: TrendingUp,
      trend: data.change,
      isPercentageTrend: true,
      direction: data.change >= 0 ? 'up' : 'down',
      gradient: 'linear-gradient(135deg, #10B981, #34D399)',
      bgColor: 'rgba(16, 185, 129, 0.08)',
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
          direction={card.direction}
          gradient={card.gradient}
          bgColor={card.bgColor}
        />
      ))}
    </div>
  );
}
