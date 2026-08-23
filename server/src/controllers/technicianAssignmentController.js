import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// ==========================================================
// MODULE 1 - FEATURE 4
// AUTOMATIC TECHNICIAN ASSIGNMENT ENGINE
//
// Matching criteria:
// 1. Technical Expertise = 40%
// 2. Availability        = 25%
// 3. Current Workload    = 20%
// 4. Rating              = 15%
//
// LOCATION / DISTANCE IS NOT USED.
// ==========================================================


// ==========================================================
// HELPER: GET SERVICE REQUEST
// ==========================================================

const findServiceRequest = async (requestId) => {
  return prisma.serviceRequest.findFirst({
    where: {
      OR: [
        { id: requestId },
        { trackingId: requestId.toUpperCase() }
      ]
    }
  });
};


// ==========================================================
// HELPER: NORMALIZE TEXT
// ==========================================================

const normalize = (value = '') => {
  return String(value)
    .toLowerCase()
    .trim();
};


// ==========================================================
// HELPER: DEVICE CATEGORY KEYWORDS
// ==========================================================

const getCategoryKeywords = (deviceCategory) => {

  const category =
    normalize(deviceCategory);

  const keywordMap = {
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

    computer: [
      'computer',
      'desktop',
      'laptop',
      'pc',
      'hardware'
    ],

    phone: [
      'phone',
      'smartphone',
      'mobile',
      'android',
      'ios'
    ],

    smartphone: [
      'phone',
      'smartphone',
      'mobile',
      'android',
      'ios'
    ],

    printer: [
      'printer',
      'printing'
    ],

    internet: [
      'internet',
      'network',
      'wifi',
      'wi-fi',
      'router'
    ],

    network: [
      'network',
      'internet',
      'wifi',
      'router'
    ],

    software: [
      'software',
      'windows',
      'application',
      'app',
      'operating system'
    ]
  };


  if (keywordMap[category]) {
    return keywordMap[category];
  }


  return [
    category
  ];
};


// ==========================================================
// HELPER: CALCULATE EXPERTISE SCORE
// ==========================================================

const calculateExpertiseScore = (
  deviceCategory,
  specialty
) => {

  const category =
    normalize(deviceCategory);

  const technicianSpecialty =
    normalize(specialty);


  if (
    !category ||
    !technicianSpecialty
  ) {
    return 0;
  }


  // Strongest direct match
  if (
    technicianSpecialty.includes(category)
  ) {
    return 100;
  }


  const keywords =
    getCategoryKeywords(
      deviceCategory
    );


  const matchedKeywords =
    keywords.filter(
      keyword =>
        technicianSpecialty.includes(
          normalize(keyword)
        )
    );


  if (
    matchedKeywords.length === 0
  ) {
    return 0;
  }


  // Related specialty match
  return 85;
};


// ==========================================================
// HELPER: CHECK SAME CALENDAR DAY
// ==========================================================

const isSameCalendarDay = (
  dateValue,
  targetDate
) => {

  if (!dateValue) {
    return false;
  }


  const appointmentDate =
    new Date(dateValue);


  if (
    Number.isNaN(
      appointmentDate.getTime()
    )
  ) {
    return false;
  }


  return (
    appointmentDate.getFullYear() ===
      targetDate.getFullYear() &&

    appointmentDate.getMonth() ===
      targetDate.getMonth() &&

    appointmentDate.getDate() ===
      targetDate.getDate()
  );
};


// ==========================================================
// HELPER: TODAY SHORT NAME
// ==========================================================

const getTodayShortName = () => {

  return new Intl.DateTimeFormat(
    'en-US',
    {
      weekday: 'short'
    }
  ).format(
    new Date()
  );
};


// ==========================================================
// HELPER: TODAY WORKLOAD
// ==========================================================

const getTodayWorkload = (
  appointments = []
) => {

  const today =
    new Date();


  return appointments.filter(
    appointment => {

      const status =
        normalize(
          appointment.status
        );


      if (
        status === 'rejected' ||
        status === 'cancelled'
      ) {
        return false;
      }


      return isSameCalendarDay(
        appointment.date,
        today
      );

    }
  ).length;
};


// ==========================================================
// HELPER: AVAILABILITY CHECK
// ==========================================================

