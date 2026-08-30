import express from 'express';

import {
  assignBestTechnician,
  getLatestAssignment,
  acceptAssignedTechnician,
  reassignTechnician,
  getTechnicianAcceptedJobs
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


// ==========================================================
// MODULE 1 FEATURE 4
// CUSTOMER-CONFIRMED JOBS FOR TECHNICIAN DASHBOARD
// ==========================================================

router.get(
  '/technicians/:technicianId/jobs',
  getTechnicianAcceptedJobs
);


export default router;