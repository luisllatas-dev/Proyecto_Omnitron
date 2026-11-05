import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FolderCheck, Zap, ShieldCheck, ArrowDown, GraduationCap } from 'lucide-react';

export default function DynamicHeroSlider() {
  const { theme } = useTheme();

  return (
    <section className="relative overflow-hidden pt-5 pb-8 sm:pt-10 sm:pb-14 transition-all duration-700">
      {/* Fondo con imagen y degradado */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80"
          alt="Academia Online Omnitron"
          className="w-full h-full object-cover object-center filter brightness-[0.22]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4 sm:space-y-6">
          
          {/* Badge de la academia */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/80 backdrop-blur-md border border-blue-500/30 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[11px] sm:text-xs font-bold tracking-wide text-blue-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Plataforma Especializada en Cursos Online</span>
            </span>
          </div>

          {/* Titular Principal */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Aprende Habilidades y Oficios de Alta Demanda
          </h1>

          {/* Subtítulo */}
          <p className="text-xs sm:text-base text-gray-300 leading-relaxed font-normal max-w-2xl">
            Cursos estructurados con temarios completos y entrega inmediata. Acceso de por vida a carpetas organizadas en Google Drive con pago único y sin mensualidades.
          </p>

          {/* 3 Beneficios en fila responsiva compacta */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-800 text-center sm:text-left">
              <FolderCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-blue-400" />
              <div className="text-[10px] sm:text-xs">
                <span className="font-bold text-white block">Google Drive</span>
                <span className="text-gray-400 hidden sm:inline">Descarga inmediata</span>
                <span className="text-gray-400 sm:hidden">Entrega directa</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-800 text-center sm:text-left">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-blue-400" />
              <div className="text-[10px] sm:text-xs">
                <span className="font-bold text-white block">Pago Único</span>
                <span className="text-gray-400 hidden sm:inline">Sin suscripciones</span>
                <span className="text-gray-400 sm:hidden">Sin mensualidad</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-800 text-center sm:text-left">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-blue-400" />
              <div className="text-[10px] sm:text-xs">
                <span className="font-bold text-white block">Vitalicio</span>
                <span className="text-gray-400 hidden sm:inline">Tuyo para siempre</span>
                <span className="text-gray-400 sm:hidden">De por vida</span>
              </div>
            </div>
          </div>

          {/* Botón Explorar */}
          <div className="pt-1">
            <a
              href="#catalogo"
              className={`inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl transition-all duration-300 ${theme.primaryBg} ${theme.primaryHover} text-white shadow-blue-600/30`}
            >
              <span>Explorar Cursos</span>
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
