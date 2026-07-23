import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'class-tracker-theme';

export function ThemeProvider({ children }) {
  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, appearance);
    document.documentElement.setAttribute('data-theme', appearance);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = appearance === 'dark' ? '#0f0f14' : '#f2f2f7';
    }
  }, [appearance]);

  function toggleTheme() {
    setAppearance((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
