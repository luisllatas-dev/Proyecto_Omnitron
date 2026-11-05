const Cart = require('../models/Cart');

// @desc    Obtener carrito del usuario autenticado
// @route   GET /api/cart
// @access  Privado
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Agregar un curso al carrito
// @route   POST /api/cart/add
// @access  Privado
const addToCart = async (req, res) => {
  try {
    const { courseId, title, price, discountPrice, imageUrl } = req.body;

    if (!courseId || !title || price === undefined) {
      return res.status(400).json({ success: false, message: 'Datos del curso incompletos' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemExists = cart.items.some(
      item => item.courseId.toString() === courseId.toString()
    );

    if (itemExists) {
      return res.status(400).json({ success: false, message: 'El curso ya está en el carrito' });
    }

    cart.items.push({
      courseId,
      title,
      price,
      discountPrice,
      imageUrl
    });

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Curso agregado al carrito',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sincronizar carrito de invitado (localStorage) con la cuenta del usuario tras login
// @route   POST /api/cart/sync
// @access  Privado
const syncGuestCart = async (req, res) => {
  try {
    const { guestItems } = req.body; // Array de { courseId, title, price, discountPrice, imageUrl }

    if (!Array.isArray(guestItems)) {
      return res.status(400).json({ success: false, message: 'El formato de guestItems debe ser un arreglo' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Merge sin duplicar cursos
    guestItems.forEach(guestItem => {
      const exists = cart.items.some(
        item => item.courseId.toString() === guestItem.courseId.toString()
      );
      if (!exists && guestItem.courseId) {
        cart.items.push(guestItem);
      }
    });

    await cart.save();

    res.json({
      success: true,
      message: 'Carrito de invitado sincronizado exitosamente',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Eliminar un curso del carrito
// @route   DELETE /api/cart/item/:courseId
// @access  Privado
const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
    }

    cart.items = cart.items.filter(
      item => item.courseId.toString() !== courseId.toString()
    );

    await cart.save();

    res.json({
      success: true,
      message: 'Curso removido del carrito',
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vaciar el carrito
// @route   DELETE /api/cart
// @access  Privado
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Carrito vaciado'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  syncGuestCart,
  removeFromCart,
  clearCart
};
