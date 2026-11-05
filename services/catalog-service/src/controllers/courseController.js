const Course = require('../models/Course');
const Category = require('../models/Category');

// @desc    Obtener cursos activos (Público) con filtros por categoría y búsqueda
// @route   GET /api/courses
// @access  Público
const getCourses = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };

    // Filtro por Categoría (slug o ID)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCat = await Category.findOne({ slug: category });
        if (foundCat) {
          query.category = foundCat._id;
        } else {
          return res.json({ success: true, count: 0, data: [] });
        }
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // El campo driveUrl nunca se envía públicamente (select: false en modelo)
    const courses = await Course.find(query)
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener detalle de un curso por ID o Slug (Público)
// @route   GET /api/courses/:idOrSlug
// @access  Público
const getCourseBySlugOrId = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let course;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(idOrSlug).populate('category', 'name slug icon description');
    } else {
      course = await Course.findOne({ slug: idOrSlug }).populate('category', 'name slug icon description');
    }

    if (!course || !course.isActive) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Crear un nuevo curso (Admin)
// @route   POST /api/courses
// @access  Privado (Admin)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      imageUrl,
      price,
      discountPrice,
      category,
      syllabus,
      driveUrl,
      isFeatured,
      isActive
    } = req.body;

    const exists = await Course.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Ya existe un curso con ese slug' });
    }

    const course = await Course.create({
      title,
      slug,
      description,
      imageUrl,
      price,
      discountPrice,
      category,
      syllabus,
      driveUrl,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true
    });

    const populated = await Course.findById(course._id)
      .populate('category', 'name slug icon')
      .select('+driveUrl');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Actualizar curso (Admin)
// @route   PUT /api/courses/:id
// @access  Privado (Admin)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('category', 'name slug icon')
      .select('+driveUrl');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Eliminar curso (Admin - delete permanente o desactivar)
// @route   DELETE /api/courses/:id
// @access  Privado (Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    res.json({
      success: true,
      message: 'Curso eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Endpoint interno para consultar cursos comprados con sus enlaces de Drive incluidos
// @route   POST /api/courses/internal/batch-purchased
// @access  Interno entre microservicios
const getBatchCoursesWithDrive = async (req, res) => {
  try {
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ success: false, message: 'Lista de IDs inválida' });
    }

    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate('category', 'name slug')
      .select('+driveUrl');

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener todos los cursos para el panel de administración (incluye driveUrl y estado)
// @route   GET /api/courses/admin/all
// @access  Privado (Admin)
const getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate('category', 'name slug')
      .select('+driveUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCourses,
  getAdminCourses,
  getCourseBySlugOrId,
  createCourse,
  updateCourse,
  deleteCourse,
  getBatchCoursesWithDrive
};
