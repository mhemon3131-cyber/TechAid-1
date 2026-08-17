import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


// ==========================================================
// CLEAN SERVICE AREAS
// ==========================================================

const cleanServiceAreas = (value) => {
  return [
    ...new Set(
      String(value || '')
        .split(',')
        .map((area) =>
          area.trim()
        )
        .filter(Boolean)
    )
  ];
};


// ==========================================================
// MODULE 1 - FEATURE 4
// AUTOMATIC TECHNICIAN ASSIGNMENT ENGINE
//
// LOCATION THAKLE:
// Expertise + Availability + Proximity + Rating + Workload
//
// LOCATION NA THAKLE:
// Expertise + Availability + Rating + Workload
//
// No-location priority:
// 1. Expertise match mandatory
// 2. Technician available mandatory
// 3. Highest rating first
// 4. Better availability
// 5. Lower workload
//
// Reject korle previous technician exclude hoye
// next best technician suggest hobe.
// ==========================================================


// ==========================================================
// MATCHING WEIGHTS
// ==========================================================

const WEIGHTS = {
  expertise: 0.35,
  availability: 0.25,
  proximity: 0.20,
  rating: 0.10,
  workload: 0.10
};


// ==========================================================
// ACTIVE APPOINTMENT STATUSES
// ==========================================================

const ACTIVE_APPOINTMENT_STATUSES = [
  'PENDING',
  'APPROVED',
  'RESCHEDULED'
];


// ==========================================================
// AUTOMATIC SERVICE TIME SLOTS
// ==========================================================

const TIME_SLOTS = [
  '10:00 am',
  '11:30 am',
  '1:00 pm',
  '02:30 pm',
  '04:00 pm',
  '06:30 pm'
];


// ==========================================================
// FIND SERVICE REQUEST
//
// Supports:
// DB id
// Tracking id
// ==========================================================

const findServiceRequest = async (value) => {

  if (!value) {
    return null;
  }


  return prisma.serviceRequest.findFirst({

    where: {

      OR: [

        {
          id:
            value
        },

        {
          trackingId:
            String(value).toUpperCase()
        }
      ]
    },

    include: {

      customer:
        true,

      appointment:
        true
    }
  });
};


// ==========================================================
// DATE FORMAT
// ==========================================================

const formatAppointmentDate = (date) => {

  const weekday =
    date.toLocaleDateString(
      'en-US',
      {
        weekday:
          'short'
      }
    );


  const month =
    date.toLocaleDateString(
      'en-US',
      {
        month:
          'short'
      }
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );


  const year =
    date.getFullYear();


  return `${weekday} ${month} ${day}, ${year}`;
};


// ==========================================================
// DAY NAME
// ==========================================================

const getDayName = (date) => {

  return date.toLocaleDateString(
    'en-US',
    {
      weekday:
        'short'
    }
  );
};


// ==========================================================
// TECHNICIAN AVAILABLE DAY
// ==========================================================

const isTechnicianAvailableOnDay = (
  technician,
  date
) => {

  const availableDays =
    technician.availableDays
      ?.split(',')
      .map(
        (day) =>
          day.trim()
      )
      .filter(Boolean) ||
    [];


  if (
    availableDays.length === 0
  ) {
    return true;
  }


  const dayName =
    getDayName(
      date
    );


  return availableDays.includes(
    dayName
  );
};


// ==========================================================
// NORMAL APPOINTMENT TIME CONFLICT
// ==========================================================

const hasTimeConflict = (
  appointments = [],
  requestedDate,
  requestedTimeSlot
) => {

  return appointments.some(
    (appointment) =>

      appointment.date ===
        requestedDate &&

      appointment.timeSlot ===
        requestedTimeSlot &&

      ACTIVE_APPOINTMENT_STATUSES.includes(
        appointment.status
      )
  );
};


// ==========================================================
// DAILY ACTIVE APPOINTMENTS
// ==========================================================

const getDailyActiveAppointments = (
  appointments = [],
  date
) => {

  return appointments.filter(
    (appointment) =>

      appointment.date ===
        date &&

      ACTIVE_APPOINTMENT_STATUSES.includes(
        appointment.status
      )
  );
};


// ==========================================================
// TIME SLOT TO MINUTES
// ==========================================================

const timeSlotToMinutes = (slot) => {

  const clean =
    String(
      slot
    )
      .trim()
      .toLowerCase();


  const match =
    clean.match(
      /^(\d{1,2}):(\d{2})\s*(am|pm)$/
    );


  if (!match) {
    return 0;
  }


  let hour =
    Number(
      match[1]
    );


  const minute =
    Number(
      match[2]
    );


  const meridian =
    match[3];


  if (
    meridian === 'pm' &&
    hour !== 12
  ) {

    hour += 12;
  }


  if (
    meridian === 'am' &&
    hour === 12
  ) {

    hour = 0;
  }


  return (
    hour * 60 +
    minute
  );
};


// ==========================================================
// AUTO ASSIGNMENT RESERVED SLOT CHECK
// ==========================================================

const hasAssignmentSlotConflict = async (
  technicianId,
  date,
  timeSlot,
  excludeServiceRequestId = null
) => {

  const reservedAssignment =
    await prisma.technicianAssignment.findFirst({

      where: {

        technicianId,

        assignedDate:
          date,

        assignedTimeSlot:
          timeSlot,

        status: {
          in: [
            'PENDING_CUSTOMER_APPROVAL',
            'ACCEPTED'
          ]
        },

        ...(excludeServiceRequestId
          ? {
              serviceRequestId: {
                not:
                  excludeServiceRequestId
              }
            }
          : {})
      }
    });


  return Boolean(
    reservedAssignment
  );
};


