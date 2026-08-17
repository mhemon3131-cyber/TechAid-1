// Technician Controller: Real Prisma Database Operations

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// ======================================================
// ONLY ADDED:
// CLEAN SERVICE AREA VALUES
// ======================================================

const cleanServiceAreas = (value) => {

  const list =
    Array.isArray(value)
      ? value
      : String(value || '')
          .split(',');


  return [
    ...new Set(
      list
        .map(
          (area) =>
            String(area).trim()
        )
        .filter(Boolean)
    )
  ];
};


// ======================================================
// HELPER FUNCTIONS
// ======================================================

// Technician specialty theke rough device category identify korar helper.
// Existing schema-te separate deviceCategory field nai,
// tai specialty text use kore category match kora hocche.
const getDeviceCategoriesFromSpecialty = (specialty = '') => {
  const text = specialty.toLowerCase();

  const categories = [];

  if (
    text.includes('laptop') ||
    text.includes('desktop') ||
    text.includes('computer') ||
    text.includes('pc')
  ) {
    categories.push('Laptop', 'Desktop');
  }

  if (
    text.includes('phone') ||
    text.includes('mobile') ||
    text.includes('smartphone')
  ) {
    categories.push('Phone');
  }

  if (text.includes('printer')) {
    categories.push('Printer');
  }

  if (
    text.includes('internet') ||
    text.includes('network') ||
    text.includes('router') ||
    text.includes('wifi')
  ) {
    categories.push('Internet');
  }

  // Generic technician hole all categories consider kora hocche
  if (categories.length === 0) {
    categories.push(
      'Laptop',
      'Desktop',
      'Phone',
      'Printer',
      'Internet'
    );
  }

  return [...new Set(categories)];
};


// ======================================================
// ESTIMATED PRICE HELPER
// ======================================================

const getEstimatedPrice = (pricing) => {
  if (!pricing) {
    return 0;
  }

  const fees = [
    pricing.liveChatFee,
    pricing.videoCallFee,
    pricing.homeVisitFee
  ]
    .map(Number)
    .filter((value) => Number.isFinite(value));

  if (fees.length === 0) {
    return 0;
  }

  return Math.min(...fees);
};


// ======================================================
// GET ALL TECHNICIANS
// GET /api/technicians
// ======================================================

export const getTechnicians = async (req, res) => {
  try {
    const technicians =
      await prisma.technician.findMany({
        include: {
          user: true
        }
      });


    const pricingRecords =
      await prisma.technicianPricing.findMany();


    const pricingMap =
      new Map(
        pricingRecords.map((item) => [
          item.technicianId,
          item
        ])
      );


    const formatted =
      technicians.map((t) => {

        const pricing =
          pricingMap.get(t.id) || null;


        return {
          id: t.id,

          userId: t.userId,

          name: t.name,

          specialty: t.specialty,

          technicalExpertise:
            t.specialty,

          deviceCategories:
            getDeviceCategoriesFromSpecialty(
              t.specialty
            ),

          rating:
            t.rating,

          distanceKm:
            t.distanceKm,

          isAvailable:
            t.isAvailable,

          avatar:
            t.avatar ||
            t.name
              .slice(0, 2)
              .toUpperCase(),

          availableDays:
            t.availableDays
              ? t.availableDays
                  .split(',')
                  .map((day) => day.trim())
              : [
                  'Mon',
                  'Tue',
                  'Wed',
                  'Thu',
                  'Fri'
                ],

          workingHours:
            t.workingHours,


          // ONLY CHANGED
          serviceAreas:
            cleanServiceAreas(
              t.serviceAreas
            ),


          maxDailyAppointments:
            t.maxDailyAppointments,

          yearsExperience:
            null,

          pricing: pricing
            ? {
                liveChatFee:
                  pricing.liveChatFee,

                videoCallFee:
                  pricing.videoCallFee,

                homeVisitFee:
                  pricing.homeVisitFee
              }
            : null,

          estimatedPrice:
            getEstimatedPrice(
              pricing
            ),

          user: t.user
            ? {
                id: t.user.id,
                name: t.user.name,
                email: t.user.email,
                phone: t.user.phone
              }
            : null
        };
      });


    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });

  } catch (error) {

    console.error(
      'Error fetching technicians from DB:',
      error
    );


    res.status(500).json({
      success: false,
      message:
        'Database error fetching technicians.'
    });
  }
};