const checkTechnicianAvailability = (
  technician
) => {

  if (
    !technician.isAvailable
  ) {
    return false;
  }


  const today =
    getTodayShortName()
      .toLowerCase();


  const availableDays =
    String(
      technician.availableDays ||
      ''
    )
      .split(',')
      .map(
        day =>
          day.trim().toLowerCase()
      );


  return availableDays.includes(
    today
  );
};


// ==========================================================
// HELPER: CALCULATE RATING SCORE
// ==========================================================

const calculateRatingScore = (
  rating
) => {

  const numericRating =
    Number(rating || 0);


  const normalizedRating =
    Math.min(
      Math.max(
        numericRating,
        0
      ),
      5
    );


  return (
    normalizedRating /
    5
  ) * 100;
};


// ==========================================================
// HELPER: CALCULATE WORKLOAD SCORE
// ==========================================================

const calculateWorkloadScore = (
  workload,
  maximum
) => {

  const maxAppointments =
    Number(maximum) > 0
      ? Number(maximum)
      : 1;


  if (
    workload >=
    maxAppointments
  ) {
    return 0;
  }


  return Math.max(
    0,
    100 -
      (
        workload /
        maxAppointments
      ) * 100
  );
};


// ==========================================================
// HELPER: FORMAT ASSIGNMENT RESPONSE
// ==========================================================

const formatAssignmentResponse = (
  assignment,
  technician
) => {

  return {

    assignment: {
      id:
        assignment.id,

      serviceRequestId:
        assignment.serviceRequestId,

      technicianId:
        assignment.technicianId,

      status:
        assignment.status,

      totalScore:
        assignment.totalScore,

      matchReason:
        assignment.matchReason,

      createdAt:
        assignment.createdAt,

      scoreBreakdown: {
        expertise:
          assignment.expertiseScore,

        availability:
          assignment.availabilityScore,

        workload:
          assignment.workloadScore,

        rating:
          assignment.ratingScore
      },

      workload: {
        current:
          assignment.workloadCount,

        maximum:
          assignment.maxDailyAppointments
      }
    },


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

      isAvailable:
        technician.isAvailable,

      availableDays:
        technician.availableDays
          ? technician.availableDays
              .split(',')
              .map(
                day =>
                  day.trim()
              )
          : [],

      workingHours:
        technician.workingHours,

      maxDailyAppointments:
        technician.maxDailyAppointments,

      phone:
        technician.user?.phone ||
        null,

      email:
        technician.user?.email ||
        null,

      avatar:
        technician.avatar ||
        technician.name
          ?.slice(0, 2)
          .toUpperCase()
    }
  };
};


// ==========================================================
// HELPER: CREATE BEST ASSIGNMENT
// ==========================================================

