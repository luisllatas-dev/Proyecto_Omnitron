const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_omnitron_jwt_key_2026');

      req.user = decoded; // { id, role, iat, exp }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token no válido o expirado' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No autorizado, token requerido' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Acceso denegado: solo administradores' });
  }
};

module.exports = { protect, adminOnly };