// ==========================================================
// FIND NEXT FREE SLOT
// ==========================================================

const findNextFreeSlot = async (
  technician,
  serviceRequestId = null
) => {

  const now =
    new Date();


  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();


  for (
    let dayOffset = 0;
    dayOffset < 7;
    dayOffset++
  ) {

    const candidateDate =
      new Date();


    candidateDate.setHours(
      0,
      0,
      0,
      0
    );


    candidateDate.setDate(
      candidateDate.getDate() +
      dayOffset
    );


    if (
      !isTechnicianAvailableOnDay(
        technician,
        candidateDate
      )
    ) {

      continue;
    }


    const formattedDate =
      formatAppointmentDate(
        candidateDate
      );


    const dailyAppointments =
      getDailyActiveAppointments(
        technician.appointments || [],
        formattedDate
      );


    const dailyReservedAssignments =
      await prisma.technicianAssignment.count({

        where: {

          technicianId:
            technician.id,

          assignedDate:
            formattedDate,

          status: {
            in: [
              'PENDING_CUSTOMER_APPROVAL',
              'ACCEPTED'
            ]
          },

          ...(serviceRequestId
            ? {
                serviceRequestId: {
                  not:
                    serviceRequestId
                }
              }
            : {})
        }
      });


    const maxDailyAppointments =
      Number(
        technician.maxDailyAppointments
      ) ||
      5;


    const totalDailyWorkload =
      dailyAppointments.length +
      dailyReservedAssignments;


    if (
      totalDailyWorkload >=
      maxDailyAppointments
    ) {

      continue;
    }


    for (
      const timeSlot
      of TIME_SLOTS
    ) {

      if (
        dayOffset === 0 &&
        timeSlotToMinutes(
          timeSlot
        ) <= currentMinutes
      ) {

        continue;
      }


      const appointmentConflict =
        hasTimeConflict(
          technician.appointments || [],
          formattedDate,
          timeSlot
        );


      if (
        appointmentConflict
      ) {

        continue;
      }


      const assignmentConflict =
        await hasAssignmentSlotConflict(
          technician.id,
          formattedDate,
          timeSlot,
          serviceRequestId
        );


      if (
        assignmentConflict
      ) {

        continue;
      }


      return {

        date:
          formattedDate,

        timeSlot,

        dayOffset,

        dailyWorkload:
          totalDailyWorkload,

        remainingCapacity:
          Math.max(
            0,

            maxDailyAppointments -
              totalDailyWorkload -
              1
          )
      };
    }
  }


  return null;
};


// ==========================================================
// DISTANCE HELPERS
// ==========================================================

const toRadians = (degree) => {

  return (
    degree *
    (Math.PI / 180)
  );
};


const calculateDistanceKm = (
  lat1,
  lon1,
  lat2,
  lon2
) => {

  const earthRadiusKm =
    6371;


  const dLat =
    toRadians(
      Number(lat2) -
        Number(lat1)
    );


  const dLon =
    toRadians(
      Number(lon2) -
        Number(lon1)
    );


  const a =
    Math.sin(
      dLat / 2
    ) ** 2 +

    Math.cos(
      toRadians(
        Number(lat1)
      )
    ) *

    Math.cos(
      toRadians(
        Number(lat2)
      )
    ) *

    Math.sin(
      dLon / 2
    ) ** 2;


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return Number(
    (
      earthRadiusKm *
      c
    ).toFixed(2)
  );
};


// ==========================================================
// EXPERTISE SCORE
// ==========================================================

const calculateExpertiseScore = (
  deviceCategory,
  specialty
) => {

  if (
    !deviceCategory ||
    !specialty
  ) {

    return 0;
  }


  const category =
    deviceCategory
      .toLowerCase()
      .trim();


  const techSpecialty =
    specialty
      .toLowerCase()
      .trim();


  if (
    techSpecialty.includes(
      category
    )
  ) {

    return 100;
  }


  const expertiseMap = {

    laptop: [
      'laptop',
      'computer',
      'desktop',
      'hardware'
    ],

    desktop: [
      'desktop',
      'computer',
      'pc',
      'hardware'
    ],

    phone: [
      'phone',
      'mobile',
      'smartphone',
      'android',
      'ios'
    ],

    smartphone: [
      'phone',
      'mobile',
      'smartphone',
      'android',
      'ios'
    ],

    printer: [
      'printer',
      'printing',
      'hardware'
    ],

    internet: [
      'internet',
      'network',
      'wifi',
      'router',
      'networking'
    ],

    network: [
      'internet',
      'network',
      'wifi',
      'router',
      'networking'
    ]
  };


  const relatedSkills =
    expertiseMap[
      category
    ] ||
    [];


  const matched =
    relatedSkills.some(
      (skill) =>
        techSpecialty.includes(
          skill
        )
    );


  return matched
    ? 80
    : 0;
};


// ==========================================================
// PROXIMITY SCORE
// ==========================================================

