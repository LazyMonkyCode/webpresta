import { Router } from 'express';
import { 
  getActivities, 
  getAdminActivities, 
  getActivitiesSummary, 
  getActivityById,
  getLastActivity,
  getUnsyncedActivities,
  createClientActivity
} from '../controllers/activityController.js';
import { verificarToken, verificarAdminOrCollector } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas protegidas - solo admin y cobradores pueden acceder
router.get('/', [verificarToken, verificarAdminOrCollector], getActivities);
router.get('/summary', [verificarToken, verificarAdminOrCollector], getActivitiesSummary);
router.get('/admin/:adminId', [verificarToken, verificarAdminOrCollector], getAdminActivities);
router.get('/last', [verificarToken], getLastActivity);
router.get('/unsynced', [verificarToken], getUnsyncedActivities);
router.post('/client/create', [verificarToken, verificarAdminOrCollector], createClientActivity); 

router.get('/:id', [verificarToken, verificarAdminOrCollector], getActivityById);

export default router; 