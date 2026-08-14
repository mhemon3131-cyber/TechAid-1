import express from 'express';

import {
  createServiceRequest,
  getAllServiceRequests,
  getRequestByTrackingId,
  getServiceProgress,
  updateServiceStatus,

  getLatestCustomerServiceRequest,
  getRequestForTechnicianView
} from '../controllers/requestController.js';


const router = express.Router();


// ==========================================================
// EXISTING GROUP ROUTES
// ==========================================================

router.post(
  '/',
  createServiceRequest
);

router.get(
  '/',
  getAllServiceRequests
);





// ----------------------------------------------------------
// Customer-er latest request
//
// Example:
// GET /api/requests/customer/usr-1/latest
// ----------------------------------------------------------

router.get(
  '/customer/:customerId/latest',
  getLatestCustomerServiceRequest
);


// ----------------------------------------------------------
// Technician-er jonno customer/request full details
//
// Example:
// GET /api/requests/req-101/technician-view
// ----------------------------------------------------------

router.get(
  '/:requestId/technician-view',
  getRequestForTechnicianView
);


// ==========================================================
// EXISTING GROUP ROUTES
// ==========================================================

router.get(
  '/:trackingId/progress',
  getServiceProgress
);

router.put(
  '/:id/status',
  updateServiceStatus
);


// Ei generic dynamic route-ta last-er dike rakha safer.
router.get(
  '/:trackingId',
  getRequestByTrackingId
);


export default router;