const calculateProximityScore = (
  distanceKm
) => {

  if (
    distanceKm <= 2
  ) {
    return 100;
  }


  if (
    distanceKm <= 5
  ) {
    return 90;
  }


  if (
    distanceKm <= 10
  ) {
    return 75;
  }


  if (
    distanceKm <= 15
  ) {
    return 60;
  }


  if (
    distanceKm <= 20
  ) {
    return 40;
  }


  return 20;
};


// ==========================================================
// RATING SCORE
// ==========================================================

const calculateRatingScore = (
  rating
) => {

  const safeRating =
    Math.max(
      0,

      Math.min(
        Number(
          rating
        ) ||
          0,

        5
      )
    );


  return Number(
    (
      (
        safeRating /
        5
      ) *
      100
    ).toFixed(2)
  );
};


// ==========================================================
// WORKLOAD SCORE
// ==========================================================

const calculateWorkloadScore = (
  activeJobs,
  maxDailyAppointments
) => {

  const maxJobs =
    Number(
      maxDailyAppointments
    ) ||
    5;


  const jobs =
    Number(
      activeJobs
    ) ||
    0;


  if (
    jobs >= maxJobs
  ) {

    return 0;
  }


  return Number(
    (
      (
        (
          maxJobs -
          jobs
        ) /
        maxJobs
      ) *
      100
    ).toFixed(2)
  );
};


// ==========================================================
// AVAILABILITY SCORE
// ==========================================================

const calculateAvailabilityScore = (
  dayOffset
) => {

  return Math.max(
    70,

    100 -
      Number(
        dayOffset
      ) *
        5
  );
};


// ==========================================================
// TOTAL MATCH SCORE
// ==========================================================

const calculateTotalScore = ({
  expertiseScore,
  availabilityScore,
  proximityScore,
  ratingScore,
  workloadScore
}) => {

  const total =

    expertiseScore *
      WEIGHTS.expertise +

    availabilityScore *
      WEIGHTS.availability +

    proximityScore *
      WEIGHTS.proximity +

    ratingScore *
      WEIGHTS.rating +

    workloadScore *
      WEIGHTS.workload;


  return Number(
    total.toFixed(2)
  );
};


// ==========================================================
// TECHNICIAN SERVICE PRICE
// ==========================================================

const getTechnicianCharge = async (
  technicianId,
  serviceMethod
) => {

  const method =
    String(
      serviceMethod ||
      ''
    )
      .toLowerCase()
      .trim();


  if (
    method.includes(
      'video'
    )
  ) {

    return {
      amount:
        100,

      label:
        '৳100',

      type:
        'Video Call'
    };
  }


  if (
    method.includes(
      'home'
    ) ||
    method.includes(
      'visit'
    )
  ) {

    return {
      amount:
        300,

      label:
        '৳300',

      type:
        'Home Visit'
    };
  }


  if (
    method.includes(
      'live'
    ) ||
    method.includes(
      'chat'
    )
  ) {

    return {
      amount:
        50,

      label:
        '৳50',

      type:
        'Live Chat'
    };
  }


  return {

    amount:
      50,

    label:
      '৳50',

    type:
      'Live Chat'
  };
};


// ==========================================================
// GET TECHNICIAN SAVED LOCATION
// ==========================================================

const getTechnicianSavedLocation =
  async (
    technician
  ) => {

    if (
      !technician ||
      !technician.id
    ) {

      return null;
    }


    const location =
      await prisma.technicianLocation.findUnique({

        where: {

          technicianId:
            technician.id
        }
      });


    if (!location) {

      return null;
    }


    if (
      location.latitude === null ||
      location.latitude === undefined ||
      location.longitude === null ||
      location.longitude === undefined
    ) {

      return null;
    }


    return location;
  };


// ==========================================================
// SAVE TECHNICIAN LOCATION
// ==========================================================

