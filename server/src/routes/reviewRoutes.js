import express from "express";


import {
  createReview,
  getTechnicianReviews,
  getReviewByServiceRequest,
  getCustomerCompletedServices,
} from "../controllers/reviewController.js";


const router = express.Router();


// ======================================================
// MODULE 3 - FEATURE 4
// RATING & REVIEW SYSTEM ROUTES
// ======================================================


// ------------------------------------------------------
// Customer completed services
//
// Tracking ID manually deya lagbe na.
//
// GET
// /api/reviews/customer/:customerId/completed-services
// ------------------------------------------------------

router.get(
  "/customer/:customerId/completed-services",
  getCustomerCompletedServices
);


// Customer submits review
// POST /api/reviews
router.post(
  "/",
  createReview
);


// Get technician reviews
// GET /api/reviews/technician/:technicianId
router.get(
  "/technician/:technicianId",
  getTechnicianReviews
);


// Get review by service request
// GET /api/reviews/request/:serviceRequestId
router.get(
  "/request/:serviceRequestId",
  getReviewByServiceRequest
);


export default router;