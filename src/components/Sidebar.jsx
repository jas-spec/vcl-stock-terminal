import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import VclLogo from './VclLogo';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeView, onNavigate }) {
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16"
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <VclLogo className="w-6 h-6 animate-pulse-glow" />
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              VCL Stock
            </span>
          </div>
        </div>
        <button
          id="mobile-theme-toggle"
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 animate-fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
        style={{
          width: mobileOpen ? '280px' : undefined,
          backgroundColor: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
              <VclLogo className="w-7 h-7" />
            </div>
            <span className={`text-lg font-extrabold tracking-tight whitespace-nowrap transition-opacity duration-200
              ${collapsed ? 'lg:hidden lg:opacity-0' : 'opacity-100'}`}
              style={{ color: 'var(--color-text-primary)' }}>
              VCL Stock
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg cursor-pointer transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => handleNavigate(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  cursor-pointer group
                  ${collapsed ? 'lg:justify-center lg:px-0' : ''}
                `}
                style={{
                  backgroundColor: isActive ? 'var(--color-accent-soft)' : 'transparent',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <Icon size={20} className="shrink-0" />
                <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200
                  ${collapsed ? 'lg:hidden' : ''}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                    hidden={collapsed} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-2 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          {/* Theme Toggle */}
          <button
            id="sidebar-theme-toggle"
            onClick={toggleTheme}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              cursor-pointer
              ${collapsed ? 'lg:justify-center lg:px-0' : ''}
            `}
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {isDark ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
            <span className={`text-sm font-medium whitespace-nowrap
              ${collapsed ? 'lg:hidden' : ''}`}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Collapse Toggle (desktop only) */}
          <button
            id="sidebar-collapse-toggle"
            onClick={() => setCollapsed(prev => !prev)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-200 cursor-pointer"
            style={{ color: 'var(--color-text-secondary)', justifyContent: collapsed ? 'center' : undefined }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            <span className={`text-sm font-medium ${collapsed ? 'lg:hidden' : ''}`}>
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
