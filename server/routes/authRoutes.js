import express from 'express';
import { register, login, getMe, updateSettings } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { RegisterUserSchema, LoginUserSchema, UpdateSettingsSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/register', validate(RegisterUserSchema), register);
router.post('/login', validate(LoginUserSchema), login);
router.get('/me', authenticateToken, getMe);
router.put('/settings', authenticateToken, validate(UpdateSettingsSchema), updateSettings);

export default router;

