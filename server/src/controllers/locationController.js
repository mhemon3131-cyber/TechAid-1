// ==========================================================
// LOCATION CONTROLLER
//
// Member 4 - Automatic Technician Assignment
//
// Ei controller-er kaj:
//
// 1. Location search suggestion
// 2. Address -> latitude/longitude
// 3. Latitude/longitude -> readable address
// 4. Technician location save/update
// 5. Service Request location save/update
// ==========================================================

import { PrismaClient } from '@prisma/client';

import {
  searchBangladeshLocations,
  geocodeDhakaLocation,
  reverseGeocodeLocation
} from '../services/openStreetMapService.js';


const prisma = new PrismaClient();


// ==========================================================
// HELPER
// FIND SERVICE REQUEST BY:
// - Database ID
// - Tracking ID
//
// Example:
// req-101
// REQ-2026-8942
// ==========================================================

const findServiceRequest = async (value) => {

  if (!value) {
    return null;
  }


  return prisma.serviceRequest.findFirst({

    where: {

      OR: [

        {
          id: value
        },

        {
          trackingId:
            value.toUpperCase()
        }

      ]
    }
  });
};


// ==========================================================
// 1. SEARCH BANGLADESH LOCATION
//
// Endpoint:
//
// GET /api/locations/search?q=Mirpur
//
// Example response:
//
// {
//   success: true,
//   data: [
//     {
//       latitude: 23.xxx,
//       longitude: 90.xxx,
//       displayName: "Mirpur, Dhaka, Bangladesh"
//     }
//   ]
// }
//
// Ei endpoint frontend location search box use korbe.
// ==========================================================

export const searchLocations = async (
  req,
  res
) => {

  try {

    const query =
      req.query.q;


    if (
      !query ||
      !query.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Location search text is required.'
      });
    }


    const locations =
      await searchBangladeshLocations(
        query
      );


    return res.status(200).json({

      success: true,

      data:
        locations
    });


  } catch (error) {

    console.error(
      'Location search error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        'Unable to search locations.'
    });
  }
};


// ==========================================================
// 2. ADDRESS -> COORDINATES
//
// Endpoint:
//
// POST /api/locations/geocode
//
// Body:
//
// {
//   "address": "Dhanmondi 27"
// }
//
// OpenStreetMap Bangladesh search kore best match return kore.
// ==========================================================

export const geocodeLocation = async (
  req,
  res
) => {

  try {

    const {
      address
    } = req.body;


    if (
      !address ||
      !address.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Location address is required.'
      });
    }


    const location =
      await geocodeDhakaLocation(
        address
      );


    return res.status(200).json({

      success: true,

      data:
        location
    });


  } catch (error) {

    console.error(
      'Geocode error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        'Unable to find this location.'
    });
  }
};


// ==========================================================
// 3. COORDINATES -> READABLE ADDRESS
//
// Endpoint:
//
// POST /api/locations/reverse-geocode
//
// Body:
//
// {
//   "latitude": 23.7808,
//   "longitude": 90.4073
// }
//
// Browser GPS location theke readable address ber kore.
// ==========================================================

export const reverseGeocode = async (
  req,
  res
) => {

  try {

    const {
      latitude,
      longitude
    } = req.body;


    if (
      latitude === undefined ||
      longitude === undefined
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Latitude and longitude are required.'
      });
    }


    const location =
      await reverseGeocodeLocation(
        Number(latitude),
        Number(longitude)
      );


    return res.status(200).json({

      success: true,

      data:
        location
    });


  } catch (error) {

    console.error(
      'Reverse geocode error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        'Unable to determine this location.'
    });
  }
};


// ==========================================================
// 4. SAVE TECHNICIAN LOCATION USING ADDRESS
//
// Endpoint:
//
// PUT /api/locations/technicians/:id/address
//
// Technician ID ba User ID duita diyei find korar try kore.
//
// Body:
//
// {
//   "address": "Banani, Dhaka"
// }
//
// Address OpenStreetMap diye geocode kore
// TechnicianLocation table-e save/update kore.
// ==========================================================

export const saveTechnicianLocationByAddress =
  async (
    req,
    res
  ) => {

    try {

      const {
        id
      } = req.params;


      const {
        address
      } = req.body;


      if (
        !address ||
        !address.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Technician location is required.'
        });
      }


      // Technician ID or User ID diye technician find
      const technician =
        await prisma.technician.findFirst({

          where: {

            OR: [

              {
                id
              },

              {
                userId: id
              }

            ]
          }
        });


      if (!technician) {

        return res.status(404).json({

          success: false,

          message:
            'Technician not found.'
        });
      }


      const location =
        await geocodeDhakaLocation(
          address
        );


      // Technician-er latest location overwrite/update
      const savedLocation =
        await prisma.technicianLocation.upsert({

          where: {

            technicianId:
              technician.id
          },

          update: {

            latitude:
              location.latitude,

            longitude:
              location.longitude
          },

          create: {

            technicianId:
              technician.id,

            latitude:
              location.latitude,

            longitude:
              location.longitude
          }
        });


      return res.status(200).json({

        success: true,

        message:
          'Technician location updated successfully.',

        data: {

          ...savedLocation,

          address:
            location.displayName
        }
      });


    } catch (error) {

      console.error(
        'Technician location save error:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Unable to save technician location.'
      });
    }
  };


// ==========================================================
// 5. SAVE SERVICE REQUEST LOCATION USING ADDRESS
//
// Endpoint:
//
// PUT /api/locations/requests/:id/address
//
// :id hote pare:
// - ServiceRequest database ID
// - Tracking ID
//
// Example:
//
// PUT /api/locations/requests/REQ-2026-8942/address
//
// Body:
//
// {
//   "address": "Mirpur 10, Dhaka"
// }
// ==========================================================

export const saveServiceRequestLocationByAddress =
  async (
    req,
    res
  ) => {

    try {

      const {
        id
      } = req.params;


      const {
        address
      } = req.body;


      if (
        !address ||
        !address.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Service location is required.'
        });
      }


      const serviceRequest =
        await findServiceRequest(
          id
        );


      if (!serviceRequest) {

        return res.status(404).json({

          success: false,

          message:
            'Service request not found.'
        });
      }


      const location =
        await geocodeDhakaLocation(
          address
        );


      const savedLocation =
        await prisma.serviceRequestLocation.upsert({

          where: {

            serviceRequestId:
              serviceRequest.id
          },

          update: {

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            address:
              location.displayName
          },

          create: {

            serviceRequestId:
              serviceRequest.id,

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            address:
              location.displayName
          }
        });


      return res.status(200).json({

        success: true,

        message:
          'Customer service location updated successfully.',

        data:
          savedLocation
      });


    } catch (error) {

      console.error(
        'Service request location save error:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Unable to save service location.'
      });
    }
  };