// ======================================================
// MODULE 3 - FEATURE 4
// ADVANCED SEARCH & FILTER SYSTEM
//
// GET /api/technicians/search
// ======================================================

export const searchTechnicians = async (req, res) => {
  try {

    const {
      search = '',
      deviceCategory = 'ALL',
      expertise = 'ALL',
      location = 'ALL',
      minRating = 'ALL',
      maxPrice = 'ALL',
      availability = 'ALL'
    } = req.query;


    const technicians =
      await prisma.technician.findMany({
        include: {
          user: true
        }
      });


    const pricingRecords =
      await prisma.technicianPricing.findMany();


    const pricingMap =
      new Map(
        pricingRecords.map((item) => [
          item.technicianId,
          item
        ])
      );


    const formatted =
      technicians.map((t) => {

        const pricing =
          pricingMap.get(t.id) || null;


        return {
          id:
            t.id,

          userId:
            t.userId,

          name:
            t.name,

          specialty:
            t.specialty,

          technicalExpertise:
            t.specialty,

          deviceCategories:
            getDeviceCategoriesFromSpecialty(
              t.specialty
            ),

          rating:
            Number(
              t.rating
            ) || 0,

          distanceKm:
            Number(
              t.distanceKm
            ) || 0,

          isAvailable:
            t.isAvailable,

          avatar:
            t.avatar ||
            t.name
              .slice(0, 2)
              .toUpperCase(),

          availableDays:
            t.availableDays
              ? t.availableDays
                  .split(',')
                  .map(
                    (day) =>
                      day.trim()
                  )
              : [],

          workingHours:
            t.workingHours,


          // ONLY CHANGED
          serviceAreas:
            cleanServiceAreas(
              t.serviceAreas
            ),


          maxDailyAppointments:
            t.maxDailyAppointments,

          yearsExperience:
            null,

          pricing: pricing
            ? {
                liveChatFee:
                  Number(
                    pricing.liveChatFee
                  ),

                videoCallFee:
                  Number(
                    pricing.videoCallFee
                  ),

                homeVisitFee:
                  Number(
                    pricing.homeVisitFee
                  )
              }
            : null,

          estimatedPrice:
            getEstimatedPrice(
              pricing
            ),

          user: t.user
            ? {
                id:
                  t.user.id,

                name:
                  t.user.name,

                email:
                  t.user.email,

                phone:
                  t.user.phone
              }
            : null
        };
      });


    const normalizedSearch =
      String(search)
        .trim()
        .toLowerCase();


    const filtered =
      formatted.filter((tech) => {

        const matchesSearch =
          !normalizedSearch ||
          tech.name
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          tech.specialty
            .toLowerCase()
            .includes(
              normalizedSearch
            );


        const matchesDevice =
          deviceCategory === 'ALL' ||
          tech.deviceCategories.some(
            (category) =>
              category
                .toLowerCase() ===
              String(
                deviceCategory
              ).toLowerCase()
          );


        const matchesExpertise =
          expertise === 'ALL' ||
          tech.specialty
            .toLowerCase()
            .includes(
              String(
                expertise
              ).toLowerCase()
            );


        const matchesLocation =
          location === 'ALL' ||
          tech.serviceAreas.some(
            (area) =>
              area
                .toLowerCase()
                .includes(
                  String(
                    location
                  ).toLowerCase()
                )
          );


        const matchesRating =
          minRating === 'ALL' ||
          tech.rating >=
            Number(
              minRating
            );


        const matchesPrice =
          maxPrice === 'ALL' ||
          (
            tech.estimatedPrice > 0 &&
            tech.estimatedPrice <=
              Number(
                maxPrice
              )
          );


        const matchesAvailability =
          availability === 'ALL' ||

          (
            availability ===
              'AVAILABLE' &&
            tech.isAvailable ===
              true
          ) ||

          (
            availability ===
              'UNAVAILABLE' &&
            tech.isAvailable ===
              false
          );


        return (
          matchesSearch &&
          matchesDevice &&
          matchesExpertise &&
          matchesLocation &&
          matchesRating &&
          matchesPrice &&
          matchesAvailability
        );
      });


    filtered.sort((a, b) => {

      if (
        b.rating !==
        a.rating
      ) {
        return (
          b.rating -
          a.rating
        );
      }


      return (
        a.distanceKm -
        b.distanceKm
      );
    });


    return res.status(200).json({
      success:
        true,

      count:
        filtered.length,

      filters: {
        search,
        deviceCategory,
        expertise,
        location,
        minRating,
        maxPrice,
        availability
      },

      data:
        filtered
    });


  } catch (error) {

    console.error(
      'Advanced technician search error:',
      error
    );


    return res.status(500).json({
      success:
        false,

      message:
        'Unable to search technicians from database.'
    });
  }
};


