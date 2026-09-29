import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark-glass' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDarkGlass: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark-glass',
  toggleTheme: () => {},
  setTheme: () => {},
  isDarkGlass: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('mabri_theme');
    if (saved === 'light' || saved === 'dark-glass') {
      return saved;
    }
    return 'dark-glass'; // Default to dark glassmorphism
  });

  useEffect(() => {
    localStorage.setItem('mabri_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark-glass') {
      root.classList.add('dark');
      root.classList.add('dark-glass');
    } else {
      root.classList.remove('dark');
      root.classList.remove('dark-glass');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark-glass' ? 'light' : 'dark-glass'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDarkGlass: theme === 'dark-glass' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
