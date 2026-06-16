import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import EmptyState from './components/EmptyState';
import Settings from './components/Settings';
import RegionSelector from './components/RegionSelector';
import { DashboardSkeleton } from './components/Skeletons';
import { generateAllMockData, tickStockData } from './data/mockData';
import { AlertTriangle, X, BellRing } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Region parameters
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem('vcl-selected-region') || null;
  });

  // Simulation parameters
  const [isSimulating, setIsSimulating] = useState(false);
  const [tickInterval, setTickInterval] = useState(2000); // 2 seconds default
  const [volatility, setVolatility] = useState('medium');
  const [marketBias, setMarketBias] = useState('neutral');
  const [alertThreshold, setAlertThreshold] = useState(0);
  const [alertTriggered, setAlertTriggered] = useState(false);

  // Interval reference
  const timerRef = useRef(null);

  // Select/Change region node
  const handleSelectRegion = useCallback((region) => {
    setSelectedRegion(region);
    localStorage.setItem('vcl-selected-region', region);
    
    // If we already have data loaded, regenerate it to fit the new region node
    if (dashboardData) {
      const name = dashboardData.kpi.fileName;
      const data = generateAllMockData(name, region);
      setDashboardData(data);
      setAlertTriggered(false);
    }
  }, [dashboardData]);

  // Start real-time simulation immediately
  const handleStartSimulation = useCallback(() => {
    setIsLoading(true);
    setActiveView('analytics');
    setAlertTriggered(false);

    setTimeout(() => {
      const data = generateAllMockData('VCL_Live_Feed.xlsx', selectedRegion);
      setDashboardData(data);
      setIsSimulating(false);
      setIsLoading(false);
    }, 1200);
  }, [selectedRegion]);

  const handleFileProcessed = useCallback((file) => {
    setIsLoading(true);
    setActiveView('analytics');
    setAlertTriggered(false);

    // Simulate processing delay then populate with mock data
    setTimeout(() => {
      const data = generateAllMockData(file.name, selectedRegion);
      setDashboardData(data);
      setIsSimulating(false);
      setIsLoading(false);
    }, 1800);
  }, [selectedRegion]);

  const handleNavigateToUpload = () => {
    setActiveView('upload');
  };

  const handleResetData = useCallback(() => {
    if (!dashboardData) return;
    const name = dashboardData.kpi.fileName;
    const freshData = generateAllMockData(name, selectedRegion);
    setDashboardData(freshData);
    setAlertTriggered(false);
  }, [dashboardData, selectedRegion]);

  // Real-time ticking effect
  useEffect(() => {
    if (isSimulating && dashboardData) {
      timerRef.current = setInterval(() => {
        setDashboardData(prev => {
          const next = tickStockData(prev, { volatility, marketBias, nodeRegion: selectedRegion });
          
          // Check price alert threshold
          if (alertThreshold > 0 && next.kpi.price >= alertThreshold && !alertTriggered) {
            setAlertTriggered(true);
          }
          return next;
        });
      }, tickInterval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, dashboardData, tickInterval, volatility, marketBias, alertThreshold, alertTriggered, selectedRegion]);

  // If no region node chosen, prompt user first
  if (!selectedRegion) {
    return <RegionSelector onSelectRegion={handleSelectRegion} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'upload':
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-2rem)]">
            <UploadZone onFileProcessed={handleFileProcessed} isLoading={isLoading} />
          </div>
        );

      case 'analytics':
        if (isLoading) return <DashboardSkeleton />;
        if (!dashboardData) {
          return (
            <EmptyState 
              onUploadClick={handleNavigateToUpload} 
              onSimulateClick={handleStartSimulation} 
            />
          );
        }
        return <AnalyticsDashboard data={dashboardData} />;

      case 'settings':
        return (
          <Settings
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            tickInterval={tickInterval}
            setTickInterval={setTickInterval}
            volatility={volatility}
            setVolatility={setVolatility}
            marketBias={marketBias}
            setMarketBias={setMarketBias}
            alertThreshold={alertThreshold}
            setAlertThreshold={setAlertThreshold}
            onResetData={handleResetData}
            tableData={dashboardData?.table || []}
            selectedRegion={selectedRegion}
            onChangeRegion={handleSelectRegion}
          />
        );

      case 'dashboard':
      default:
        if (dashboardData) return <AnalyticsDashboard data={dashboardData} />;
        return (
          <EmptyState 
            onUploadClick={handleNavigateToUpload} 
            onSimulateClick={handleStartSimulation} 
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden animate-fade-in">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        
        {/* Floating Alert Warning Notification */}
        {alertTriggered && (
          <div className="fixed top-20 right-4 z-50 max-w-sm rounded-2xl border p-4 shadow-xl backdrop-blur-md animate-scale-in flex items-start gap-3"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)', 
              borderColor: 'rgba(239, 68, 68, 0.3)',
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)'
            }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 shrink-0">
              <BellRing size={16} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-wide">
                Price Alert Triggered
              </h4>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                VCL Stock price crossed your target threshold of ${alertThreshold?.toFixed(2)} (Current: ${dashboardData?.kpi.price.toFixed(2)})
              </p>
            </div>
            <button 
              onClick={() => setAlertTriggered(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0 transition-colors p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
