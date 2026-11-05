const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
    },
    items: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        title: String,
        price: Number,
        discountPrice: Number,
        imageUrl: String,
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Cart', cartSchema);
