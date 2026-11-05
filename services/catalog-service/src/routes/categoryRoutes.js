const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlugOrId,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/', getCategories);
router.get('/:idOrSlug', getCategoryBySlugOrId);

// Rutas protegidas (Admin)
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
