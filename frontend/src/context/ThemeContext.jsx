import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext();

const THEME = {
  accent: 'blue',
  primaryBg: 'bg-blue-600',
  primaryHover: 'hover:bg-blue-500',
  primaryText: 'text-blue-400',
  primaryBorder: 'border-blue-500',
  borderGlow: 'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10',
  badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
  pillActive: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
  radialGlow: 'rgba(37, 99, 235, 0.15)'
};

export const ThemeProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Cargar categorías de cursos desde el backend
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error cargando categorías de cursos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        categories,
        selectedCategory,
        setSelectedCategory,
        // Compatibilidad hacia atrás para componentes que llamen a estas propiedades
        activeCategorySlug: 'cursos',
        activeSubcategorySlug: selectedCategory,
        setActiveSubcategorySlug: setSelectedCategory,
        currentCategory: { name: 'Cursos Online' },
        theme: THEME,
        refreshCategories: fetchCategories,
        loading
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
