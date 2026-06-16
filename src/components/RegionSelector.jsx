import VclLogo from './VclLogo';
import { Warehouse } from 'lucide-react';

export default function RegionSelector({ onSelectRegion }) {
  const regions = [
    {
      id: 'mumbai',
      name: 'Mumbai Warehouse',
      description: 'Central distribution hub covering Andheri, Navi Mumbai, Thane, Bandra, Borivali, and Dadar outlets.',
      icon: Warehouse,
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-soft)',
      badge: 'Main Hub'
    },
    {
      id: 'gujarat',
      name: 'Gujarat Warehouse',
      description: 'Western region distribution centre covering GIFT City, Ahmedabad, Surat, Vadodara, Rajkot, and Gandhinagar.',
      icon: Warehouse,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
      badge: 'West Hub'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-3xl rounded-3xl p-8 sm:p-12 border text-center space-y-8 animate-scale-in"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md animate-pulse-glow"
            style={{ backgroundColor: 'var(--color-accent-soft)' }}>
            <VclLogo className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1" style={{ color: 'var(--color-text-primary)' }}>
              VCL Inventory
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Select your warehouse location to load inventory data and analytics
            </p>
          </div>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {regions.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                id={`select-region-${r.id}`}
                onClick={() => onSelectRegion(r.id)}
                className="group relative flex flex-col items-start text-left p-6 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderColor: 'var(--color-border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = r.color;
                  e.currentTarget.style.boxShadow = `0 10px 25px -5px ${r.color === 'var(--color-accent)' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)'}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Badge */}
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                  style={{
                    color: r.color,
                    borderColor: r.color === 'var(--color-accent)' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    backgroundColor: r.bg
                  }}>
                  {r.badge}
                </span>

                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: r.bg }}>
                  <Icon size={22} style={{ color: r.color }} />
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors"
                  style={{ color: 'var(--color-text-primary)' }}>
                  {r.name}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {r.description}
                </p>
                
                <div className="mt-6 text-xs font-bold flex items-center gap-1.5"
                  style={{ color: r.color }}>
                  Open Warehouse &rarr;
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
