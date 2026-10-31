import express from 'express';
import {
  startSession,
  streamChunk,
  triggerChallenge,
  alertGuardian,
  terminateCall,
  finalizeCall
} from '../controllers/callController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  StartCallSessionSchema,
  StreamChunkSchema,
  AlertGuardianSchema,
  TerminateCallSchema
} from '../validators/schemas.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/session/start', validate(StartCallSessionSchema), startSession);
router.post('/session/:id/stream-chunk', validate(StreamChunkSchema), streamChunk);
router.post('/session/:id/trigger-challenge', triggerChallenge);
router.post('/session/:id/alert-guardian', validate(AlertGuardianSchema), alertGuardian);
router.post('/session/:id/terminate', validate(TerminateCallSchema), terminateCall);
router.post('/session/:id/finalize', finalizeCall);

export default router;

