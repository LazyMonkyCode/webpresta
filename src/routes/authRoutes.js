import { Router } from 'express';

import authController from '../controllers/authController.js';
const router = Router();

// Login de cliente
router.post('/login',authController.accessCodeLogin,authController.usernameLogin);
router.post('/register',authController.registerUser);
// Verificar token (para validar sesión en frontend)
router.get('/verificar', authController.verifyToken);
router.post('/verificar-email', authController.verificarEmail);

// Establecer contraseña (primera vez o recuperación)
router.post('/set-password', authController.setPassword);
router.post('/set-password-email', authController.setPasswordByEmail);

export default router; 