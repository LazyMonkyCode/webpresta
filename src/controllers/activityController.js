import Activity from '../models/activity.js';

// Obtener la última actividad
export const getLastActivity = async (req, res) => {
  try {
    const lastActivity = await Activity.findOne().sort({ timestamp: -1 });
    res.json(lastActivity);
  } catch (error) {
    console.error('Error al obtener la última actividad:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Obtener actividades no sincronizadas
export const getUnsyncedActivities = async (req, res) => {
  try {
    const {date} = req.query;
    const unsyncedActivities = await Activity.find({ timestamp: { $gt: new Date(date) } });
    res.json(unsyncedActivities);
  } catch (error) {
    console.error('Error al obtener actividades no sincronizadas:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Obtener todas las actividades con paginación
export const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, admin_id, action, startDate, endDate } = req.query;
    
    const query = {};
    
    // Filtros opcionales
    if (admin_id) {
      query.admin_id = req.user._id;
    }
    
    if (action) {
      query.action = action;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Obtener total de actividades
    const total = await Activity.countDocuments(query);
    
    // Obtener actividades paginadas
    const activities = await Activity.find(query)
      .populate('admin_id', 'username role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      activities,
      paginacion: {
        total,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
    
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Obtener actividades de un administrador específico
export const getAdminActivities = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Obtener total de actividades del admin
    const total = await Activity.countDocuments({ admin_id: adminId });
    
    // Obtener actividades del admin
    const activities = await Activity.find({ admin_id: adminId })
      .populate('admin_id', 'username role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      activities,
      paginacion: {
        total,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
    
  } catch (error) {
    console.error('Error al obtener actividades del admin:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Obtener resumen de actividades
export const getActivitiesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    // Obtener estadísticas por acción
    const actionStats = await Activity.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment_amount' }
        }
      }
    ]);
    
    // Obtener estadísticas por admin
    const adminStats = await Activity.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$admin_id',
          admin_name: { $first: '$admin_name' },
          admin_role: { $first: '$admin_role' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment_amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Obtener totales generales
    const totalActivities = await Activity.countDocuments(query);
    const totalAmount = await Activity.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$payment_amount' } } }
    ]);
    
    res.json({
      totalActivities,
      totalAmount: totalAmount[0]?.total || 0,
      actionStats,
      adminStats
    });
    
  } catch (error) {
    console.error('Error al obtener resumen de actividades:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Obtener actividad específica
export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await Activity.findById(id)
      .populate('admin_id', 'name lastname role')
      .lean();
    
    if (!activity) {
      return res.status(404).json({ mensaje: 'Actividad no encontrada' });
    }
    
    res.json(activity);
    
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
}; 