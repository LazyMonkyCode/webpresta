import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Cliente from '../models/cliente.js';

const MONGODB_URI = 'mongodb://localhost:27017/prestaweb';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function setClientPasswords() {
  try {
    await connectDB();
    
    // Obtener todos los clientes que no tienen contraseña
    const clientes = await Cliente.find({ password: { $exists: false } });
    
    console.log(`Encontrados ${clientes.length} clientes sin contraseña`);
    
    for (const cliente of clientes) {
      // Generar una contraseña temporal basada en el código de acceso
      const tempPassword = cliente.codigoAcceso + '123';
      
      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);
      
      // Actualizar el cliente
      cliente.password = hashedPassword;
      await cliente.save();
      
      console.log(`Contraseña establecida para cliente ${cliente.email || cliente.nickname}: ${tempPassword}`);
    }
    
    console.log('Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setClientPasswords(); 