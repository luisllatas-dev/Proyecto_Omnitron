const axios = require('axios');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { capturePayPalPayment } = require('../services/paypalService');
const { verifyIziPaySignature } = require('../services/iziPayService');

const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:4002/api/courses';

// Función auxiliar para desbloquear la orden y adjuntar los links de Google Drive
const markOrderAsPaid = async (order, paymentDetails) => {
  order.status = 'PAID';
  order.paymentDetails = {
    ...paymentDetails,
    paidAt: new Date()
  };

  // Solicitar al catalog-service los driveUrl protegidos de estos cursos
  try {
    const courseIds = order.items.map(i => i.courseId);
    const catalogRes = await axios.post(`${CATALOG_SERVICE_URL}/internal/batch-purchased`, {
      courseIds
    });

    if (catalogRes.data?.success && Array.isArray(catalogRes.data.data)) {
      const coursesFromCatalog = catalogRes.data.data;
      
      order.items = order.items.map(item => {
        const found = coursesFromCatalog.find(c => c._id.toString() === item.courseId.toString());
        if (found && found.driveUrl) {
          item.driveUrl = found.driveUrl;
        }
        return item;
      });
    }
  } catch (error) {
    console.error('[Error obteniendo Drive URLs del catalog-service]:', error.message);
  }

  await order.save();

  // Limpiar el carrito del usuario tras la compra exitosa
  await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
  console.log(`✅ [Omnitron] Orden #${order._id} marcada como PAGADA y carrito vaciado.`);
};

// @desc    Webhook / Captura de PayPal
// @route   POST /api/payments/webhook/paypal
const handlePayPalWebhook = async (req, res) => {
  try {
    let orderId = req.body.orderId;
    let paypalOrderId = req.body.paypalOrderId;

    // 1. Manejar Webhook oficial enviado por los servidores de PayPal
    if (req.body.event_type && req.body.resource) {
      const { event_type, resource } = req.body;
      console.log(`🔔 [PayPal Webhook] Evento recibido: "${event_type}" (Recurso: ${resource.id})`);

      // Extraer el ID de la orden de Omnitron desde custom_id o reference_id
      orderId = resource.custom_id 
        || resource.reference_id 
        || resource.purchase_units?.[0]?.reference_id
        || resource.purchase_units?.[0]?.custom_id;

      paypalOrderId = resource.supplementary_data?.related_ids?.order_id || resource.id;

      // Si no viene directo, intentar buscar la orden por el paypalOrderId registrado
      if (!orderId && paypalOrderId) {
        const foundOrder = await Order.findOne({
          $or: [
            { 'paymentDetails.paymentId': paypalOrderId },
            { 'paymentDetails.paypalOrderId': paypalOrderId }
          ]
        });
        if (foundOrder) {
          orderId = foundOrder._id;
        }
      }

      if (event_type === 'PAYMENT.CAPTURE.COMPLETED' || event_type === 'CHECKOUT.ORDER.APPROVED') {
        if (!orderId) {
          console.warn('[PayPal Webhook] Advertencia: No se encontró orderId para el evento:', event_type);
          return res.status(200).json({ success: true, message: 'Evento recibido pero no vinculado' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
          return res.status(404).json({ success: false, message: 'Orden no encontrada' });
        }

        // Idempotencia: si ya está pagada, retornar 200 OK inmediatamente
        if (order.status === 'PAID') {
          console.log(`ℹ️ [PayPal Webhook] La orden #${order._id} ya fue pagada previamente.`);
          return res.status(200).json({ success: true, message: 'Orden ya marcada como pagada' });
        }

        let captureResult = resource;
        // Si el evento fue aprobación de orden, capturarla ahora
        if (event_type === 'CHECKOUT.ORDER.APPROVED' && resource.status === 'APPROVED') {
          captureResult = await capturePayPalPayment(resource.id);
        }

        if (captureResult.status === 'COMPLETED' || resource.status === 'COMPLETED') {
          await markOrderAsPaid(order, {
            paymentId: paypalOrderId || resource.id,
            rawResponse: captureResult
          });

          console.log(`🎉 [PayPal Webhook] ¡Orden #${order._id} activada exitosamente con links de Drive!`);
          return res.status(200).json({
            success: true,
            message: 'Orden pagada y cursos desbloqueados vía Webhook',
            orderId: order._id
          });
        }
      }

      // Responder 200 a PayPal para cualquier otro evento (para que no reintente innecesariamente)
      return res.status(200).json({ success: true, message: 'Webhook procesado' });
    }

    // 2. Manejar captura manual solicitada desde el Frontend
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId es requerido' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    if (order.status === 'PAID') {
      return res.json({ success: true, message: 'La orden ya está pagada', orderId: order._id });
    }

    let captureResult = { status: 'COMPLETED' };
    if (paypalOrderId && !paypalOrderId.startsWith('MOCK_')) {
      captureResult = await capturePayPalPayment(paypalOrderId);
    }

    if (captureResult.status === 'COMPLETED' || captureResult.status === 'APPROVED') {
      await markOrderAsPaid(order, {
        paymentId: paypalOrderId,
        rawResponse: captureResult
      });

      return res.json({
        success: true,
        message: 'Pago de PayPal procesado y verificado',
        orderId: order._id
      });
    }

    res.status(400).json({ success: false, message: 'El pago no está completado en PayPal' });
  } catch (error) {
    console.error('[PayPal Webhook Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Webhook de Mercado Pago (IPN)
// @route   POST /api/payments/webhook/mercadopago
const handleMercadoPagoWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    // Mercado Pago envía notificaciones de tipo 'payment'
    if (type === 'payment' && data?.id) {
      console.log(`[Mercado Pago IPN] Recibida notificación de pago ID: ${data.id}`);
      // En producción se consulta el estado del pago a la API de MP con el token
      // y si está 'approved', se obtiene external_reference (orderId) y se marca como PAID
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[MercadoPago Webhook Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Webhook / Notificación IPN de IziPay
// @route   POST /api/payments/webhook/izipay
const handleIziPayWebhook = async (req, res) => {
  try {
    const { 'kr-answer': krAnswer, 'kr-hash': krHash } = req.body;

    if (!krAnswer || !krHash) {
      return res.status(400).json({ success: false, message: 'Faltan parámetros kr-answer o kr-hash' });
    }

    const isValid = verifyIziPaySignature(krAnswer, krHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Firma de IziPay inválida' });
    }

    const answer = JSON.parse(krAnswer);
    const orderId = answer.orderDetails?.orderId;
    const orderStatus = answer.orderStatus; // 'PAID'

    if (orderId && orderStatus === 'PAID') {
      const order = await Order.findById(orderId);
      if (order && order.status !== 'PAID') {
        await markOrderAsPaid(order, {
          paymentId: answer.transactions?.[0]?.transactionDetails?.cardDetails?.paymentMethod,
          rawResponse: answer
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[IziPay Webhook Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Endpoint de desarrollo para simular pago exitoso sin pasarela real
// @route   POST /api/payments/dev-simulate-pay/:orderId
const devSimulatePay = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    await markOrderAsPaid(order, {
      paymentId: `SIMULATED_${Date.now()}`,
      paidAt: new Date()
    });

    res.json({
      success: true,
      message: 'Orden pagada exitosamente (Simulación de Desarrollo)',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handlePayPalWebhook,
  handleMercadoPagoWebhook,
  handleIziPayWebhook,
  devSimulatePay
};
