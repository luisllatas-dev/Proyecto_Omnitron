import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { X, CheckCircle2, FolderDown, ShoppingCart, ShieldCheck, BookOpen, Clock } from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  const { theme } = useTheme();
  const { addToCart, setIsCartOpen, setIsCheckoutModalOpen, cartItems } = useCart();

  if (!product) return null;

  const isInCart = cartItems.some(item => (item.courseId || item._id) === product._id);
  const finalPrice = product.discountPrice || product.price;

  const handleBuyNow = () => {
    if (!isInCart) {
      addToCart(product);
    }
    onClose();
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagen de Cabecera */}
        <div className="relative aspect-video w-full bg-gray-950 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

          {/* Badges superiores */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${theme.badge}`}>
              {product.category?.name || 'Curso Online'}
            </span>
            {product.hasDiscount && (
              <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-black shadow-lg">
                AHORRAS {product.discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Título y descripción */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.title}
            </h2>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Temario del Curso */}
          {product.syllabus && product.syllabus.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>Temario Completo del Curso</span>
                <span className="text-xs text-gray-400 font-normal">
                  ({product.syllabus.length} módulos)
                </span>
              </h3>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                {product.syllabus.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-gray-950/40 border border-gray-800/80 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caja Informativa de Entrega por Google Drive */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3.5">
            <FolderDown className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-white block text-sm">
                Entrega Inmediata y Acceso Vitalicio por Google Drive
              </span>
              <p className="text-blue-200/80 leading-relaxed">
                Al completar tu pago, este curso se agregará al instante a tu sección de "Mis Cursos" con el enlace privado a la carpeta compartida en Google Drive. Podrás ver los videos en streaming o descargarlos para siempre sin cuotas recurrentes.
              </p>
            </div>
          </div>

          {/* Barra Inferior de Precios y Botones */}
          <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                ${finalPrice.toFixed(2)} USD
              </span>
              {product.hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => addToCart(product)}
                disabled={isInCart}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition border ${
                  isInCart
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isInCart ? 'En Carrito' : 'Agregar al Carrito'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm ${theme.primaryBg} ${theme.primaryHover} text-white shadow-xl shadow-blue-600/25 transition`}
              >
                <span>Comprar Ahora</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
