import express from 'express';

import {
  assignBestTechnician,
  getLatestAssignment,
  acceptAssignedTechnician,
  reassignTechnician
} from '../controllers/technicianAssignmentController.js';

const router = express.Router();


// Automatic best technician
router.post(
  '/requests/:serviceRequestId/assign',
  assignBestTechnician
);


// Latest assignment
router.get(
  '/requests/:serviceRequestId/latest',
  getLatestAssignment
);


// Customer accepts technician
router.put(
  '/requests/:serviceRequestId/accept',
  acceptAssignedTechnician
);


// Customer rejects current technician and gets next best
router.put(
  '/requests/:serviceRequestId/reassign',
  reassignTechnician
);


export default router;