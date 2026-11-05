const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  syncGuestCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/sync', syncGuestCart);
router.delete('/item/:courseId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
