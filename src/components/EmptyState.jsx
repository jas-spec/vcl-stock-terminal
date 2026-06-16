import { Package, Upload, Bell, BarChart3 } from 'lucide-react';
import VclLogo from './VclLogo';

export default function EmptyState({ onUploadClick, onSimulateClick }) {
  const features = [
    {
      icon: Package,
      title: 'Inventory Tracking',
      description: 'Track product quantities across all categories in real-time',
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-soft)',
    },
    {
      icon: Bell,
      title: 'Low-Stock Alerts',
      description: 'Get notified instantly when items run out or fall below reorder levels',
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)',
    },
    {
      icon: BarChart3,
      title: 'Category Analytics',
      description: 'Visual breakdowns of stock health, trends, and distribution by category',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
    },
    {
      icon: Upload,
      title: 'File Upload Support',
      description: 'Upload Excel or CSV inventory files for instant analysis and insights',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in-up">
      {/* Hero */}
      <div className="text-center max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-6"
          style={{
            backgroundColor: 'var(--color-accent-soft)',
            color: 'var(--color-accent)',
          }}>
          <VclLogo className="w-4 h-4 animate-spin-slow" />
          Welcome to VCL Inventory Management
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}>
          Real-time insights for{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--color-accent), #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            smarter inventory
          </span>
        </h1>

        <p className="text-base sm:text-lg leading-relaxed mx-auto max-w-lg"
          style={{ color: 'var(--color-text-secondary)' }}>
          A professional dashboard to track product stock levels, get low-stock alerts, and manage warehouse inventory across Mumbai and Gujarat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            id="empty-state-simulate-btn"
            onClick={onSimulateClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
              transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), #A78BFA)',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Package size={18} />
            Simulate Inventory Demo
          </button>
          
          <button
            id="empty-state-upload-btn"
            onClick={onUploadClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
              transition-all duration-200 border hover:bg-opacity-50 cursor-pointer"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'; }}
          >
            <Upload size={18} style={{ color: 'var(--color-accent)' }} />
            Upload Inventory File
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl stagger">
        {features.map(({ icon: Icon, title, description, color, bg }) => (
          <div
            key={title}
            className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up cursor-default"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
