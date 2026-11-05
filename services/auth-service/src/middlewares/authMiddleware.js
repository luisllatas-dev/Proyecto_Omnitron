const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_omnitron_jwt_key_2026');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado o token inválido' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'No autorizado, token fallido o expirado' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No autorizado, se requiere token Bearer' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Acceso denegado: se requieren privilegios de administrador' });
  }
};

module.exports = { protect, adminOnly };
