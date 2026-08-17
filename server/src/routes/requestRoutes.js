import express from 'express';

import {
  createServiceRequest,
  getAllServiceRequests,
  getRequestByTrackingId,
  getServiceProgress,
  updateServiceStatus,
  getLatestCustomerServiceRequest,
  getRequestForTechnicianView,
  getEmergencyQueue
} from '../controllers/requestController.js';


const router =
  express.Router();


// ==========================================================
// CREATE SERVICE REQUEST
// POST /api/requests
// ==========================================================

router.post(
  '/',
  createServiceRequest
);


// ==========================================================
// GET ALL SERVICE REQUESTS
// GET /api/requests
// ==========================================================

router.get(
  '/',
  getAllServiceRequests
);


// ==========================================================
// EMERGENCY SUPPORT QUEUE
//
// GET /api/requests/emergency/queue
//
// IMPORTANT:
// Generic /:trackingId route-er age thakte hobe.
// ==========================================================

router.get(
  '/emergency/queue',
  getEmergencyQueue
);


// ==========================================================
// LATEST CUSTOMER REQUEST
//
// Example:
// GET /api/requests/customer/usr-1/latest
//
// IMPORTANT:
// Generic /:trackingId route-er age thakte hobe.
// ==========================================================

router.get(
  '/customer/:customerId/latest',
  getLatestCustomerServiceRequest
);


// ==========================================================
// TECHNICIAN FULL REQUEST VIEW
//
// Example:
// GET /api/requests/REQ-2026-1234/technician-view
//
// Supports request DB ID / tracking ID from controller.
// ==========================================================

router.get(
  '/:requestId/technician-view',
  getRequestForTechnicianView
);


// ==========================================================
// SERVICE PROGRESS
//
// GET /api/requests/REQ-2026-1234/progress
// ==========================================================

router.get(
  '/:trackingId/progress',
  getServiceProgress
);


// ==========================================================
// UPDATE SERVICE STATUS
//
// PUT /api/requests/REQ-2026-1234/status
// or
// PUT /api/requests/<database-id>/status
// ==========================================================

router.put(
  '/:id/status',
  updateServiceStatus
);


// ==========================================================
// GET SINGLE REQUEST
//
// KEEP THIS GENERIC ROUTE LAST.
//
// GET /api/requests/REQ-2026-1234
// ==========================================================

router.get(
  '/:trackingId',
  getRequestByTrackingId
);


export default router;