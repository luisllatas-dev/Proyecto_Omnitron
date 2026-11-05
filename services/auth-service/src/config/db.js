const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://admin:adminsecretpassword@localhost:27017/omnitron_auth?authSource=admin';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Auth-Service] MongoDB Conectado: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Auth-Service] Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
