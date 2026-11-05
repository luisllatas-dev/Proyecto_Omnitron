import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Eye, FolderDown, Sparkles, BookOpen } from 'lucide-react';

export default function ProductCard({ product, onOpenDetails }) {
  const { theme } = useTheme();
  const { addToCart, cartItems } = useCart();

  const isInCart = cartItems.some(item => (item.courseId || item._id) === product._id);
  const modulesCount = product.syllabus?.length || 0;

  return (
    <article className={`group relative bg-gray-900/70 rounded-2xl border border-gray-800 overflow-hidden flex flex-col transition-all duration-300 ${theme.borderGlow}`}>
      
      {/* Imagen de portada */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-800">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badge de Descuento */}
        {product.hasDiscount && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-red-600/90 backdrop-blur-sm text-white text-xs font-black shadow-lg">
            -{product.discountPercentage}%
          </div>
        )}

        {/* Badge de Entrega por Google Drive */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-gray-300 text-[11px] font-medium flex items-center gap-1.5 shadow-md">
          <FolderDown className="w-3.5 h-3.5 text-blue-400" />
          <span>Drive</span>
        </div>

        {/* Badge de Curso Destacado */}
        {product.isFeatured && (
          <div className={`absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${theme.gradient} flex items-center gap-1 shadow-md`}>
            <Sparkles className="w-3 h-3" />
            <span>Destacado</span>
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Categoría y conteo de módulos */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-semibold ${theme.primaryText}`}>
              {product.category?.name || 'Curso Online'}
            </span>
            {modulesCount > 0 && (
              <span className="text-gray-400 text-[11px] flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-gray-500" />
                <span>{modulesCount} módulos</span>
              </span>
            )}
          </div>

          {/* Título del curso */}
          <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-gray-100 transition">
            {product.title}
          </h3>

          {/* Descripción corta */}
          <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Precios y Acciones */}
        <div className="pt-3 border-t border-gray-800/80 space-y-3">
          
          {/* Precios */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              ${(product.discountPrice || product.price).toFixed(2)}
            </span>
            {product.hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="text-[10px] text-gray-400 uppercase tracking-wider ml-auto">
              Pago único
            </span>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenDetails(product)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Temario</span>
            </button>

            <button
              onClick={() => addToCart(product)}
              disabled={isInCart}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                isInCart
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : `${theme.primaryBg} ${theme.primaryHover} text-white shadow-blue-600/20`
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isInCart ? 'En Carrito' : 'Comprar'}</span>
            </button>
          </div>

        </div>

      </div>

    </article>
  );
}
