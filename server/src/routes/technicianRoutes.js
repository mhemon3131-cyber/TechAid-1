import express from 'express';

import {
  getTechnicians,
  searchTechnicians,
  getTechnicianAvailability,
  updateTechnicianAvailability
} from '../controllers/technicianController.js';

const router = express.Router();


// ======================================================
// MODULE 3 - FEATURE 4
// ADVANCED SEARCH & FILTER SYSTEM
// ======================================================

// Advanced technician search and filter
// Example:
// GET /api/technicians/search?deviceCategory=Laptop&location=Gulshan&minRating=4&maxPrice=1000&availability=AVAILABLE
router.get(
  '/search',
  searchTechnicians
);


// ======================================================
// GET ALL TECHNICIANS
// ======================================================

router.get(
  '/',
  getTechnicians
);


// ======================================================
// TECHNICIAN AVAILABILITY MANAGEMENT
// ======================================================

router.get(
  '/availability/:techId',
  getTechnicianAvailability
);

router.put(
  '/availability/:techId',
  updateTechnicianAvailability
);


export default router;