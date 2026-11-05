import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Globe, 
  CheckCircle, 
  Lock, 
  ShieldCheck, 
  FolderDown, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function CheckoutModal() {
  const { cartItems, total, clearCart, isCheckoutModalOpen, setIsCheckoutModalOpen } = useCart();
  const { isAuthenticated, user, setIsAuthModalOpen, setIsPurchasesModalOpen } = useAuth();
  const { theme } = useTheme();

  const [paymentMethod, setPaymentMethod] = useState('PAYPAL');
  const [loading, setLoading] = useState(false);
  const [waitingPayment, setWaitingPayment] = useState(null); // { orderId, approveUrl, paypalOrderId }
  const [successOrder, setSuccessOrder] = useState(null);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  // Limpiar polling al desmontar o cerrar
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  if (!isCheckoutModalOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Iniciar monitoreo del estado de la orden (Webhook / Captura)
  const startOrderPolling = (orderId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data?.success && res.data.data.status === 'PAID') {
          clearInterval(pollIntervalRef.current);
          setWaitingPayment(null);
          setSuccessOrder(res.data.data);
          clearCart();
          triggerConfetti();
        }
      } catch (err) {
        console.error('Error comprobando estado de la orden:', err);
      }
    }, 2500);
  };

  // Crear orden y procesar pago
  const handleProcessPayment = async () => {
    setError(null);
    setLoading(true);

    try {
      // 1. Crear Orden en el backend
      const orderPayload = {
        items: cartItems.map(item => ({
          courseId: item.courseId || item._id,
          title: item.title,
          price: item.price,
          discountPrice: item.discountPrice || item.finalPrice,
          imageUrl: item.imageUrl
        })),
        paymentMethod: paymentMethod,
        currency: 'USD'
      };

      const orderRes = await api.post('/orders', orderPayload);
      const createdOrder = orderRes.data.data.order;
      const gatewayData = orderRes.data.data.paymentGatewayData;

      if (paymentMethod === 'PAYPAL') {
        const approveLink = gatewayData?.links?.find(l => l.rel === 'approve')?.href;

        if (approveLink) {
          // Abrir la ventana de aprobación de PayPal Sandbox
          window.open(approveLink, '_blank');
          setWaitingPayment({
            orderId: createdOrder._id,
            approveUrl: approveLink,
            paypalOrderId: gatewayData.paypalOrderId
          });
          startOrderPolling(createdOrder._id);
        } else {
          // Fallback simulación inmediata si no hubo link de PayPal
          const payRes = await api.post(`/payments/dev-simulate-pay/${createdOrder._id}`);
          if (payRes.data?.success) {
            setSuccessOrder(payRes.data.data);
            clearCart();
            triggerConfetti();
          }
        }
      } else {
        // Mercado Pago / IziPay / Simulación
        const payRes = await api.post(`/payments/dev-simulate-pay/${createdOrder._id}`);
        if (payRes.data?.success) {
          setSuccessOrder(payRes.data.data);
          clearCart();
          triggerConfetti();
        }
      }
    } catch (err) {
      console.error('Error procesando orden:', err);
      setError(err.response?.data?.message || err.message || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

  // Verificar manualmente el estado de la orden
  const handleCheckManual = async () => {
    if (!waitingPayment) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/${waitingPayment.orderId}`);
      if (res.data?.success && res.data.data.status === 'PAID') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setWaitingPayment(null);
        setSuccessOrder(res.data.data);
        clearCart();
        triggerConfetti();
      } else {
        setError('El pago aún figura como pendiente. Si ya pagaste en PayPal, el Webhook tardará unos segundos en confirmarlo.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Opción para simular la confirmación directa (para pruebas rápidas en local)
  const handleSimulateDirectConfirm = async () => {
    if (!waitingPayment) return;
    setLoading(true);
    try {
      const payRes = await api.post(`/payments/dev-simulate-pay/${waitingPayment.orderId}`);
      if (payRes.data?.success) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setWaitingPayment(null);
        setSuccessOrder(payRes.data.data);
        clearCart();
        triggerConfetti();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPurchases = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsCheckoutModalOpen(false);
    setSuccessOrder(null);
    setWaitingPayment(null);
    setIsPurchasesModalOpen(true);
  };

  const handleClose = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsCheckoutModalOpen(false);
    setSuccessOrder(null);
    setWaitingPayment(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. PANTALLA DE ÉXITO */}
        {successOrder ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                ¡Pago Confirmado Exitosamente!
              </span>
              <h3 className="text-2xl font-black text-white">
                Tus enlaces de Google Drive ya están listos
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-2">
                Hemos desbloqueado el acceso permanente a tus cursos. Puedes abrirlos y descargarlos de inmediato desde tu panel de compras.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Orden:</span>
                <span className="font-mono text-gray-200">#{successOrder._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total pagado:</span>
                <span className="font-bold text-white">${successOrder.totalAmount?.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Método de pago:</span>
                <span className="text-gray-200">{paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={handleGoToPurchases}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm shadow-xl transition ${theme.primaryBg} ${theme.primaryHover} text-white`}
            >
              <FolderDown className="w-4 h-4" />
              <span>Abrir Mi Biblioteca y Descargar de Drive</span>
            </button>
          </div>
        ) : waitingPayment ? (
          /* 2. PANTALLA DE ESPERA DE CONFIRMACIÓN DE PAYPAL */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-xl">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Esperando Confirmación de PayPal</span>
              </span>
              <h3 className="text-2xl font-black text-white">
                Procesando tu Pago
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-2">
                Se ha abierto la pasarela de PayPal. Completa el pago en esa pestaña; tan pronto como PayPal confirme la transacción (o el Webhook la reporte), tus cursos se desbloquearán automáticamente.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Orden Omnitron:</span>
                <span className="font-mono text-gray-200">#{waitingPayment.orderId.slice(-8)}</span>
              </div>
              {waitingPayment.paypalOrderId && (
                <div className="flex justify-between text-gray-400">
                  <span>PayPal Order ID:</span>
                  <span className="font-mono text-blue-400">{waitingPayment.paypalOrderId}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={waitingPayment.approveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition"
              >
                <span>Reabrir Ventana de PayPal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCheckManual}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Ya completé el pago (Verificar ahora)</span>
              </button>

              <button
                onClick={handleSimulateDirectConfirm}
                className="w-full text-center text-[11px] text-gray-500 hover:text-gray-300 py-1"
              >
                ⚡ Simular confirmación instantánea (Modo Pruebas)
              </button>
            </div>
          </div>
        ) : (
          /* 3. FORMULARIO NORMAL DE CHECKOUT */
          <div className="space-y-6">
            
            {/* Cabecera */}
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.primaryText}`}>
                Finalizar Compra
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Selecciona tu Método de Pago
              </h3>
            </div>

            {/* Si no está autenticado, solicitar inicio de sesión */}
            {!isAuthenticated ? (
              <div className="p-5 rounded-2xl bg-gray-950/80 border border-yellow-500/30 text-left space-y-3">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Se requiere una cuenta para asociar tus enlaces de Drive</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Para que tus links de Google Drive permanezcan seguros y accesibles para siempre, por favor inicia sesión o crea tu cuenta. <strong className="text-white">Tu carrito se mantendrá intacto.</strong>
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition ${theme.primaryBg} ${theme.primaryHover} text-white flex items-center justify-center gap-2`}
                >
                  <span>Iniciar Sesión / Registrarse para Pagar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Opciones de Pago */}
                <div className="space-y-3">
                  
                  {/* PayPal */}
                  <label
                    onClick={() => setPaymentMethod('PAYPAL')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === 'PAYPAL'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-800 bg-gray-950/40 hover:bg-gray-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm block">PayPal Oficial (Conectado)</span>
                        <span className="text-[11px] text-gray-400">Sandbox / Live con Webhook de entrega automática</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'PAYPAL'}
                      onChange={() => setPaymentMethod('PAYPAL')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  {/* Mercado Pago */}
                  <label
                    onClick={() => setPaymentMethod('MERCADOPAGO')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === 'MERCADOPAGO'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-800 bg-gray-950/40 hover:bg-gray-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm block">Mercado Pago (Latinoamérica)</span>
                        <span className="text-[11px] text-gray-400">Tarjetas locales, Oxxo, PSE, Pix</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'MERCADOPAGO'}
                      onChange={() => setPaymentMethod('MERCADOPAGO')}
                      className="text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>

                  {/* IziPay (Perú Yape/Plin) */}
                  <label
                    onClick={() => setPaymentMethod('IZIPAY')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === 'IZIPAY'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-800 bg-gray-950/40 hover:bg-gray-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm block">IziPay (Perú - Yape / Plin / Tarjetas)</span>
                        <span className="text-[11px] text-gray-400">Pago con QR o tarjetas de débito/crédito</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'IZIPAY'}
                      onChange={() => setPaymentMethod('IZIPAY')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                </div>

                {/* Mensaje de error */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {error}
                  </div>
                )}

                {/* Resumen Final */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Cursos en la orden:</span>
                    <span className="text-gray-200">{cartItems.length} cursos</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
                    <span>Monto Total:</span>
                    <span className="text-xl font-black text-white">${total.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Botón Pagar */}
                <button
                  onClick={handleProcessPayment}
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm shadow-xl transition ${theme.primaryBg} ${theme.primaryHover} text-white disabled:opacity-50`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Conectando con PayPal...' : `Pagar $${total.toFixed(2)} USD con PayPal`}</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Entrega inmediata por Google Drive una vez confirmado el pago</span>
                </div>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
