import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  to_user: { // Para notificaciones a usuarios administradores/staff
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  to_client: { // Para notificaciones a clientes
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
  },
  from_user: { // El usuario que originó la notificación
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  }, 
  from_client: { // El cliente que originó la notificación
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    
  }, 
  title: {
    type: String,
    
  },
  type: {
    type: String,
    required: true,
    
  },
  message: {
    type: String,
    required: true,
  },
  link: { // Enlace opcional a un recurso (ej. /prestamos/:id)
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
  },
  
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Índices para mejorar el rendimiento de las consultas
notificationSchema.index({ to_user: 1, read: 1, created_at: -1 });
notificationSchema.index({ to_client: 1, read: 1, created_at: -1 });
notificationSchema.index({ from_user: 1, read: 1, created_at: -1 });
notificationSchema.index({ from_client: 1, read: 1, created_at: -1 });


const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 