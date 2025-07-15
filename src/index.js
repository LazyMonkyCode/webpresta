import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'
import authRoutes from './routes/authRoutes.js'
import clienteRoutes from './routes/clienteRoutes.js'
import prestamoRoutes from './routes/prestamoRoutes.js'
import pagoRoutes from './routes/pagoRoutes.js'
/* import chatRoutes from './routes/chatRoutes.js' */
 import notificationRoutes from './routes/notificationRoutes.js' 
import activityRoutes from './routes/activityRoutes.js'
/* import initializeSocket from './socketHandler.js' */
import dotenv from 'dotenv'
import cors from 'cors'
//import ngrok from '@ngrok/ngrok'

// Cargar variables de entorno
dotenv.config();

// Configuración para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración de variables de entorno
const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI
 
// Inicializar la aplicación Express
const app = express()

const server = http.createServer(app)
export const io = new Server(server, {
 /*  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000","http://localhost:3001", "http://localhost:3005", "http://localhost:3006"]
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    }, 
    methods: ["GET", "POST"]
  } */
}) 


// Middlewareadd .
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev')) // Logging
   
// Manejo de CORS
 app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

/*   const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:4000'
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true // solo si usás cookies/autenticación
  })); */
// Rutas de API
app.use('/api/auth', authRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/prestamos', prestamoRoutes)
app.use('/api/pagos', pagoRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/notifications', notificationRoutes)

/* app.use('/api/chat', chatRoutes) */
/* 
 */
// Initialize Socket.IO connection handling
//initializeSocket(io)

 import SocketHandler from './socket/SocketHandler.js'
export const socketHandler = new SocketHandler(io,{auth:{token:process.env.JWT_SECRET}})


// Servir archivos estáticos de React en producción
/* if (process.env.NODE_ENV == 'production') { */
  // Ruta a los archivos estáticos del build de React
  const staticPath = path.resolve(__dirname, '../frontend/build')
  
  // Configurar Express para servir los archivos estáticos
  app.use(express.static(staticPath))
  
  // Para cualquier otra ruta, enviar el index.html de React
  app.get('*', (req, res) => {
    // Excluimos las rutas de API que ya están manejadas
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(staticPath, 'index.html'))
    } else {
      res.status(404).json({ mensaje: 'API: Ruta no encontrada' })
    }
  })
/* } else { 
  // En desarrollo, mostrar mensaje de API
  app.get('/', (req, res) => {
    res.json({ mensaje: 'API de PrestaWeb funcionando correctamente' })
  })
  
  // Manejador de rutas no encontradas para desarrollo
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ mensaje: 'API: Ruta no encontrada' })
    }
    next()
  })
} */

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    mensaje: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

/* // Get your endpoint online
ngrok.connect({ addr: PORT, authtoken_from_env: true })
	.then(listener => console.log(`Ingress established at: ${listener.url()}`));
 */
// Conectar a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Conexión a MongoDB establecida con éxito')
    
    // Iniciar el servidor
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`)
      console.log(`Socket.IO escuchando.`)
      console.log(`Frontend disponible en http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err)
    process.exit(1)
  })

export default app
