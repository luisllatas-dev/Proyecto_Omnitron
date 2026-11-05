require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://admin:adminsecretpassword@localhost:27017/omnitron_auth?authSource=admin';

  try {
    await mongoose.connect(mongoURI);
    console.log('🌱 Conectado a MongoDB para crear o actualizar usuario administrador...');

    const adminEmail = 'admin@omnitron.com';
    const adminPassword = 'admin123456';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.name = 'Administrador Omnitron';
      admin.role = 'admin';
      admin.password = adminPassword; // El hook pre('save') lo encriptará con bcrypt
      await admin.save();
      console.log('✅ Usuario Administrador actualizado con éxito!');
    } else {
      admin = await User.create({
        name: 'Administrador Omnitron',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('✅ Usuario Administrador creado con éxito!');
    }

    console.log('📧 Correo:', adminEmail);
    console.log('🔑 Contraseña:', adminPassword);
    console.log('🛡️ Rol:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear administrador:', error);
    process.exit(1);
  }
};

seedAdmin();
