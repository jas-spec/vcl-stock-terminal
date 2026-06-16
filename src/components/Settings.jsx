import { useState } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Sliders, 
  Bell, 
  Palette, 
  Activity, 
  FileSpreadsheet, 
  CheckCircle, 
  Sparkles,
  MapPin,
  Landmark,
  Navigation
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings({
  isSimulating,
  setIsSimulating,
  tickInterval,
  setTickInterval,
  volatility,
  setVolatility,
  marketBias,
  setMarketBias,
  alertThreshold,
  setAlertThreshold,
  onResetData,
  tableData,
  selectedRegion,
  onChangeRegion
}) {
  const { accentColor, setAccentColor, isDark } = useTheme();
  const [alertConfigured, setAlertConfigured] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Accent colors config
  const ACCENT_COLORS = [
    { id: 'indigo', name: 'Electric Indigo', hex: '#6366F1' },
    { id: 'emerald', name: 'Emerald Mint', hex: '#10B981' },
    { id: 'violet', name: 'Neon Violet', hex: '#8B5CF6' },
    { id: 'amber', name: 'Bright Amber', hex: '#F59E0B' },
    { id: 'rose', name: 'Rose Red', hex: '#F43F5E' },
  ];

  // Working CSV Export Function
  const handleExportCSV = () => {
    if (!tableData || tableData.length === 0) return;
    
    // Headers
    const headers = ['Transaction ID', 'Time Stamp', 'Trader', 'Type', 'Region', 'Amount (USD)', 'Quantity', 'Status'];
    
    // Convert rows
    const rows = tableData.map(row => [
      row.id,
      row.time,
      row.trader,
      row.type,
      row.region,
      row.amount,
      row.quantity,
      row.status
    ]);
    
    // Format csv
    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');
      
    // Create Blob & Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VCL_Stock_${selectedRegion}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleSaveAlert = (e) => {
    e.preventDefault();
    setAlertConfigured(true);
    setTimeout(() => setAlertConfigured(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      {/* Settings Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          System Configuration
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Manage real-time ticking parameters, regional gateways, and branding accents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Live Simulation Controls */}
        <div className="space-y-6">
          {/* Feed Switch */}
          <div className="rounded-2xl p-5 border"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                <Activity size={18} className={isSimulating ? "animate-pulse" : ""} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Simulation Controls
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Start/Stop real-time price & volume updates
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="toggle-sim-btn"
                onClick={() => setIsSimulating(!isSimulating)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: isSimulating ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-accent-soft)',
                  color: isSimulating ? 'var(--color-danger)' : 'var(--color-accent)',
                  border: `1px solid ${isSimulating ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.1)'}`
                }}
              >
                {isSimulating ? (
                  <>
                    <Pause size={14} /> Pause Tick Feed
                  </>
                ) : (
                  <>
                    <Play size={14} /> Start Tick Feed
                  </>
                )}
              </button>

              <button
                id="reset-sim-btn"
                onClick={onResetData}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all duration-200 hover:bg-opacity-50"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <RefreshCw size={14} /> Reset Data
              </button>
            </div>
          </div>

          {/* Volatility & Bias */}
          <div className="rounded-2xl p-5 border space-y-4"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}>
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Market Characteristics
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Adjust simulated price volatility and direction trend
                </p>
              </div>
            </div>

            {/* Volatility Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Volatility Index (Random Walk Delta)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map(v => (
                  <button
                    key={v}
                    id={`volatility-btn-${v}`}
                    onClick={() => setVolatility(v)}
                    className="py-2 rounded-xl text-xs font-semibold capitalize border cursor-pointer transition-all duration-150"
                    style={{
                      backgroundColor: volatility === v ? 'var(--color-accent-soft)' : 'transparent',
                      borderColor: volatility === v ? 'var(--color-accent)' : 'var(--color-border)',
                      color: volatility === v ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Market Bias Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Market Bias Trend
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['neutral', 'bullish', 'bearish'].map(b => (
                  <button
                    key={b}
                    id={`bias-btn-${b}`}
                    onClick={() => setMarketBias(b)}
                    className="py-2 rounded-xl text-xs font-semibold capitalize border cursor-pointer transition-all duration-150"
                    style={{
                      backgroundColor: marketBias === b ? 'var(--color-accent-soft)' : 'transparent',
                      borderColor: marketBias === b ? 'var(--color-accent)' : 'var(--color-border)',
                      color: marketBias === b ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Tick Speed Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Tick Feed Interval</span>
                <span style={{ color: 'var(--color-accent)' }}>{(tickInterval / 1000).toFixed(1)}s</span>
              </div>
              <input
                id="speed-slider"
                type="range"
                min="500"
                max="5000"
                step="500"
                value={tickInterval}
                onChange={e => setTickInterval(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-300 dark:bg-slate-700"
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Region Node Selector */}
        <div className="space-y-6">
          {/* Region Node Selector */}
          <div className="rounded-2xl p-5 border space-y-4"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Regional Gateway Node
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Switch connection node for Mumbai and Gujarat nodes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="region-btn-mumbai"
                onClick={() => onChangeRegion('mumbai')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-xs cursor-pointer transition-all duration-200"
                style={{
                  borderColor: selectedRegion === 'mumbai' ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: selectedRegion === 'mumbai' ? 'var(--color-accent-soft)' : 'var(--color-bg-tertiary)',
                  color: selectedRegion === 'mumbai' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                }}
              >
                <Landmark size={14} style={{ color: selectedRegion === 'mumbai' ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                Mumbai Hub
              </button>

              <button
                id="region-btn-gujarat"
                onClick={() => onChangeRegion('gujarat')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-xs cursor-pointer transition-all duration-200"
                style={{
                  borderColor: selectedRegion === 'gujarat' ? '#10B981' : 'var(--color-border)',
                  backgroundColor: selectedRegion === 'gujarat' ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-bg-tertiary)',
                  color: selectedRegion === 'gujarat' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                }}
              >
                <Navigation size={14} style={{ color: selectedRegion === 'gujarat' ? '#10B981' : 'var(--color-text-muted)' }} />
                Gujarat Node
              </button>
            </div>
          </div>

          {/* Accent Color Customizer */}
          <div className="rounded-2xl p-5 border space-y-4"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(236, 72, 153, 0.08)', color: '#EC4899' }}>
                <Palette size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Brand Theme & Accents
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Change the color language of buttons, borders, and glows
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {ACCENT_COLORS.map(color => {
                const isActive = accentColor === color.id;
                return (
                  <button
                    key={color.id}
                    id={`accent-btn-${color.id}`}
                    onClick={() => setAccentColor(color.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: isActive ? 'var(--color-accent-soft)' : 'var(--color-bg-tertiary)',
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                    }}
                  >
                    <div className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: color.hex }} />
                    <span className="text-xs font-semibold">{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Alerts System */}
          <div className="rounded-2xl p-5 border space-y-4"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B' }}>
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  VCL Threshold Alerts
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Trigger warnings when prices exceed defined limits
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAlert} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold"
                    style={{ color: 'var(--color-text-muted)' }}>$</span>
                  <input
                    id="alert-threshold-input"
                    type="number"
                    step="0.01"
                    placeholder="Alert value (e.g. 150.00)"
                    value={alertThreshold || ''}
                    onChange={e => setAlertThreshold(Number(e.target.value))}
                    className="w-full pl-7 pr-4 py-2 text-xs rounded-xl outline-none font-medium border"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  id="save-alert-btn"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  Configure
                </button>
              </div>
              {alertConfigured && (
                <p className="text-xs font-medium flex items-center gap-1.5 animate-scale-in"
                  style={{ color: 'var(--color-success)' }}>
                  <CheckCircle size={14} /> Limit alert active for VCL at ${alertThreshold?.toFixed(2)}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Row: CSV Export & Action Buttons */}
      <div className="rounded-2xl p-5 border"
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <Sparkles size={16} style={{ color: 'var(--color-accent)' }} /> Data Management Ledger
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Export current simulated transaction log rows directly to CSV format.
            </p>
          </div>
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all duration-200 hover:scale-102"
            style={{ backgroundColor: 'var(--color-accent)', boxShadow: 'var(--shadow-glow)' }}
          >
            {exportSuccess ? (
              <>
                <CheckCircle size={14} /> Download Success!
              </>
            ) : (
              <>
                <FileSpreadsheet size={14} /> Export Table to CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
