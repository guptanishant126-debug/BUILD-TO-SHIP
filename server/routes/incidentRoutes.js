import express from 'express';
import {
  listIncidents,
  getIncidentDetail,
  exportIncidentJson
} from '../controllers/incidentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listIncidents);
router.get('/:id', getIncidentDetail);
router.get('/:id/export', exportIncidentJson);

export default router;

