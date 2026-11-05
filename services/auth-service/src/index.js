require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4001;

// Conectar a Base de Datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'auth-service' });
});

// Rutas
app.use('/api/auth', authRoutes);

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada en Auth Service' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 [Auth-Service] corriendo en el puerto ${PORT}`);
});
