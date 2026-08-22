import express from 'express';
import {
  getTechnicians,
  getTechnicianAvailability,
  updateTechnicianAvailability
} from '../controllers/technicianController.js';

const router = express.Router();

router.get('/', getTechnicians);
router.get('/availability/:techId', getTechnicianAvailability);
router.put('/availability/:techId', updateTechnicianAvailability);

export default router;
