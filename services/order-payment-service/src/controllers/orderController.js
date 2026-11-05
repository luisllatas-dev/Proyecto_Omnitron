const axios = require('axios');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { createPayPalOrder } = require('../services/paypalService');
const { createMercadoPagoPreference } = require('../services/mercadoPagoService');
const { createIziPayPaymentToken } = require('../services/iziPayService');

const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:4002/api/courses';

// @desc    Crear nueva orden e inicializar pasarela de pago
// @route   POST /api/orders
// @access  Privado
const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, currency = 'USD' } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email || req.body.userEmail || 'cliente@omnitron.com';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'La orden no contiene ningún curso' });
    }

    if (!['PAYPAL', 'MERCADOPAGO', 'IZIPAY'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Método de pago no válido' });
    }

    // Calcular el precio final de cada ítem respetando el descuento
    let totalAmount = 0;
    const processedItems = items.map(item => {
      const finalPrice = (item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price)
        ? item.discountPrice
        : item.price;
      
      totalAmount += Number(finalPrice);

      return {
        courseId: item.courseId,
        title: item.title,
        price: item.price,
        finalPrice: finalPrice,
        imageUrl: item.imageUrl,
        driveUrl: null // Se llena al pagar
      };
    });

    // Crear orden en BD con estado PENDING
    const order = await Order.create({
      userId,
      userEmail,
      items: processedItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      currency,
      paymentMethod,
      status: 'PENDING'
    });

    let paymentGatewayData = {};

    // Iniciar flujo con la pasarela correspondiente
    switch (paymentMethod) {
      case 'PAYPAL':
        try {
          const paypalRes = await createPayPalOrder(order._id, order.totalAmount, currency);
          paymentGatewayData = {
            paypalOrderId: paypalRes.id,
            links: paypalRes.links
          };
        } catch (err) {
          console.warn('[PayPal Warn] Usando fallback sandbox simulado si faltan credenciales');
          paymentGatewayData = {
            paypalOrderId: `MOCK_PAYPAL_${order._id}`,
            note: 'Configura PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET para live/sandbox real'
          };
        }
        break;

      case 'MERCADOPAGO':
        try {
          const mpRes = await createMercadoPagoPreference(order._id, order.items, userEmail);
          paymentGatewayData = {
            preferenceId: mpRes.id,
            initPoint: mpRes.init_point
          };
        } catch (err) {
          console.warn('[MercadoPago Warn] Usando fallback sandbox simulado si faltan credenciales');
          paymentGatewayData = {
            preferenceId: `MOCK_MP_${order._id}`,
            note: 'Configura MERCADOPAGO_ACCESS_TOKEN para producción'
          };
        }
        break;

      case 'IZIPAY':
        try {
          const iziRes = await createIziPayPaymentToken(order._id, order.totalAmount, currency, userEmail);
          paymentGatewayData = {
            formToken: iziRes.answer?.formToken,
            iziPayDetails: iziRes
          };
        } catch (err) {
          console.warn('[IziPay Warn] Usando fallback sandbox simulado si faltan credenciales');
          paymentGatewayData = {
            formToken: `MOCK_IZIPAY_TOKEN_${order._id}`,
            note: 'Configura IZIPAY_PUBLIC_KEY y IZIPAY_HMAC_SHA256 para producción'
          };
        }
        break;
    }

    res.status(201).json({
      success: true,
      data: {
        order,
        paymentGatewayData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Panel "Mis Cursos" / "Mis Compras" - Entrega segura de enlaces de Google Drive
// @route   GET /api/orders/my-courses
// @access  Privado (Cliente)
const getMyPurchasedCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar todas las órdenes del usuario con estado 'PAID'
    const paidOrders = await Order.find({ userId, status: 'PAID' }).sort({ createdAt: -1 });

    if (!paidOrders || paidOrders.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: 'Aún no has adquirido ningún curso'
      });
    }

    // Extraer cursos únicos adquiridos
    const courseMap = new Map();
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        if (!courseMap.has(item.courseId.toString())) {
          courseMap.set(item.courseId.toString(), {
            courseId: item.courseId,
            title: item.title,
            imageUrl: item.imageUrl,
            driveUrl: item.driveUrl,
            purchasedAt: order.paymentDetails?.paidAt || order.updatedAt,
            orderId: order._id
          });
        }
      });
    });

    const purchasedCourses = Array.from(courseMap.values());

    res.json({
      success: true,
      count: purchasedCourses.length,
      data: purchasedCourses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Historial de compras / órdenes del usuario
// @route   GET /api/orders/my-orders
// @access  Privado
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener todas las órdenes para el panel de administración
// @route   GET /api/orders/admin/all
// @access  Privado (Admin)
const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener métricas y KPIs de ventas para el administrador
// @route   GET /api/orders/admin/metrics
// @access  Privado (Admin)
const getOrderMetricsForAdmin = async (req, res) => {
  try {
    const allOrders = await Order.find({});
    
    let totalRevenue = 0;
    let paidOrdersCount = 0;
    let pendingOrdersCount = 0;
    const customerEmails = new Set();

    allOrders.forEach(order => {
      if (order.status === 'PAID') {
        totalRevenue += Number(order.totalAmount || 0);
        paidOrdersCount++;
      } else if (order.status === 'PENDING') {
        pendingOrdersCount++;
      }
      if (order.userEmail) {
        customerEmails.add(order.userEmail);
      }
    });

    res.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: allOrders.length,
        paidOrders: paidOrdersCount,
        pendingOrders: pendingOrdersCount,
        totalCustomers: customerEmails.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener detalle de una orden por ID
// @route   GET /api/orders/:id
// @access  Privado (dueño de la orden o Admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    if (order.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'No autorizado para ver esta orden' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyPurchasedCourses,
  getMyOrders,
  getAllOrdersForAdmin,
  getOrderMetricsForAdmin
};
