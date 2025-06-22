import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Cliente from '../models/cliente.js';

const JWT_SECRET = process.env.JWT_SECRET || 'prestaweb-secret-key';
const TOKEN_EXPIRATION = '7d'; // Una semana



const accessCodeLogin=async(req,res,next)=>{
  const { username, password,remmember } = req.body;

  console.log(req.body)
    if(username && password) {
      return next()
    }
    
        const {codigoAcceso  } = req.body;
        if (!codigoAcceso) {
        return res.status(400).json({ 
          mensaje: 'Por favor proporciona un código de acceso' 
        });
      }
   
   

    try {
          //console.log(req.body)
    // Buscar cliente por código de acceso
    const cliente = await Cliente.findOne({ codigoAcceso: codigoAcceso });
    

    //console.log(cliente);
    if (!cliente) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

     
    // Verificar si la cuenta está activa
   /*  if (!cliente.activo) {
      return res.status(401).json({ mensaje: 'La cuenta está desactivada' });
    } */
    
    // Generar token JWT 
    const token = jwt.sign(
        { id: cliente._id, codigoAcceso: cliente.codigoAcceso },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );
      
      // Devolver datos del cliente y token
      res.json({
        token,
        cliente
      });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
  
    
}

const usernameLogin=async(req,res)=>{
    const { username, password,remmember } = req.body;


    // Primero intentar buscar como usuario admin
    let user = await User.findOne({ email:username });
    let isAdmin = false;
    
    if (user) {
        isAdmin = true;
    } else {
        // Si no es usuario admin, buscar como cliente por email
        user = await Cliente.findOne({ email: username });
        if (!user) {
            return res.status(401).json({ mensaje: 'Usuario no encontrado' });
        }
    }
    
    // Verificar contraseña
    let passwordValida = false;
    
    if (isAdmin) {
        passwordValida = await bcrypt.compare(password, user.password);
    } else {
        // Para clientes, usar el método comparePassword
        passwordValida = await user.comparePassword(password);
    }
    
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    } 
    
    /* // Verificar si la cuenta está activa
     if (!user.activo) {
      return res.status(401).json({ mensaje: 'La cuenta está desactivada' });
    }  */
    
    // Generar token JWT 
    const token = jwt.sign(
        { id: user._id, codigoAcceso: user.codigoAcceso || user.username },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );
    
    // Devolver respuesta según el tipo de usuario
    if (isAdmin) {
      console.log("es admin");
        return res.status(200).json({ message: 'Usuario autenticado correctamente', token, user });
    } else {
        return res.status(200).json({ message: 'Cliente autenticado correctamente', token, cliente: user });
    }
   
}


const verifyToken=async(req,res)=>{
   
        try {
          const token = req.header('Authorization')?.replace('Bearer ', '');
          
          if (!token) {
            return res.status(401).json({ valid: false });
          }
          
          // Verificar token
          const decoded = jwt.verify(token, JWT_SECRET);
          
          // Buscar cliente
          const cliente = await Cliente.findById(decoded.id);
          
          if (!cliente || !cliente.activo) {
            return res.status(401).json({ valid: false });
          }
          
          // Devolver información del cliente
          res.json({
            valid: true,
            cliente: {
              id: cliente._id,
              nombre: cliente.nombre,
              apellido: cliente.apellido,
              email: cliente.email,
              codigoAcceso: cliente.codigoAcceso
            }
          });
        } catch (error) {
          return res.status(401).json({ valid: false });
        }
      
    
}


const registerUser=async(req,res)=>{  
    try {
        const { username, password ,email} = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
        }

        if(password.length<6){
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }
       // const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({ username, password,email });

        const token = jwt.sign(
            { id: user._id, ...user },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
          );
          
          
        return res.status(201).json({ message: 'Usuario registrado correctamente', token,user });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }


}



const setPassword=async(req,res)=>{
   
        try {
          const { documento, codigo, password } = req.body;
          
          if (!documento || !codigo || !password) {
            return res.status(400).json({ 
              mensaje: 'Documento, código y contraseña son requeridos' 
            });
          }
          
          // Buscar cliente por documento
          const cliente = await Cliente.findOne({ documentoIdentidad: documento });
          
          if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
          }
          
          // Aquí verificaríamos un código de activación que se enviaría por correo o SMS
          // Este es un ejemplo simple, en una aplicación real se implementaría más seguridad
          
          // Encriptar la nueva contraseña
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          
          // Actualizar contraseña
          cliente.password = hashedPassword;
          await cliente.save();
          
          res.json({ mensaje: 'Contraseña establecida con éxito' });
        } catch (error) {
          console.error('Error al establecer contraseña:', error);
          res.status(500).json({ mensaje: 'Error del servidor' });
        }
      
}

// Función para establecer contraseña por email
const setPasswordByEmail = async (req, res) => {
  try {
    const { email, codigoAcceso, password } = req.body;
    
    if (!email || !codigoAcceso || !password) {
      return res.status(400).json({ 
        mensaje: 'Email, código de acceso y contraseña son requeridos' 
      });
    }
    
    // Buscar cliente por email y código de acceso
    const cliente = await Cliente.findOne({ email, codigoAcceso });
    
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado o código de acceso incorrecto' });
    }
    
    // Verificar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Actualizar contraseña
    cliente.password = hashedPassword;
    await cliente.save();
    
    res.json({ mensaje: 'Contraseña establecida con éxito' });
  } catch (error) {
    console.error('Error al establecer contraseña:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};


export default {
    accessCodeLogin,
    usernameLogin,
    verifyToken,
    registerUser,
    setPassword,
    setPasswordByEmail
}