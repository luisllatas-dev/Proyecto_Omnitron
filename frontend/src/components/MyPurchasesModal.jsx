import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { X, FolderDown, ExternalLink, Calendar, BookOpen, ShieldCheck } from 'lucide-react';

export default function MyPurchasesModal() {
  const { isPurchasesModalOpen, setIsPurchasesModalOpen } = useAuth();
  const { theme } = useTheme();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPurchasesModalOpen) return;

    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await api.get('/orders/my-courses');
        if (res.data?.success) {
          setPurchases(res.data.data || []);
        }
      } catch (err) {
        console.error('Error cargando cursos comprados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [isPurchasesModalOpen]);

  if (!isPurchasesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={() => setIsPurchasesModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-2xl ${theme.primaryBg} text-white shadow-lg`}>
            <FolderDown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Mis Cursos y Descargas de Drive
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Acceso permanente a tus carpetas compartidas en Google Drive
            </p>
          </div>
        </div>

        {/* Lista de Cursos Comprados */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Cargando tu biblioteca de cursos...
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Aún no tienes cursos adquiridos</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Cuando adquieras un curso en la tienda, tu enlace vitalicio de Google Drive aparecerá aquí para siempre.
              </p>
            </div>
          ) : (
            purchases.map((item) => (
              <div
                key={item.courseId}
                className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gray-700 transition"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-14 object-cover rounded-xl shrink-0 bg-gray-800"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-gray-200">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>Adquirido el {new Date(item.purchasedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Botón Abrir Drive */}
                <div className="shrink-0 flex items-center gap-2">
                  {item.driveUrl ? (
                    <a
                      href={item.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition"
                    >
                      <FolderDown className="w-4 h-4" />
                      <span>Abrir Google Drive</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>
                  ) : (
                    <span className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                      Enlace en proceso
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie de modal */}
        <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Acceso vitalicio garantizado por Omnitron Academy.</span>
        </div>

      </div>
    </div>
  );
}
