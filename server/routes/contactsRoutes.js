import express from 'express';
import {
  listContacts,
  createContact,
  enrollVoice,
  getChallenges,
  createChallenge,
  deleteContact
} from '../controllers/contactsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { CreateContactSchema, EnrollVoiceSchema, CreateChallengeSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listContacts);
router.post('/', validate(CreateContactSchema), createContact);
router.post('/:id/enroll-voice', validate(EnrollVoiceSchema), enrollVoice);
router.get('/:id/challenges', getChallenges);
router.post('/:id/challenges', validate(CreateChallengeSchema), createChallenge);
router.delete('/:id', deleteContact);

export default router;

