import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ACCENT_PALETTE = {
  indigo: {
    light: { accent: '#6366F1', hover: '#4F46E5', soft: 'rgba(99, 102, 241, 0.08)' },
    dark: { accent: '#818CF8', hover: '#6366F1', soft: 'rgba(129, 140, 248, 0.1)' }
  },
  emerald: {
    light: { accent: '#10B981', hover: '#059669', soft: 'rgba(16, 185, 129, 0.08)' },
    dark: { accent: '#34D399', hover: '#10B981', soft: 'rgba(52, 211, 153, 0.1)' }
  },
  violet: {
    light: { accent: '#8B5CF6', hover: '#7C3AED', soft: 'rgba(139, 92, 246, 0.08)' },
    dark: { accent: '#A78BFA', hover: '#8B5CF6', soft: 'rgba(167, 139, 250, 0.1)' }
  },
  amber: {
    light: { accent: '#F59E0B', hover: '#D97706', soft: 'rgba(245, 158, 11, 0.08)' },
    dark: { accent: '#FBBF24', hover: '#F59E0B', soft: 'rgba(251, 191, 36, 0.1)' }
  },
  rose: {
    light: { accent: '#F43F5E', hover: '#E11D48', soft: 'rgba(244, 63, 94, 0.08)' },
    dark: { accent: '#FB7185', hover: '#F43F5E', soft: 'rgba(251, 113, 133, 0.1)' }
  }
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('insightflow-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('insightflow-accent') || 'indigo';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('insightflow-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    const mode = isDark ? 'dark' : 'light';
    const colors = ACCENT_PALETTE[accentColor]?.[mode] || ACCENT_PALETTE.indigo[mode];

    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-hover', colors.hover);
    root.style.setProperty('--color-accent-soft', colors.soft);
    
    // Also update a glow shadow with accent color
    const glowColor = isDark ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.15)';
    const colorHex = colors.accent;
    // Simple hex to rgba approximation for shadow glow
    const shadowValue = `0 0 20px ${colors.soft.replace('0.08', '0.15').replace('0.1', '0.2')}`;
    root.style.setProperty('--shadow-glow', shadowValue);

    localStorage.setItem('insightflow-accent', accentColor);
  }, [accentColor, isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