const createBestAssignment = async (
  serviceRequest
) => {

  // ---------------------------------------------
  // Technicians already rejected by this customer
  // ---------------------------------------------

  const previousAssignments =
    await prisma.technicianAssignment.findMany({
      where: {
        serviceRequestId:
          serviceRequest.id
      },
      select: {
        technicianId: true,
        status: true
      }
    });


  const rejectedTechnicianIds =
    previousAssignments
      .filter(
        item =>
          item.status ===
          'REJECTED_BY_CUSTOMER'
      )
      .map(
        item =>
          item.technicianId
      );


  // ---------------------------------------------
  // Load technicians
  // ---------------------------------------------

  const technicians =
    await prisma.technician.findMany({
      where: {
        isAvailable: true,

        ...(rejectedTechnicianIds.length > 0
          ? {
              id: {
                notIn:
                  rejectedTechnicianIds
              }
            }
          : {})
      },

      include: {
        user: true,

        appointments: {
          select: {
            date: true,
            status: true
          }
        }
      }
    });


  if (
    technicians.length === 0
  ) {

    const error =
      new Error(
        'No available technicians found.'
      );

    error.statusCode = 404;
    error.noMoreAutomaticMatches = true;

    throw error;
  }


  // ---------------------------------------------
  // Calculate score
  // ---------------------------------------------

  const scoredTechnicians =
    technicians
      .map(
        technician => {

          const expertiseScore =
            calculateExpertiseScore(
              serviceRequest.deviceCategory,
              technician.specialty
            );


          const availableToday =
            checkTechnicianAvailability(
              technician
            );


          const availabilityScore =
            availableToday
              ? 100
              : 0;


          const workloadCount =
            getTodayWorkload(
              technician.appointments
            );


          const maxDailyAppointments =
            technician.maxDailyAppointments ||
            5;


          const workloadScore =
            calculateWorkloadScore(
              workloadCount,
              maxDailyAppointments
            );


          const ratingScore =
            calculateRatingScore(
              technician.rating
            );


          const totalScore =
            (
              expertiseScore *
                0.40
            ) +
            (
              availabilityScore *
                0.25
            ) +
            (
              workloadScore *
                0.20
            ) +
            (
              ratingScore *
                0.15
            );


          return {
            technician,
            expertiseScore,
            availabilityScore,
            workloadScore,
            ratingScore,
            workloadCount,
            maxDailyAppointments,
            totalScore
          };
        }
      )

      // Must have relevant expertise
      .filter(
        item =>
          item.expertiseScore > 0
      )

      // Must be available today
      .filter(
        item =>
          item.availabilityScore > 0
      )

      // Must not be fully booked
      .filter(
        item =>
          item.workloadCount <
          item.maxDailyAppointments
      )

      .sort(
        (a, b) =>
          b.totalScore -
          a.totalScore
      );


  if (
    scoredTechnicians.length === 0
  ) {

    const error =
      new Error(
        'No suitable technician matched the required expertise, availability, and workload.'
      );

    error.statusCode = 404;
    error.noMoreAutomaticMatches = true;

    throw error;
  }


  const bestMatch =
    scoredTechnicians[0];


  const matchReason =
    `${bestMatch.technician.name} was selected based on technical expertise, availability, current workload, and rating.`;


  const assignment =
    await prisma.technicianAssignment.create({
      data: {
        serviceRequestId:
          serviceRequest.id,

        technicianId:
          bestMatch.technician.id,

        status:
          'PENDING_CUSTOMER_APPROVAL',

        totalScore:
          Number(
            bestMatch.totalScore.toFixed(2)
          ),

        expertiseScore:
          Number(
            bestMatch.expertiseScore.toFixed(2)
          ),

        availabilityScore:
          Number(
            bestMatch.availabilityScore.toFixed(2)
          ),

        workloadScore:
          Number(
            bestMatch.workloadScore.toFixed(2)
          ),

        ratingScore:
          Number(
            bestMatch.ratingScore.toFixed(2)
          ),

        workloadCount:
          bestMatch.workloadCount,

        maxDailyAppointments:
          bestMatch.maxDailyAppointments,

        matchReason
      }
    });


  await prisma.serviceRequest.update({
    where: {
      id:
        serviceRequest.id
    },

    data: {
      status:
        'ASSIGNED',

      statusLogs: {
        create: {
          status:
            'ASSIGNED',

          note:
            `Automatically suggested Technician ${bestMatch.technician.name}. Waiting for customer approval.`
        }
      }
    }
  });


  return formatAssignmentResponse(
    assignment,
    bestMatch.technician
  );
};


// ==========================================================
// POST /api/assignments/requests/:serviceRequestId/assign
// AUTOMATICALLY ASSIGN BEST TECHNICIAN
// ==========================================================

export const assignBestTechnician = async (
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
        success: false,
        message:
          'Service request not found.'
      });
    }


    // ---------------------------------------------
    // If already accepted, do not create again
    // ---------------------------------------------

    const acceptedAssignment =
      await prisma.technicianAssignment.findFirst({
        where: {
          serviceRequestId:
            serviceRequest.id,

          status:
            'ACCEPTED'
        },

        orderBy: {
          createdAt:
            'desc'
        },

        include: {
          technician: {
            include: {
              user: true
            }
          }
        }
      });


    if (acceptedAssignment) {

      return res.json({
        success: true,
        message:
          'Technician has already been accepted.',

        data:
          formatAssignmentResponse(
            acceptedAssignment,
            acceptedAssignment.technician
          )
      });
    }


    // ---------------------------------------------
    // If already waiting for approval return it
    // ---------------------------------------------

    const existingPending =
      await prisma.technicianAssignment.findFirst({
        where: {
          serviceRequestId:
            serviceRequest.id,

          status:
            'PENDING_CUSTOMER_APPROVAL'
        },

        orderBy: {
          createdAt:
            'desc'
        },

        include: {
          technician: {
            include: {
              user: true
            }
          }
        }
      });


    if (existingPending) {

      return res.json({
        success: true,
        message:
          'Existing technician suggestion loaded.',

        data:
          formatAssignmentResponse(
            existingPending,
            existingPending.technician
          )
      });
    }


    const result =
      await createBestAssignment(
        serviceRequest
      );


    return res.status(201).json({
      success: true,
      message:
        'Best technician assigned automatically.',

      data:
        result
    });


  } catch (error) {

    console.error(
      'Automatic assignment error:',
      error
    );


    return res.status(
      error.statusCode || 500
    ).json({
      success: false,

      message:
        error.message ||
        'Automatic technician assignment failed.',

      noMoreAutomaticMatches:
        Boolean(
          error.noMoreAutomaticMatches
        )
    });
  }
};


