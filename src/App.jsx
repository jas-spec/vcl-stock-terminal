import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import EmptyState from './components/EmptyState';
import Settings from './components/Settings';
import RegionSelector from './components/RegionSelector';
import { DashboardSkeleton } from './components/Skeletons';
import { generateAllMockData, tickInventoryData } from './data/mockData';
import { transformParsedData } from './utils/dataTransformer';
import { AlertTriangle, X, BellRing, XCircle, Package } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Region (warehouse) parameters
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem('vcl-selected-region') || null;
  });

  // Simulation parameters
  const [isSimulating, setIsSimulating] = useState(false);
  const [tickInterval, setTickInterval] = useState(3000); // 3 seconds default
  const [consumptionRate, setConsumptionRate] = useState('medium');
  const [restockMode, setRestockMode] = useState('manual');
  const [reorderThreshold, setReorderThreshold] = useState(5);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [alertItems, setAlertItems] = useState([]);

  // Interval reference
  const timerRef = useRef(null);

  // Select/Change warehouse region
  const handleSelectRegion = useCallback((region) => {
    setSelectedRegion(region);
    localStorage.setItem('vcl-selected-region', region);
    
    if (dashboardData) {
      const name = dashboardData.kpi.fileName;
      const data = generateAllMockData(name, region);
      setDashboardData(data);
      setAlertTriggered(false);
      setAlertItems([]);
    }
  }, [dashboardData]);

  // Start inventory simulation immediately
  const handleStartSimulation = useCallback(() => {
    setIsLoading(true);
    setActiveView('analytics');
    setAlertTriggered(false);
    setAlertItems([]);

    setTimeout(() => {
      const data = generateAllMockData('VCL_Inventory.xlsx', selectedRegion);
      setDashboardData(data);
      setIsSimulating(false);
      setIsLoading(false);
    }, 1200);
  }, [selectedRegion]);

  const handleFileProcessed = useCallback((file, parsedData) => {
    setIsLoading(true);
    setActiveView('analytics');
    setAlertTriggered(false);
    setAlertItems([]);

    setTimeout(() => {
      try {
        let data;
        if (parsedData && parsedData.rows && parsedData.rows.length > 0) {
          // Use REAL parsed data from the uploaded file
          data = transformParsedData(parsedData, file.name, selectedRegion);
        } else {
          // Fallback to mock data if parsing returned empty
          data = generateAllMockData(file.name, selectedRegion);
        }
        setDashboardData(data);
        setIsSimulating(false);
        setIsLoading(false);
      } catch (err) {
        console.error('Data transform error:', err);
        // Fallback to mock data on error
        const data = generateAllMockData(file.name, selectedRegion);
        setDashboardData(data);
        setIsSimulating(false);
        setIsLoading(false);
      }
    }, 800);
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
    setAlertItems([]);
  }, [dashboardData, selectedRegion]);

  // Real-time consumption tick effect
  useEffect(() => {
    if (isSimulating && dashboardData) {
      timerRef.current = setInterval(() => {
        setDashboardData(prev => {
          const next = tickInventoryData(prev, {
            consumptionRate,
            restockMode,
            nodeRegion: selectedRegion,
          });
          
          // Check for new out-of-stock items
          const outOfStockItems = next.alerts?.filter(a => a.severity === 'critical') || [];
          if (outOfStockItems.length > 0 && !alertTriggered) {
            setAlertTriggered(true);
            setAlertItems(outOfStockItems.slice(0, 3));
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
  }, [isSimulating, dashboardData, tickInterval, consumptionRate, restockMode, alertTriggered, selectedRegion]);

  // If no warehouse chosen, prompt user first
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
            consumptionRate={consumptionRate}
            setConsumptionRate={setConsumptionRate}
            restockMode={restockMode}
            setRestockMode={setRestockMode}
            reorderThreshold={reorderThreshold}
            setReorderThreshold={setReorderThreshold}
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
        
        {/* Floating Out-of-Stock Alert Notification */}
        {alertTriggered && alertItems.length > 0 && (
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
                Stock Alert — Refill Needed!
              </h4>
              <div className="mt-1 space-y-0.5">
                {alertItems.map((item, i) => (
                  <p key={i} className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    ⚠ {item.name} is <span className="text-red-500 font-bold">OUT OF STOCK</span>
                  </p>
                ))}
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Go to Settings → enable Auto-Refill or restock manually
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
