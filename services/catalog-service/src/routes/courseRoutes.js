const express = require('express');
const router = express.Router();
const {
  getCourses,
  getAdminCourses,
  getCourseBySlugOrId,
  createCourse,
  updateCourse,
  deleteCourse,
  getBatchCoursesWithDrive
} = require('../controllers/courseController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Endpoint interno usado por Order Service para entregar enlaces
router.post('/internal/batch-purchased', getBatchCoursesWithDrive);

// Ruta protegida para panel de administración
router.get('/admin/all', protect, adminOnly, getAdminCourses);

// Rutas públicas
router.get('/', getCourses);
router.get('/:idOrSlug', getCourseBySlugOrId);

// Rutas protegidas (Admin)
router.post('/', protect, adminOnly, createCourse);
router.put('/:id', protect, adminOnly, updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

module.exports = router;