// ==========================================================
// GET /api/assignments/requests/:serviceRequestId/latest
// ==========================================================

export const getLatestAssignment = async (
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
        success: false,
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
          createdAt:
            'desc'
        },

        include: {
          technician: {
            include: {
              user: true
            }
          }
        }
      });


    if (!assignment) {

      return res.status(404).json({
        success: false,
        message:
          'No technician assignment found.'
      });
    }


    return res.json({
      success: true,

      data:
        formatAssignmentResponse(
          assignment,
          assignment.technician
        )
    });


  } catch (error) {

    console.error(
      'Get assignment error:',
      error
    );


    return res.status(500).json({
      success: false,
      message:
        'Database error while reading technician assignment.'
    });
  }
};


// ==========================================================
// PUT /api/assignments/requests/:serviceRequestId/accept
// CUSTOMER ACCEPTS TECHNICIAN
// ==========================================================

export const acceptAssignedTechnician = async (
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
        success: false,
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
          createdAt:
            'desc'
        },

        include: {
          technician: {
            include: {
              user: true
            }
          }
        }
      });


    if (!assignment) {

      return res.status(404).json({
        success: false,
        message:
          'No pending technician assignment found.'
      });
    }


    const updatedAssignment =
      await prisma.$transaction(
        async tx => {

          const updated =
            await tx.technicianAssignment.update({
              where: {
                id:
                  assignment.id
              },

              data: {
                status:
                  'ACCEPTED'
              }
            });


          await tx.serviceRequest.update({
            where: {
              id:
                serviceRequest.id
            },

            data: {
              status:
                'ACCEPTED',

              statusLogs: {
                create: {
                  status:
                    'ACCEPTED',

                  note:
                    `Customer accepted Technician ${assignment.technician.name}.`
                }
              }
            }
          });


          return updated;
        }
      );


    return res.json({
      success: true,

      message:
        `Technician ${assignment.technician.name} accepted successfully.`,

      data:
        formatAssignmentResponse(
          updatedAssignment,
          assignment.technician
        )
    });


  } catch (error) {

    console.error(
      'Accept technician error:',
      error
    );


    return res.status(500).json({
      success: false,
      message:
        'Unable to accept assigned technician.'
    });
  }
};


// ==========================================================
// PUT /api/assignments/requests/:serviceRequestId/reassign
// REJECT CURRENT + ASSIGN NEXT BEST
// ==========================================================

export const reassignTechnician = async (
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
        success: false,
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
          createdAt:
            'desc'
        },

        include: {
          technician: true
        }
      });


    if (!currentAssignment) {

      return res.status(404).json({
        success: false,
        message:
          'No pending technician is available for reassignment.'
      });
    }


    await prisma.$transaction(
      async tx => {

        await tx.technicianAssignment.update({
          where: {
            id:
              currentAssignment.id
          },

          data: {
            status:
              'REJECTED_BY_CUSTOMER'
          }
        });


        await tx.serviceRequest.update({
          where: {
            id:
              serviceRequest.id
          },

          data: {
            status:
              'PENDING',

            statusLogs: {
              create: {
                status:
                  'PENDING',

                note:
                  `Customer rejected Technician ${currentAssignment.technician.name} and requested another technician.`
              }
            }
          }
        });

      }
    );


    try {

      const nextAssignment =
        await createBestAssignment(
          serviceRequest
        );


      return res.json({
        success: true,

        message:
          'Next best technician assigned successfully.',

        data:
          nextAssignment
      });


    } catch (assignmentError) {

      return res.status(
        assignmentError.statusCode ||
        404
      ).json({
        success: false,

        message:
          assignmentError.message ||
          'No more suitable technicians are available.',

        noMoreAutomaticMatches:
          true
      });
    }


  } catch (error) {

    console.error(
      'Reassign technician error:',
      error
    );


    return res.status(500).json({
      success: false,
      message:
        'Unable to reassign technician.'
    });
  }
};