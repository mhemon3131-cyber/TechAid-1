import express from 'express';

import {
  saveTechnicianLocation,
  saveServiceRequestLocation,
  assignBestTechnician,
  acceptAssignedTechnician,
  requestTechnicianReassignment,
  getLatestAssignment,
  getTechnicianAcceptedJobs
} from '../controllers/technicianAssignmentController.js';


const router =
  express.Router();


// ==========================================================
// LOCATION
// ==========================================================

// Technician current location
router.put(
  '/technicians/:technicianId/location',
  saveTechnicianLocation
);


// Customer service request location
router.put(
  '/requests/:serviceRequestId/location',
  saveServiceRequestLocation
);


// ==========================================================
// AUTOMATIC ASSIGNMENT
// ==========================================================

// Automatic best technician
router.post(
  '/requests/:serviceRequestId/assign',
  assignBestTechnician
);


// Latest suggested/accepted technician
router.get(
  '/requests/:serviceRequestId/latest',
  getLatestAssignment
);


// Customer accept
router.put(
  '/requests/:serviceRequestId/accept',
  acceptAssignedTechnician
);


// Customer reject
router.put(
  '/requests/:serviceRequestId/reassign',
  requestTechnicianReassignment
);


// ==========================================================
// TECHNICIAN JOB REQUESTS
//
// Customer accepted automatic assignments only.
// ==========================================================

router.get(
  '/technicians/:technicianId/jobs',
  getTechnicianAcceptedJobs
);


export default router;