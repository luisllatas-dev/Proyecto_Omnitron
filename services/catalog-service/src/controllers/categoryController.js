const Category = require('../models/Category');
const Course = require('../models/Course');

// @desc    Obtener todas las categorías de cursos con el conteo de cursos en cada una
// @route   GET /api/categories
// @access  Público
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Course.countDocuments({ category: cat._id, isActive: true });
        return {
          ...cat.toObject(),
          courseCount: count
        };
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener detalle de una categoría por ID o Slug
// @route   GET /api/categories/:idOrSlug
// @access  Público
const getCategoryBySlugOrId = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let category;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(idOrSlug);
    } else {
      category = await Category.findOne({ slug: idOrSlug });
    }

    if (!category || !category.isActive) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    const courseCount = await Course.countDocuments({ category: category._id, isActive: true });

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        courseCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Crear nueva categoría de cursos (Admin)
// @route   POST /api/categories
// @access  Privado (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'El nombre y slug son obligatorios' });
    }

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese slug' });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon: icon || 'GraduationCap',
      order: order || 0
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Actualizar categoría (Admin)
// @route   PUT /api/categories/:id
// @access  Privado (Admin)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Desactivar categoría (Admin)
// @route   DELETE /api/categories/:id
// @access  Privado (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Categoría desactivada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlugOrId,
  createCategory,
  updateCategory,
  deleteCategory
};
