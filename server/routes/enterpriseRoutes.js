import express from 'express';
import { getScenarios, getTelemetry, testWebhook } from '../controllers/enterpriseController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { WebhookTestSchema } from '../validators/schemas.js';

const router = express.Router();

// Scenarios are public/available for sandbox testing
router.get('/scenarios', getScenarios);

// Enterprise Telemetry and Webhook testing require auth
router.get('/telemetry', authenticateToken, getTelemetry);
router.post('/webhook-test', authenticateToken, validate(WebhookTestSchema), testWebhook);

export default router;