export const saveTechnicianLocation =
  async (
    req,
    res
  ) => {

    try {

      const {
        technicianId
      } = req.params;


      const {
        latitude,
        longitude
      } = req.body;


      if (
        latitude === undefined ||
        longitude === undefined
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            'Latitude and longitude are required.'
        });
      }


      const technician =
        await prisma.technician.findFirst({

          where: {

            OR: [

              {
                id:
                  technicianId
              },

              {
                userId:
                  technicianId
              }
            ]
          }
        });


      if (!technician) {

        return res.status(404).json({

          success:
            false,

          message:
            'Technician not found.'
        });
      }


      const location =
        await prisma.technicianLocation.upsert({

          where: {

            technicianId:
              technician.id
          },

          update: {

            latitude:
              Number(
                latitude
              ),

            longitude:
              Number(
                longitude
              )
          },

          create: {

            technicianId:
              technician.id,

            latitude:
              Number(
                latitude
              ),

            longitude:
              Number(
                longitude
              )
          }
        });


      return res.json({

        success:
          true,

        message:
          'Technician location saved successfully.',

        data:
          location
      });

    } catch (error) {

      console.error(
        'Save technician location error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while saving technician location.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// SAVE CUSTOMER REQUEST LOCATION
// ==========================================================

export const saveServiceRequestLocation =
  async (
    req,
    res
  ) => {

    try {

      const {
        serviceRequestId
      } = req.params;


      const {
        latitude,
        longitude,
        address
      } = req.body;


      if (
        latitude === undefined ||
        longitude === undefined
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            'Latitude and longitude are required.'
        });
      }


      const serviceRequest =
        await findServiceRequest(
          serviceRequestId
        );


      if (!serviceRequest) {

        return res.status(404).json({

          success:
            false,

          message:
            'Service request not found.'
        });
      }


      const location =
        await prisma.serviceRequestLocation.upsert({

          where: {

            serviceRequestId:
              serviceRequest.id
          },

          update: {

            latitude:
              Number(
                latitude
              ),

            longitude:
              Number(
                longitude
              ),

            address:
              address ||
              null
          },

          create: {

            serviceRequestId:
              serviceRequest.id,

            latitude:
              Number(
                latitude
              ),

            longitude:
              Number(
                longitude
              ),

            address:
              address ||
              null
          }
        });


      return res.json({

        success:
          true,

        message:
          'Service request location saved successfully.',

        data:
          location
      });

    } catch (error) {

      console.error(
        'Save request location error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while saving request location.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// AUTOMATIC BEST TECHNICIAN
//
// CUSTOMER LOCATION OPTIONAL
// ==========================================================

export const assignBestTechnician =
  async (
    req,
    res
  ) => {

    try {

      const {
        serviceRequestId
      } = req.params;


      const serviceRequest =
        await findServiceRequest(
          serviceRequestId
        );


      if (!serviceRequest) {

        return res.status(404).json({

          success:
            false,

          message:
            'Service request not found.'
        });
      }


      // ====================================================
      // CUSTOMER LOCATION IS OPTIONAL
      // ====================================================

      const customerLocation =
        await prisma.serviceRequestLocation.findUnique({

          where: {

            serviceRequestId:
              serviceRequest.id
          }
        });


      const hasCustomerLocation =
        Boolean(

          customerLocation &&

          customerLocation.latitude !== null &&

          customerLocation.latitude !== undefined &&

          customerLocation.longitude !== null &&

          customerLocation.longitude !== undefined
        );


      // ====================================================
      // PREVIOUS ASSIGNMENTS
      // ====================================================

      const previousAssignments =
        await prisma.technicianAssignment.findMany({

          where: {

            serviceRequestId:
              serviceRequest.id
          },

          orderBy: {

            attempt:
              'asc'
          }
        });


      const acceptedAssignment =
        previousAssignments.find(
          (assignment) =>

            assignment.status ===
            'ACCEPTED'
        );


      if (
        acceptedAssignment
      ) {

        return res.status(409).json({

          success:
            false,

          alreadyAccepted:
            true,

          message:
            'A technician has already been accepted for this request.'
        });
      }


      const pendingAssignment =
        previousAssignments.find(
          (assignment) =>

            assignment.status ===
            'PENDING_CUSTOMER_APPROVAL'
        );


      if (
        pendingAssignment
      ) {

        return res.status(409).json({

          success:
            false,

          pendingAssignment:
            true,

          message:
            'A technician suggestion is already waiting for customer approval.'
        });
      }


      // ====================================================
      // REJECTED / PREVIOUS TECHNICIAN EXCLUDE
      // ====================================================

      const excludedTechnicianIds =
        previousAssignments.map(
          (assignment) =>

            assignment.technicianId
        );


      const nextAttempt =
        previousAssignments.length +
        1;


      // ====================================================
      // AVAILABLE TECHNICIANS
      // ====================================================

      const technicians =
        await prisma.technician.findMany({

          where: {

            isAvailable:
              true,

            id: {

              notIn:
                excludedTechnicianIds
            }
          },

          include: {

            user:
              true,

            appointments:
              true
          }
        });


      if (
        technicians.length === 0
      ) {

        return res.status(404).json({

          success:
            false,

          noMoreAutomaticMatches:
            true,

          message:
            'No more automatic technician matches are available.'
        });
      }


      const candidates =
        [];


      // ====================================================
      // BUILD CANDIDATES
      // ====================================================

      for (
        const technician
        of technicians
      ) {

        // --------------------------------------------------
        // EXPERTISE
        // --------------------------------------------------

        const expertiseScore =
          calculateExpertiseScore(
            serviceRequest.deviceCategory,
            technician.specialty
          );


        if (
          expertiseScore === 0
        ) {

          continue;
        }


        // --------------------------------------------------
        // FREE SCHEDULE
        // --------------------------------------------------

        const freeSlot =
          await findNextFreeSlot(
            technician,
            serviceRequest.id
          );


        if (!freeSlot) {

          continue;
        }


        // --------------------------------------------------
        // AVAILABILITY
        // --------------------------------------------------

        const availabilityScore =
          calculateAvailabilityScore(
            freeSlot.dayOffset
          );


        // --------------------------------------------------
        // RATING
        // --------------------------------------------------

        const ratingScore =
          calculateRatingScore(
            technician.rating
          );


        // --------------------------------------------------
        // WORKLOAD
        // --------------------------------------------------

        const workloadScore =
          calculateWorkloadScore(
            freeSlot.dailyWorkload,
            technician.maxDailyAppointments
          );


        if (
          workloadScore === 0
        ) {

          continue;
        }


        const charge =
          await getTechnicianCharge(
            technician.id,
            serviceRequest.serviceMethod
          );


        // --------------------------------------------------
        // LOCATION
        // --------------------------------------------------

        let technicianLocation =
          null;


        let distanceKm =
          null;


        let proximityScore =
          0;


        // ==================================================
        // CUSTOMER LOCATION THAKLE
        // Existing full weighted match
        // ==================================================

        if (
          hasCustomerLocation
        ) {

          technicianLocation =
            await getTechnicianSavedLocation(
              technician
            );


          // Distance calculate korte technician location
          // thaka lagbe.
          if (
            !technicianLocation
          ) {

            continue;
          }


          distanceKm =
            calculateDistanceKm(
              customerLocation.latitude,
              customerLocation.longitude,
              technicianLocation.latitude,
              technicianLocation.longitude
            );


          proximityScore =
            calculateProximityScore(
              distanceKm
            );
        }


        // ==================================================
        // CUSTOMER LOCATION NA THAKLE
        //
        // Technician location mandatory na.
        // Details-er jonno optional load.
        // ==================================================

        if (
          !hasCustomerLocation
        ) {

          technicianLocation =
            await getTechnicianSavedLocation(
              technician
            );
        }


        // ==================================================
        // SCORE
        // ==================================================

        let totalScore;


        if (
          hasCustomerLocation
        ) {

          totalScore =
            calculateTotalScore({

              expertiseScore,

              availabilityScore,

              proximityScore,

              ratingScore,

              workloadScore
            });

        } else {

          // ------------------------------------------------
          // NO LOCATION
          //
          // Expertise: 35%
          // Availability: 25%
          // Rating: 30%
          // Workload: 10%
          // ------------------------------------------------

          totalScore =
            Number(
              (
                expertiseScore *
                  0.35 +

                availabilityScore *
                  0.25 +

                ratingScore *
                  0.30 +

                workloadScore *
                  0.10
              ).toFixed(
                2
              )
            );
        }


        candidates.push({

          technician,

          technicianLocation,

          freeSlot,

          charge,

          expertiseScore,

          availabilityScore,

          proximityScore,

          ratingScore,

          workloadScore,

          totalScore,

          distanceKm
        });
      }


      // ====================================================
      // NO SUITABLE MATCH
      // ====================================================

      if (
        candidates.length === 0
      ) {

        return res.status(404).json({

          success:
            false,

          noMoreAutomaticMatches:
            true,

          message:
            'No suitable automatic technician match is available. Please search technicians manually.'
        });
      }


      // ====================================================
      // SORT
      // ====================================================

      if (
        hasCustomerLocation
      ) {

        // Existing weighted matching

        candidates.sort(
          (
            a,
            b
          ) => {

            if (
              b.totalScore !==
              a.totalScore
            ) {

              return (
                b.totalScore -
                a.totalScore
              );
            }


            if (
              a.freeSlot.dayOffset !==
              b.freeSlot.dayOffset
            ) {

              return (
                a.freeSlot.dayOffset -
                b.freeSlot.dayOffset
              );
            }


            return (

              Number(
                b.technician.rating
              ) -

              Number(
                a.technician.rating
              )
            );
          }
        );

      } else {

        // ==================================================
        // NO LOCATION
        //
        // Highest rating FIRST.
        // Same rating:
        // availability -> workload -> total
        // ==================================================

        candidates.sort(
          (
            a,
            b
          ) => {

            const ratingA =
              Number(
                a.technician.rating
              ) ||
              0;


            const ratingB =
              Number(
                b.technician.rating
              ) ||
              0;


            if (
              ratingB !==
              ratingA
            ) {

              return (
                ratingB -
                ratingA
              );
            }


            if (
              a.freeSlot.dayOffset !==
              b.freeSlot.dayOffset
            ) {

              return (
                a.freeSlot.dayOffset -
                b.freeSlot.dayOffset
              );
            }


            if (
              a.freeSlot.dailyWorkload !==
              b.freeSlot.dailyWorkload
            ) {

              return (
                a.freeSlot.dailyWorkload -
                b.freeSlot.dailyWorkload
              );
            }


            return (
              b.totalScore -
              a.totalScore
            );
          }
        );
      }


      const bestMatch =
        candidates[0];


      // ====================================================
      // CREATE ASSIGNMENT
      // ====================================================

      const assignment =
        await prisma.technicianAssignment.create({

          data: {

            serviceRequestId:
              serviceRequest.id,

            technicianId:
              bestMatch.technician.id,

            expertiseScore:
              bestMatch.expertiseScore,

            availabilityScore:
              bestMatch.availabilityScore,

            proximityScore:
              bestMatch.proximityScore,

            ratingScore:
              bestMatch.ratingScore,

            workloadScore:
              bestMatch.workloadScore,

            totalScore:
              bestMatch.totalScore,

            distanceKm:
              bestMatch.distanceKm,

            assignedDate:
              bestMatch.freeSlot.date,

            assignedTimeSlot:
              bestMatch.freeSlot.timeSlot,

            attempt:
              nextAttempt,

            status:
              'PENDING_CUSTOMER_APPROVAL'
          }
        });


      // ====================================================
      // RESPONSE
      // ====================================================

      return res.status(201).json({

        success:
          true,

        message:
          hasCustomerLocation

            ? 'Best technician automatically selected using expertise, availability, distance, rating and workload.'

            : 'Best technician automatically selected using expertise, availability, rating and workload.',


        data: {

          matchingMode:
            hasCustomerLocation
              ? 'WITH_LOCATION'
              : 'WITHOUT_LOCATION',


          serviceRequest: {

            id:
              serviceRequest.id,

            trackingId:
              serviceRequest.trackingId,

            customerId:
              serviceRequest.customerId,

            deviceCategory:
              serviceRequest.deviceCategory,

            title:
              serviceRequest.title,

            description:
              serviceRequest.description,

            urgency:
              serviceRequest.urgency,

            serviceMethod:
              serviceRequest.serviceMethod
          },


          assignment,


          autoSchedule: {

            date:
              bestMatch.freeSlot.date,

            timeSlot:
              bestMatch.freeSlot.timeSlot,

            conflictChecked:
              true
          },


          technician: {

            id:
              bestMatch.technician.id,

            userId:
              bestMatch.technician.userId,

            name:
              bestMatch.technician.name,

            email:
              bestMatch.technician.user?.email ||
              null,

            phone:
              bestMatch.technician.user?.phone ||
              null,

            specialty:
              bestMatch.technician.specialty,

            rating:
              bestMatch.technician.rating,

            avatar:
              bestMatch.technician.avatar,

            isAvailable:
              bestMatch.technician.isAvailable,

            availableDays:
              bestMatch.technician.availableDays
                ?.split(',')
                .map(
                  (day) =>
                    day.trim()
                )
                .filter(Boolean) ||
              [],

            workingHours:
              bestMatch.technician.workingHours,

            serviceAreas:
              cleanServiceAreas(
                bestMatch.technician.serviceAreas
              ),

            maxDailyAppointments:
              bestMatch.technician.maxDailyAppointments,

            currentDayWorkload:
              bestMatch.freeSlot.dailyWorkload,

            remainingCapacity:
              bestMatch.freeSlot.remainingCapacity,

            charge:
              bestMatch.charge,

            location:
              bestMatch.technicianLocation
                ? {

                    latitude:
                      bestMatch.technicianLocation.latitude,

                    longitude:
                      bestMatch.technicianLocation.longitude
                  }
                : null
          },


          customerLocation:
            hasCustomerLocation
              ? {

                  latitude:
                    customerLocation.latitude,

                  longitude:
                    customerLocation.longitude,

                  address:
                    customerLocation.address
                }

              : null,


          scoreBreakdown: {

            expertiseScore:
              bestMatch.expertiseScore,

            availabilityScore:
              bestMatch.availabilityScore,

            proximityScore:
              hasCustomerLocation
                ? bestMatch.proximityScore
                : null,

            ratingScore:
              bestMatch.ratingScore,

            workloadScore:
              bestMatch.workloadScore,

            totalScore:
              bestMatch.totalScore,

            distanceKm:
              bestMatch.distanceKm,

            locationUsed:
              hasCustomerLocation
          }
        }
      });


    } catch (error) {

      console.error(
        'Automatic assignment error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while automatically assigning technician.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// REJECT CURRENT TECHNICIAN
// ==========================================================

export const requestTechnicianReassignment =
  async (
    req,
    res
  ) => {

    try {

      const {
        serviceRequestId
      } = req.params;


      const serviceRequest =
        await findServiceRequest(
          serviceRequestId
        );


      if (!serviceRequest) {

        return res.status(404).json({

          success:
            false,

          message:
            'Service request not found.'
        });
      }


      const currentAssignment =
        await prisma.technicianAssignment.findFirst({

          where: {

            serviceRequestId:
              serviceRequest.id,

            status:
              'PENDING_CUSTOMER_APPROVAL'
          },

          orderBy: {

            attempt:
              'desc'
          }
        });


      if (!currentAssignment) {

        return res.status(404).json({

          success:
            false,

          message:
            'No pending technician assignment found.'
        });
      }


      const updated =
        await prisma.technicianAssignment.update({

          where: {

            id:
              currentAssignment.id
          },

          data: {

            status:
              'REASSIGNED'
          }
        });


      return res.json({

        success:
          true,

        message:
          'Technician rejected. The next automatic suggestion will exclude this technician.',

        data:
          updated
      });

    } catch (error) {

      console.error(
        'Reassignment error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error during technician reassignment.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// ACCEPT ASSIGNED TECHNICIAN
// ==========================================================

export const acceptAssignedTechnician =
  async (
    req,
    res
  ) => {

    try {

      const {
        serviceRequestId
      } = req.params;


      const serviceRequest =
        await findServiceRequest(
          serviceRequestId
        );


      if (!serviceRequest) {

        return res.status(404).json({

          success:
            false,

          message:
            'Service request not found.'
        });
      }


      const assignment =
        await prisma.technicianAssignment.findFirst({

          where: {

            serviceRequestId:
              serviceRequest.id,

            status:
              'PENDING_CUSTOMER_APPROVAL'
          },

          orderBy: {

            attempt:
              'desc'
          }
        });


      if (!assignment) {

        const alreadyAccepted =
          await prisma.technicianAssignment.findFirst({

            where: {

              serviceRequestId:
                serviceRequest.id,

              status:
                'ACCEPTED'
            },

            orderBy: {

              attempt:
                'desc'
            }
          });


        if (
          alreadyAccepted
        ) {

          return res.json({

            success:
              true,

            message:
              'Service is already confirmed.',

            data: {

              assignment:
                alreadyAccepted
            }
          });
        }


        return res.status(404).json({

          success:
            false,

          message:
            'No pending technician assignment found.'
        });
      }


      if (
        !assignment.assignedDate ||
        !assignment.assignedTimeSlot
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            'Automatic service date and time are missing.'
        });
      }


      const assignmentConflict =
        await hasAssignmentSlotConflict(
          assignment.technicianId,
          assignment.assignedDate,
          assignment.assignedTimeSlot,
          serviceRequest.id
        );


      if (
        assignmentConflict
      ) {

        return res.status(409).json({

          success:
            false,

          slotConflict:
            true,

          message:
            'This service time is no longer available. Please reject this technician and get another suggestion.'
        });
      }


      const technician =
        await prisma.technician.findUnique({

          where: {

            id:
              assignment.technicianId
          },

          include: {

            user:
              true,

            appointments:
              true
          }
        });


      if (!technician) {

        return res.status(404).json({

          success:
            false,

          message:
            'Assigned technician not found.'
        });
      }


      const normalAppointmentConflict =
        hasTimeConflict(
          technician.appointments || [],
          assignment.assignedDate,
          assignment.assignedTimeSlot
        );


      if (
        normalAppointmentConflict
      ) {

        return res.status(409).json({

          success:
            false,

          slotConflict:
            true,

          message:
            'This technician already has another service at this date and time. Please request another technician.'
        });
      }


      const updatedAssignment =
        await prisma.technicianAssignment.update({

          where: {

            id:
              assignment.id
          },

          data: {

            status:
              'ACCEPTED'
          }
        });


      const charge =
        await getTechnicianCharge(
          technician.id,
          serviceRequest.serviceMethod
        );


      const technicianLocation =
        await prisma.technicianLocation.findUnique({

          where: {

            technicianId:
              technician.id
          }
        });


      const customerLocation =
        await prisma.serviceRequestLocation.findUnique({

          where: {

            serviceRequestId:
              serviceRequest.id
          }
        });


      return res.json({

        success:
          true,

        message:
          'Service confirmed successfully.',

        data: {

          serviceConfirmed:
            true,


          assignment:
            updatedAssignment,


          technician: {

            id:
              technician.id,

            userId:
              technician.userId,

            name:
              technician.name,

            specialty:
              technician.specialty,

            rating:
              technician.rating,

            phone:
              technician.user?.phone ||
              null,

            email:
              technician.user?.email ||
              null,

            charge,

            location:
              technicianLocation
                ? {

                    latitude:
                      technicianLocation.latitude,

                    longitude:
                      technicianLocation.longitude
                  }

                : null
          },


          schedule: {

            date:
              updatedAssignment.assignedDate,

            time:
              updatedAssignment.assignedTimeSlot,

            timeSlot:
              updatedAssignment.assignedTimeSlot
          },


          distance: {

            km:
              updatedAssignment.distanceKm
          },


          customerLocation:
            customerLocation
              ? {

                  latitude:
                    customerLocation.latitude,

                  longitude:
                    customerLocation.longitude,

                  address:
                    customerLocation.address
                }

              : null
        }
      });


    } catch (error) {

      console.error(
        'Accept technician error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while accepting technician.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET LATEST ASSIGNMENT
// ==========================================================

export const getLatestAssignment =
  async (
    req,
    res
  ) => {

    try {

      const {
        serviceRequestId
      } = req.params;


      const serviceRequest =
        await findServiceRequest(
          serviceRequestId
        );


      if (!serviceRequest) {

        return res.status(404).json({

          success:
            false,

          message:
            'Service request not found.'
        });
      }


      const assignment =
        await prisma.technicianAssignment.findFirst({

          where: {

            serviceRequestId:
              serviceRequest.id
          },

          orderBy: {

            attempt:
              'desc'
          }
        });


      if (!assignment) {

        return res.status(404).json({

          success:
            false,

          message:
            'No technician assignment found.'
        });
      }


      const technician =
        await prisma.technician.findUnique({

          where: {

            id:
              assignment.technicianId
          },

          include: {

            user:
              true,

            appointments:
              true
          }
        });


      const technicianLocation =
        await prisma.technicianLocation.findUnique({

          where: {

            technicianId:
              assignment.technicianId
          }
        });


      const customerLocation =
        await prisma.serviceRequestLocation.findUnique({

          where: {

            serviceRequestId:
              serviceRequest.id
          }
        });


      const charge =
        await getTechnicianCharge(
          assignment.technicianId,
          serviceRequest.serviceMethod
        );


      const dailyAppointments =
        technician &&
        assignment.assignedDate

          ? getDailyActiveAppointments(
              technician.appointments ||
                [],

              assignment.assignedDate
            )

          : [];


      const reservedCount =
        assignment.assignedDate

          ? await prisma.technicianAssignment.count({

              where: {

                technicianId:
                  assignment.technicianId,

                assignedDate:
                  assignment.assignedDate,

                status: {

                  in: [
                    'PENDING_CUSTOMER_APPROVAL',
                    'ACCEPTED'
                  ]
                }
              }
            })

          : 0;


      const totalWorkload =
        dailyAppointments.length +
        reservedCount;


      return res.json({

        success:
          true,

        data: {

          serviceConfirmed:
            assignment.status ===
            'ACCEPTED',


          serviceRequest: {

            id:
              serviceRequest.id,

            trackingId:
              serviceRequest.trackingId,

            customerId:
              serviceRequest.customerId,

            deviceCategory:
              serviceRequest.deviceCategory,

            title:
              serviceRequest.title,

            description:
              serviceRequest.description,

            urgency:
              serviceRequest.urgency,

            serviceMethod:
              serviceRequest.serviceMethod
          },


          assignment,


          autoSchedule: {

            date:
              assignment.assignedDate,

            time:
              assignment.assignedTimeSlot,

            timeSlot:
              assignment.assignedTimeSlot,

            conflictChecked:
              true
          },


          technician:
            technician
              ? {

                  id:
                    technician.id,

                  userId:
                    technician.userId,

                  name:
                    technician.name,

                  email:
                    technician.user?.email ||
                    null,

                  phone:
                    technician.user?.phone ||
                    null,

                  specialty:
                    technician.specialty,

                  rating:
                    technician.rating,

                  avatar:
                    technician.avatar,

                  isAvailable:
                    technician.isAvailable,

                  availableDays:
                    technician.availableDays
                      ?.split(',')
                      .map(
                        (day) =>
                          day.trim()
                      )
                      .filter(Boolean) ||
                    [],

                  workingHours:
                    technician.workingHours,

                  serviceAreas:
                    cleanServiceAreas(
                      technician.serviceAreas
                    ),

                  maxDailyAppointments:
                    technician.maxDailyAppointments,

                  currentDayWorkload:
                    totalWorkload,

                  remainingCapacity:
                    Math.max(
                      0,

                      (
                        Number(
                          technician.maxDailyAppointments
                        ) ||
                        5
                      ) -
                        totalWorkload
                    ),

                  charge,

                  location:
                    technicianLocation
                      ? {

                          latitude:
                            technicianLocation.latitude,

                          longitude:
                            technicianLocation.longitude
                        }

                      : null
                }

              : null,


          technicianLocation:
            technicianLocation
              ? {

                  latitude:
                    technicianLocation.latitude,

                  longitude:
                    technicianLocation.longitude
                }

              : null,


          customerLocation:
            customerLocation
              ? {

                  latitude:
                    customerLocation.latitude,

                  longitude:
                    customerLocation.longitude,

                  address:
                    customerLocation.address
                }

              : null,


          distance: {

            km:
              assignment.distanceKm
          },


          scoreBreakdown: {

            expertiseScore:
              assignment.expertiseScore,

            availabilityScore:
              assignment.availabilityScore,

            proximityScore:
              customerLocation
                ? assignment.proximityScore
                : null,

            ratingScore:
              assignment.ratingScore,

            workloadScore:
              assignment.workloadScore,

            totalScore:
              assignment.totalScore,

            distanceKm:
              assignment.distanceKm,

            locationUsed:
              Boolean(
                customerLocation
              )
          }
        }
      });


    } catch (error) {

      console.error(
        'Get latest assignment error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while fetching technician assignment.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// TECHNICIAN ACCEPTED JOB REQUESTS
// ==========================================================

export const getTechnicianAcceptedJobs =
  async (
    req,
    res
  ) => {

    try {

      const {
        technicianId
      } = req.params;


      const technician =
        await prisma.technician.findFirst({

          where: {

            OR: [

              {
                id:
                  technicianId
              },

              {
                userId:
                  technicianId
              }
            ]
          },

          include: {

            user:
              true
          }
        });


      if (!technician) {

        return res.status(404).json({

          success:
            false,

          message:
            'Technician not found.'
        });
      }


      const assignments =
        await prisma.technicianAssignment.findMany({

          where: {

            technicianId:
              technician.id,

            status:
              'ACCEPTED'
          },

          orderBy: {

            createdAt:
              'desc'
          }
        });


      const jobs =
        [];


      for (
        const assignment
        of assignments
      ) {

        const request =
          await prisma.serviceRequest.findUnique({

            where: {

              id:
                assignment.serviceRequestId
            },

            include: {

              customer:
                true,

              appointment:
                true
            }
          });


        if (!request) {

          continue;
        }


        const customerLocation =
          await prisma.serviceRequestLocation.findUnique({

            where: {

              serviceRequestId:
                request.id
            }
          });


        jobs.push({

          assignmentId:
            assignment.id,


          assignmentStatus:
            assignment.status,


          serviceRequest: {

            id:
              request.id,

            trackingId:
              request.trackingId,

            title:
              request.title,

            description:
              request.description,

            deviceCategory:
              request.deviceCategory,

            urgency:
              request.urgency,

            serviceMethod:
              request.serviceMethod,

            status:
              request.status
          },


          customer: {

            id:
              request.customer?.id ||
              request.customerId,

            name:
              request.customer?.name ||
              'Customer',

            email:
              request.customer?.email ||
              null,

            phone:
              request.customer?.phone ||
              null,

            avatar:
              request.customer?.avatar ||
              null
          },


          schedule: {

            date:
              assignment.assignedDate,

            time:
              assignment.assignedTimeSlot,

            timeSlot:
              assignment.assignedTimeSlot
          },


          distance: {

            km:
              assignment.distanceKm
          },


          location:
            customerLocation
              ? {

                  latitude:
                    customerLocation.latitude,

                  longitude:
                    customerLocation.longitude,

                  address:
                    customerLocation.address
                }

              : null,


          appointment:
            request.appointment
              ? {

                  id:
                    request.appointment.id,

                  status:
                    request.appointment.status,

                  date:
                    request.appointment.date,

                  timeSlot:
                    request.appointment.timeSlot
                }

              : null
        });
      }


      return res.json({

        success:
          true,

        count:
          jobs.length,


        technician: {

          id:
            technician.id,

          userId:
            technician.userId,

          name:
            technician.name,

          specialty:
            technician.specialty,

          email:
            technician.user?.email ||
            null,

          phone:
            technician.user?.phone ||
            null
        },


        data:
          jobs
      });


    } catch (error) {

      console.error(
        'Get technician accepted jobs error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while loading technician job requests.',

        details:
          error.message
      });
    }
  };