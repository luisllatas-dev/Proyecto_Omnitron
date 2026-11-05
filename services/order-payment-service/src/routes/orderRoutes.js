const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyPurchasedCourses,
  getMyOrders,
  getAllOrdersForAdmin,
  getOrderMetricsForAdmin
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.use(protect);

// Rutas de Administrador
router.get('/admin/all', adminOnly, getAllOrdersForAdmin);
router.get('/admin/metrics', adminOnly, getOrderMetricsForAdmin);

// Rutas de Cliente
router.post('/', createOrder);
router.get('/my-courses', getMyPurchasedCourses);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