// ======================================================
// GET SINGLE TECHNICIAN AVAILABILITY CONFIGURATION
// GET /api/technicians/availability/:techId
// ======================================================

export const getTechnicianAvailability =
  async (req, res) => {

    try {

      const {
        techId
      } = req.params;


      let tech =
        await prisma.technician.findFirst({
          where: {
            OR: [
              {
                id:
                  techId
              },

              {
                userId:
                  techId
              }
            ]
          }
        });


      if (!tech) {

        tech =
          await prisma.technician.findFirst();

      }


      if (!tech) {

        return res.status(404).json({
          success:
            false,

          message:
            'Technician not found in database.'
        });
      }


      res.json({
        success:
          true,

        data: {
          id:
            tech.id,

          name:
            tech.name,

          specialty:
            tech.specialty,

          availableDays:
            tech.availableDays
              ? tech.availableDays
                  .split(',')
              : [
                  'Mon',
                  'Tue',
                  'Wed',
                  'Thu',
                  'Fri'
                ],

          workingHours:
            tech.workingHours,


          // ONLY CHANGED
          serviceAreas:
            cleanServiceAreas(
              tech.serviceAreas
            ),


          maxDailyAppointments:
            tech.maxDailyAppointments,

          isAvailable:
            tech.isAvailable
        }
      });

    } catch (error) {

      console.error(
        'Get technician availability error:',
        error
      );


      res.status(500).json({
        success:
          false,

        message:
          'Database query error.'
      });
    }
  };


// ======================================================
// UPDATE TECHNICIAN WORKING SCHEDULE
// PUT /api/technicians/availability/:techId
// ======================================================

export const updateTechnicianAvailability =
  async (req, res) => {

    try {

      const {
        techId
      } = req.params;


      const {
        availableDays,
        workingHours,
        serviceAreas,
        maxDailyAppointments,
        isAvailable
      } = req.body;


      let tech =
        await prisma.technician.findFirst({
          where: {
            OR: [
              {
                id:
                  techId
              },

              {
                userId:
                  techId
              }
            ]
          }
        });


      if (!tech) {

        tech =
          await prisma.technician.findFirst();

      }


      if (!tech) {

        return res.status(404).json({
          success:
            false,

          message:
            'Technician record not found.'
        });
      }


      const updatePayload = {};


      if (availableDays) {

        updatePayload.availableDays =
          Array.isArray(
            availableDays
          )
            ? availableDays.join(',')
            : availableDays;
      }


      if (workingHours) {

        updatePayload.workingHours =
          workingHours;
      }


      // ==================================================
      // ONLY CHANGED:
      //
      // LAST UPDATE EXACTLY REPLACES OLD SERVICE AREAS.
      // Duplicate remove.
      // Old list append hobe na.
      // ==================================================

      if (
        serviceAreas !==
        undefined
      ) {

        const latestServiceAreas =
          cleanServiceAreas(
            serviceAreas
          );


        updatePayload.serviceAreas =
          latestServiceAreas.join(',');
      }


      if (
        maxDailyAppointments !==
        undefined
      ) {

        updatePayload.maxDailyAppointments =
          parseInt(
            maxDailyAppointments,
            10
          );
      }


      if (
        isAvailable !==
        undefined
      ) {

        updatePayload.isAvailable =
          isAvailable;
      }


      const updated =
        await prisma.technician.update({
          where: {
            id:
              tech.id
          },

          data:
            updatePayload
        });


      res.json({
        success:
          true,

        message:
          'Technician availability schedule updated successfully in database.',

        data: {
          ...updated,

          availableDays:
            updated.availableDays.split(
              ','
            ),


          // ONLY CHANGED
          serviceAreas:
            cleanServiceAreas(
              updated.serviceAreas
            )
        }
      });


    } catch (error) {

      console.error(
        'Error updating technician availability in DB:',
        error
      );


      res.status(500).json({
        success:
          false,

        message:
          'Database update error.'
      });
    }
  };