import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('wpvcp_theme') || 'light';
  });

  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('wpvcp_font_size') || 'medium';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wpvcp_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontSize);
    localStorage.setItem('wpvcp_font_size', fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme) => {
    if (['light', 'dark'].includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const setFontSize = (size) => {
    if (['small', 'medium', 'large', 'xlarge'].includes(size)) {
      setFontSizeState(size);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
