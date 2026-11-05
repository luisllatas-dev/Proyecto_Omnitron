import React, { useState, useEffect } from 'react';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import api from './services/api';

import Navbar from './components/Navbar';
import DynamicHeroSlider from './components/DynamicHeroSlider';
import SubcategoryPills from './components/SubcategoryPills';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import MyPurchasesModal from './components/MyPurchasesModal';
import AdminDashboard from './components/admin/AdminDashboard';

import { Sparkles, Layers, ShieldCheck, RefreshCw, BookOpen } from 'lucide-react';

export default function App() {
  const { selectedCategory, categories, theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  // 'store' o 'admin'
  const [viewMode, setViewMode] = useState('store');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Redirigir automáticamente al panel de administrador si el usuario logueado es admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      setViewMode('admin');
    } else {
      setViewMode('store');
    }
  }, [isAuthenticated, user?.role]);

  // Cargar cursos al cambiar de categoría o búsqueda
  useEffect(() => {
    if (viewMode !== 'store') return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }

        const queryStr = params.toString() ? `?${params.toString()}` : '';
        const res = await api.get(`/courses${queryStr}`);
        if (res.data?.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Error cargando cursos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory, searchTerm, viewMode]);

  // Si el usuario es admin y está en modo admin, mostramos el Panel de Administración
  if (viewMode === 'admin' && user?.role === 'admin') {
    return (
      <AdminDashboard
        onSwitchToStore={() => setViewMode('store')}
      />
    );
  }

  // Nombre de la categoría activa para el titular
  const activeCatObj = categories.find(c => c.slug === selectedCategory);
  const categoryTitle = activeCatObj ? activeCatObj.name : 'Todos los Cursos';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Barra de Navegación */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSwitchToAdmin={() => setViewMode('admin')}
      />

      {/* Hero Banner de la Academia */}
      <DynamicHeroSlider />

      {/* Sección Principal del Catálogo */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
        
        {/* Barra de Categorías de Cursos */}
        <SubcategoryPills />

        {/* Encabezado del Listado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-2xl font-black text-white">
              {categoryTitle}
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${theme.badge}`}>
              {products.length} {products.length === 1 ? 'curso' : 'cursos'}
            </span>
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

        {/* Grilla de Cursos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-900/40 rounded-2xl border border-gray-800 p-4 space-y-4 animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-xl" />
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
                <div className="h-8 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800/80 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No se encontraron cursos</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No hay formaciones activas para los filtros seleccionados o el término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpenDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950/60 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">Omnitron Academy</span>
            <span>— Cursos Online con Entrega Inmediata a Google Drive</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Pago Único</span>
            <span>•</span>
            <span>Acceso Vitalicio</span>
            <span>•</span>
            <span>Sin Suscripciones</span>
          </div>
        </div>
      </footer>

      {/* Modales y Cajones Globales */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer />
      <AuthModal />
      <CheckoutModal />
      <MyPurchasesModal />

    </div>
  );
}
