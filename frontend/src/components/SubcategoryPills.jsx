import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Layers, 
  Code, 
  Wrench, 
  Palette, 
  Cpu, 
  Shield, 
  TrendingUp, 
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ICON_MAP = {
  Code: Code,
  Wrench: Wrench,
  Palette: Palette,
  Cpu: Cpu,
  Shield: Shield,
  TrendingUp: TrendingUp,
  GraduationCap: GraduationCap
};

export default function SubcategoryPills() {
  const { categories, selectedCategory, setSelectedCategory, theme } = useTheme();
  const scrollContainerRef = useRef(null);
  const activePillRef = useRef(null);

  const isAllActive = !selectedCategory || selectedCategory === 'all';
  const totalCourses = categories.reduce((sum, c) => sum + (c.courseCount || 0), 0);

  // Auto-scroll para centrar la píldora activa en pantallas desktop/tablet
  useEffect(() => {
    if (activePillRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedCategory]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div id="catalogo" className="pt-6 pb-2 space-y-3">
      
      {/* Título: Categorías de Formación */}
      <div className="flex items-center gap-2">
        <Layers className={`w-4 h-4 ${theme.primaryText}`} />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
          Categorías de Formación
        </span>
        <span className="text-[11px] text-gray-500 font-semibold hidden sm:inline">
          ({categories.length} áreas disponibles)
        </span>
      </div>

      {/* SELECT EXCLUSIVO PARA CELULARES (debajo del título, no sticky, reemplaza a la barra) */}
      <div className="block sm:hidden relative w-full">
        <select
          value={selectedCategory || 'all'}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-gray-900 text-sm font-semibold text-white pl-4 pr-10 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500/50 appearance-none shadow-sm"
          aria-label="Seleccionar categoría de formación"
        >
          <option value="all">Todas las Categorías ({totalCourses} cursos)</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name} ({c.courseCount || 0} cursos)
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* BARRA DE PÍLDORAS EXCLUSIVA PARA TABLETS Y DESKTOP (oculta en celulares: hidden sm:block) */}
      <div className="hidden sm:block relative group">
        
        {/* Máscara de degradado izquierda */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0B0F19] to-transparent z-10" />

        {/* Botón flecha izquierda */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-white items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
          title="Desplazar a la izquierda"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Contenedor de Píldoras */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x overscroll-x-contain scroll-smooth px-1"
        >
          {/* Píldora "Todos los Cursos" */}
          <button
            ref={isAllActive ? activePillRef : null}
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
              isAllActive
                ? `${theme.pillActive} border-transparent ring-2 ring-blue-500/40`
                : 'bg-gray-900/90 text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Todos los Cursos</span>
            {totalCourses > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                isAllActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                {totalCourses}
              </span>
            )}
          </button>

          {/* Cada Categoría de Cursos */}
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            const IconComp = ICON_MAP[cat.icon] || GraduationCap;

            return (
              <button
                key={cat._id}
                ref={isActive ? activePillRef : null}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                  isActive
                    ? `${theme.pillActive} border-transparent ring-2 ring-blue-500/40`
                    : 'bg-gray-900/90 text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.name}</span>
                {cat.courseCount !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {cat.courseCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Botón flecha derecha */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-white items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
          title="Desplazar a la derecha"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Máscara de degradado derecha */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0B0F19] to-transparent z-10" />

      </div>

    </div>
  );
}
