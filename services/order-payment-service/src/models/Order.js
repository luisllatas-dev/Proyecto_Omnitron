const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  finalPrice: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String
  },
  // driveUrl se almacena cuando el pago es completado exitosamente
  driveUrl: {
    type: String,
    default: null
  }
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      enum: ['PAYPAL', 'MERCADOPAGO', 'IZIPAY'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    paymentDetails: {
      transactionId: String,
      paymentId: String,
      payerEmail: String,
      rawResponse: mongoose.Schema.Types.Mixed,
      paidAt: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
