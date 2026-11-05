import React from 'react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartDrawer() {
  const { 
    cartItems, 
    itemsCount, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    clearCart, 
    total, 
    subtotal, 
    savings,
    setIsCheckoutModalOpen 
  } = useCart();

  const { theme } = useTheme();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col">
          
          {/* Cabecera del Carrito */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${theme.primaryBg} text-white`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Carrito de Compras</h2>
                <span className="text-xs text-gray-400">
                  {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'} seleccionado(s)
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Productos */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Explora nuestro catálogo y agrega los cursos, juegos o herramientas que te interesen.
                </p>
              </div>
            ) : (
              cartItems.map((item) => {
                const id = item.courseId || item._id;
                const price = Number(item.discountPrice || item.finalPrice || item.price);

                return (
                  <div
                    key={id}
                    className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 flex items-center gap-3.5 group"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-14 object-cover rounded-xl shrink-0 bg-gray-800"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-gray-200">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        {item.categoryName || 'Descarga Digital'}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-white">
                          ${price.toFixed(2)}
                        </span>
                        {item.discountPrice && (
                          <span className="text-[11px] text-gray-500 line-through">
                            ${Number(item.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition rounded-lg hover:bg-gray-800"
                      title="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Resumen y Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-800 bg-gray-950/50 space-y-4">
              
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-gray-300">${subtotal.toFixed(2)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Ahorro total aplicado:</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
                  <span>Total a pagar:</span>
                  <span className="text-xl font-black text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón de Checkout */}
              <button
                onClick={handleProceedToCheckout}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm shadow-xl transition ${theme.primaryBg} ${theme.primaryHover} text-white`}
              >
                <span>Proceder al Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Pago 100% Seguro
                </span>
                <button
                  onClick={clearCart}
                  className="hover:text-red-400 transition"
                >
                  Vaciar carrito
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
