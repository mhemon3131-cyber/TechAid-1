import express from 'express';

import {
  searchLocations,
  geocodeLocation,
  reverseGeocode,
  saveTechnicianLocationByAddress,
  saveServiceRequestLocationByAddress
} from '../controllers/locationController.js';


const router = express.Router();


// ==========================================================
// SEARCH ANY BANGLADESH LOCATION
//
// Examples:
//
// GET /api/locations/search?q=Dhanmondi
// GET /api/locations/search?q=Mirpur 10
// GET /api/locations/search?q=Uttara
// GET /api/locations/search?q=Chattogram
//
// OpenStreetMap Bangladesh search result return korbe.
// ==========================================================

router.get(
  '/search',
  searchLocations
);


// ==========================================================
// ADDRESS -> LATITUDE / LONGITUDE
// ==========================================================

router.post(
  '/geocode',
  geocodeLocation
);


// ==========================================================
// LATITUDE / LONGITUDE -> READABLE ADDRESS
// ==========================================================

router.post(
  '/reverse-geocode',
  reverseGeocode
);


// ==========================================================
// SAVE TECHNICIAN LOCATION BY ADDRESS
// ==========================================================

router.put(
  '/technicians/:id/address',
  saveTechnicianLocationByAddress
);


// ==========================================================
// SAVE SERVICE REQUEST LOCATION BY ADDRESS
// ==========================================================

router.put(
  '/requests/:id/address',
  saveServiceRequestLocationByAddress
);


export default router;