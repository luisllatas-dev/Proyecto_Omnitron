import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  ShoppingCart, 
  User, 
  FolderDown, 
  LogOut, 
  Search,
  Sparkles
} from 'lucide-react';

export default function Navbar({ searchTerm, setSearchTerm, onSwitchToAdmin }) {
  const { theme, setSelectedCategory } = useTheme();
  const { itemsCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout, setIsAuthModalOpen, setIsPurchasesModalOpen } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-gray-800/90 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Fila principal del Navbar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo Brand: OMNITRON ACADEMY */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" 
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
            }}
          >
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0`}>
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-xl font-black tracking-wider text-white">
                OMNITRON
              </span>
              <span className={`hidden xs:block text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase ${theme.primaryText}`}>
                Academy • Cursos
              </span>
            </div>
          </div>

          {/* Barra de Búsqueda Central (Desktop & Tablet) */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar curso por nombre, tecnología u oficio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/90 text-sm text-gray-200 pl-10 pr-8 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500/50 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Acciones de la barra */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* Botón Acceso Admin (Si el usuario es admin) */}
            {isAuthenticated && user?.role === 'admin' && (
              <button
                onClick={onSwitchToAdmin}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition shadow-sm"
                title="Volver al Panel de Administración"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Panel Admin</span>
                <span className="sm:hidden text-[11px]">Admin</span>
              </button>
            )}

            {/* Mis Cursos / Biblioteca Digital (Google Drive) */}
            {isAuthenticated && (
              <button
                onClick={() => setIsPurchasesModalOpen(true)}
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-300 hover:text-white bg-gray-900/80 hover:bg-gray-800 border border-gray-800 transition shadow-sm"
                title="Mis Cursos y Descargas de Google Drive"
              >
                <FolderDown className={`w-4 h-4 shrink-0 ${theme.primaryText}`} />
                <span className="hidden sm:inline">Mis Cursos</span>
              </button>
            )}

            {/* Botón Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-200 hover:text-white transition"
              aria-label="Abrir Carrito"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {itemsCount > 0 && (
                <span className={`absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r ${theme.gradient} text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse`}>
                  {itemsCount}
                </span>
              )}
            </button>

            {/* Usuario / Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-gray-800">
                <div 
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${theme.gradient} flex items-center justify-center font-bold text-xs text-white shrink-0`}
                  title={user?.name || user?.email}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden xl:inline text-sm font-medium text-gray-200">
                  {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-800 transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm ${theme.primaryBg} ${theme.primaryHover} text-white shadow-lg shadow-blue-600/20 transition`}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Ingresar</span>
              </button>
            )}

          </div>

        </div>

        {/* Buscador móvil debajo de la barra */}
        <div className="pb-2.5 md:hidden">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos por título o tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/90 text-xs text-gray-200 pl-8 pr-7 py-2 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
