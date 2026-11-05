import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('omnitron_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Guardar siempre en localStorage para persistencia garantizada
  useEffect(() => {
    localStorage.setItem('omnitron_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sincronizar con backend cuando el usuario se autentica
  useEffect(() => {
    const syncWithBackend = async () => {
      if (isAuthenticated && cartItems.length > 0) {
        try {
          const res = await api.post('/cart/sync', { guestItems: cartItems });
          if (res.data?.success && res.data.data?.items) {
            setCartItems(res.data.data.items);
          }
        } catch (err) {
          console.warn('Error sincronizando carrito con cuenta:', err.message);
        }
      } else if (isAuthenticated) {
        // Cargar carrito del backend si el local está vacío
        try {
          const res = await api.get('/cart');
          if (res.data?.success && res.data.data?.items?.length > 0) {
            setCartItems(res.data.data.items);
          }
        } catch (err) {
          console.warn('Error cargando carrito remoto:', err.message);
        }
      }
    };

    syncWithBackend();
  }, [isAuthenticated]);

  // Agregar al carrito
  const addToCart = (product) => {
    const finalPrice = product.discountPrice || product.price;
    const exists = cartItems.some(
      item => (item.courseId || item._id) === (product._id || product.courseId)
    );

    if (exists) {
      setIsCartOpen(true);
      return;
    }

    const newItem = {
      courseId: product._id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      finalPrice: finalPrice,
      imageUrl: product.imageUrl,
      categoryName: product.category?.name || 'Digital'
    };

    setCartItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  // Remover del carrito
  const removeFromCart = async (courseId) => {
    setCartItems(prev => prev.filter(item => (item.courseId || item._id) !== courseId));

    if (isAuthenticated) {
      try {
        await api.delete(`/cart/item/${courseId}`);
      } catch (err) {
        console.warn('Error removiendo ítem remoto:', err.message);
      }
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('omnitron_cart');

    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.warn('Error vaciando carrito remoto:', err.message);
      }
    }
  };

  // Cálculos de totales
  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price), 0);
  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.discountPrice || item.finalPrice || item.price),
    0
  );
  const savings = Math.max(0, subtotal - total);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount: cartItems.length,
        addToCart,
        removeFromCart,
        clearCart,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        isCartOpen,
        setIsCartOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
