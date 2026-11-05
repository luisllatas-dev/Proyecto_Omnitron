const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del curso es obligatorio'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true
    },
    imageUrl: {
      type: String,
      required: [true, 'La imagen de portada es obligatoria']
    },
    price: {
      type: Number,
      required: [true, 'El precio regular es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'El precio de descuento no puede ser negativo']
    },
    // Categoría del curso (ej. Programación, Soldadura, Diseño, etc.)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría del curso es obligatoria']
    },
    // Temario / Módulos del curso
    syllabus: [
      {
        title: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          trim: true
        }
      }
    ],
    // Enlace de Google Drive protegido (NUNCA se envía en consultas públicas)
    driveUrl: {
      type: String,
      required: [true, 'El enlace de Google Drive es obligatorio para el curso'],
      select: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual para saber si tiene descuento activo
courseSchema.virtual('hasDiscount').get(function () {
  return this.discountPrice !== null && this.discountPrice < this.price;
});

// Virtual para porcentaje de descuento
courseSchema.virtual('discountPercentage').get(function () {
  if (this.hasDiscount) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
