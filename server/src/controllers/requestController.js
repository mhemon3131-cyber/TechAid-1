// ==========================================================
// SERVICE REQUEST CONTROLLER
//
// Merged features:
//
// - Create Service Request
// - Get All Requests
// - Get Request by Tracking ID / DB ID
// - Service Progress Tracking
// - Service Status Update
// - Status History
// - Notification Trigger
// - Conversation Auto Creation
// - Latest Customer Request
// - Technician Full Job View
// - Emergency Support Queue
//
// REAL PRISMA DATABASE ONLY
// ==========================================================

import {
  PrismaClient
} from '@prisma/client';

import {
  uploadToCloudinary
} from '../utils/cloudinary.js';


const prisma =
  new PrismaClient();


// ==========================================================
// GENERATE TRACKING ID
//
// Example:
// REQ-2026-8942
// ==========================================================

const generateTrackingId =
  () => {

    const randomNum =
      Math.floor(
        1000 +
        Math.random() *
        9000
      );


    return `REQ-2026-${randomNum}`;
  };


// ==========================================================
// FIND REQUEST HELPER
//
// Supports:
//
// 1. Prisma ServiceRequest ID
// 2. Tracking ID such as REQ-2026-1234
// ==========================================================

const findRequestByIdentifier =
  async (
    identifier,
    include = undefined
  ) => {

    if (
      !identifier
    ) {

      return null;
    }


    const cleanIdentifier =
      String(
        identifier
      ).trim();


    return prisma.serviceRequest.findFirst({

      where: {

        OR: [
          {
            id:
              cleanIdentifier
          },

          {
            trackingId:
              cleanIdentifier.toUpperCase()
          }
        ]
      },


      ...(include
        ? {
            include
          }
        : {})
    });
  };


// ==========================================================
// CREATE SERVICE REQUEST
//
// POST /api/requests
// ==========================================================

export const createServiceRequest =
  async (
    req,
    res
  ) => {

    try {

      const {
        deviceCategory,
        title,
        description,
        urgency,
        serviceMethod,
        attachments = [],
        customerId
      } = req.body;


      // ----------------------------------------------------
      // VALIDATION
      // ----------------------------------------------------

      if (
        !deviceCategory ||
        !description ||
        !urgency ||
        !serviceMethod
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'Please provide device category, description, urgency, and service method.'
        });
      }


      // ----------------------------------------------------
      // CUSTOMER
      // ----------------------------------------------------

      const custId =
        customerId ||
        'usr-1';


      const customer =
        await prisma.user.findUnique({

          where: {

            id:
              custId
          }
        });


      if (
        !customer
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'Customer account not found in database.'
        });
      }


      // ----------------------------------------------------
      // UNIQUE TRACKING ID
      // ----------------------------------------------------

      let trackingId =
        generateTrackingId();


      let existingTracking =
        await prisma.serviceRequest.findUnique({

          where: {

            trackingId
          }
        });


      while (
        existingTracking
      ) {

        trackingId =
          generateTrackingId();


        existingTracking =
          await prisma.serviceRequest.findUnique({

            where: {

              trackingId
            }
          });
      }


      // ----------------------------------------------------
      // PROCESS ATTACHMENTS
      // ----------------------------------------------------

      const processedAttachments =
        [];


      for (
        const file of attachments
      ) {

        let cloudinaryResult =
          null;


        // Existing uploaded URL thakle
        // unnecessary Cloudinary call korbo na.
        if (
          !file?.url
        ) {

          try {

            cloudinaryResult =
              await uploadToCloudinary(
                null,
                file?.name ||
                'attachment.png',
                file?.type
              );

          } catch (
            uploadError
          ) {

            console.error(
              'Attachment upload failed:',
              uploadError
            );
          }
        }


        const fileUrl =
          file?.url ||
          cloudinaryResult?.url ||
          null;


        if (
          fileUrl
        ) {

          processedAttachments.push({

            fileUrl,

            fileType:
              file?.type ||
              'IMAGE',

            fileName:
              file?.name ||
              'Uploaded File'
          });
        }
      }


      // ----------------------------------------------------
      // CREATE REQUEST
      // ----------------------------------------------------

      const newRequest =
        await prisma.serviceRequest.create({

          data: {

            trackingId,

            customerId:
              custId,

            deviceCategory,

            title:
              title ||
              `${deviceCategory} Support: ${String(
                description
              ).slice(
                0,
                30
              )}...`,

            description,

            urgency,

            serviceMethod,

            status:
              'PENDING',

            estimatedCost:
              urgency ===
                'Critical' ||
              urgency ===
                'Emergency' ||
              urgency ===
                'EMERGENCY'
                ? '৳1,200 - 2,000'
                : '৳800 - 1,500',

            attachments: {

              create:
                processedAttachments
            },

            statusLogs: {

              create: [

                {
                  status:
                    'PENDING',

                  note:
                    'Service request created by customer in database.'
                }
              ]
            }
          },


          include: {

            attachments:
              true,

            statusLogs:
              true,

            customer:
              true
          }
        });


      // ----------------------------------------------------
      // OPTIONAL NOTIFICATION
      // ----------------------------------------------------

      try {

        const {
          createNotificationHelper
        } =
          await import(
            './notificationController.js'
          );


        await createNotificationHelper({

          userId:
            newRequest.customerId,

          userEmail:
            newRequest.customer
              ?.email,

          type:
            'REQUEST_CREATED',

          title:
            `Service Request #${newRequest.trackingId} Created`,

          message:
            `Your technical issue "${newRequest.title}" has been submitted successfully.`
        });


      } catch (
        notificationError
      ) {

        console.log(
          'Request creation notification skipped:',
          notificationError.message
        );
      }


      return res.status(
        201
      ).json({

        success:
          true,

        message:
          'Service request created successfully in Prisma database with unique tracking ID.',

        data:
          newRequest
      });


    } catch (
      error
    ) {

      console.error(
        'Error creating service request in DB:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Server database error while creating request.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET ALL SERVICE REQUESTS
//
// GET /api/requests
// ==========================================================

export const getAllServiceRequests =
  async (
    req,
    res
  ) => {

    try {

      const requests =
        await prisma.serviceRequest.findMany({

          include: {

            attachments:
              true,

            customer:
              true,

            appointment:
              true,

            statusLogs: {

              orderBy: {

                createdAt:
                  'asc'
              }
            }
          },


          orderBy: {

            createdAt:
              'desc'
          }
        });


      return res.json({

        success:
          true,

        count:
          requests.length,

        data:
          requests
      });


    } catch (
      error
    ) {

      console.error(
        'Error fetching service requests:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Database error fetching requests.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET REQUEST BY TRACKING ID / DB ID
//
// GET /api/requests/:trackingId
// ==========================================================

export const getRequestByTrackingId =
  async (
    req,
    res
  ) => {

    try {

      const {
        trackingId
      } = req.params;


      const request =
        await findRequestByIdentifier(
          trackingId,

          {
            attachments:
              true,

            customer:
              true,

            appointment:
              true,

            technician:
              true,

            conversation:
              true,

            review:
              true,

            statusLogs: {

              orderBy: {

                createdAt:
                  'asc'
              }
            }
          }
        );


      if (
        !request
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'Service request not found in database.'
        });
      }


      return res.json({

        success:
          true,

        data:
          request
      });


    } catch (
      error
    ) {

      console.error(
        'Error fetching service request:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Database query error.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET SERVICE PROGRESS
//
// GET /api/requests/:trackingId/progress
// ==========================================================

export const getServiceProgress =
  async (
    req,
    res
  ) => {

    try {

      const {
        trackingId
      } = req.params;


      const request =
        await findRequestByIdentifier(
          trackingId,

          {
            statusLogs: {

              orderBy: {

                createdAt:
                  'asc'
              }
            }
          }
        );


      if (
        !request
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'Service request tracking ID not found in database.'
        });
      }


      const stagesOrder = [
        'PENDING',
        'ASSIGNED',
        'ACCEPTED',
        'IN_PROGRESS',
        'ON_THE_WAY',
        'COMPLETED'
      ];


      const currentStageIndex =
        stagesOrder.indexOf(
          request.status
        );


      return res.json({

        success:
          true,

        data: {

          trackingId:
            request.trackingId,

          deviceCategory:
            request.deviceCategory,

          title:
            request.title,

          currentStatus:
            request.status,

          currentStageIndex:
            currentStageIndex >=
            0
              ? currentStageIndex
              : 0,

          stages:
            stagesOrder,

          logs:
            request.statusLogs ||
            [],

          updatedAt:
            request.updatedAt
        }
      });


    } catch (
      error
    ) {

      console.error(
        'Error fetching progress:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Database error reading progress.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// UPDATE SERVICE STATUS
//
// PUT /api/requests/:id/status
//
// Supports:
// - DB request ID
// - Tracking ID
//
// Uses separate ServiceRequest update +
// StatusHistory create to avoid previous Prisma nested
// relation problems.
// ==========================================================

export const updateServiceStatus =
  async (
    req,
    res
  ) => {

    try {

      const {
        id
      } = req.params;


      const {
        status,
        note,
        technicianId
      } = req.body;


      const validStatuses = [
        'PENDING',
        'ASSIGNED',
        'ACCEPTED',
        'IN_PROGRESS',
        'ON_THE_WAY',
        'COMPLETED'
      ];


      // ----------------------------------------------------
      // STATUS VALIDATION
      // ----------------------------------------------------

      if (
        !validStatuses.includes(
          status
        )
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'Invalid status stage.'
        });
      }


      // ----------------------------------------------------
      // FIND TARGET REQUEST
      // ----------------------------------------------------

      const request =
        await findRequestByIdentifier(
          id
        );


      if (
        !request
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'Service request not found.'
        });
      }


      // ----------------------------------------------------
      // OPTIONAL TECHNICIAN USER VALIDATION
      //
      // ServiceRequest.technicianId in merged schema refers
      // to User.id, NOT Technician.id.
      // ----------------------------------------------------

      let technicianUserId =
        null;


      if (
        technicianId
      ) {

        // First check if incoming ID is already User.id
        const directUser =
          await prisma.user.findUnique({

            where: {

              id:
                technicianId
            }
          });


        if (
          directUser &&
          directUser.role ===
            'TECHNICIAN'
        ) {

          technicianUserId =
            directUser.id;

        } else {

          // Otherwise technicianId may be Technician.id.
          const technicianProfile =
            await prisma.technician.findUnique({

              where: {

                id:
                  technicianId
              },

              include: {

                user:
                  true
              }
            });


          if (
            technicianProfile
              ?.user
          ) {

            technicianUserId =
              technicianProfile.user.id;
          }
        }
      }


      // ----------------------------------------------------
      // STEP 1:
      // UPDATE REQUEST
      // ----------------------------------------------------

      await prisma.serviceRequest.update({

        where: {

          id:
            request.id
        },


        data: {

          status,

          ...(technicianUserId
            ? {

                technicianId:
                  technicianUserId
              }
            : {})
        }
      });


      // ----------------------------------------------------
      // STEP 2:
      // CREATE HISTORY
      // ----------------------------------------------------

      await prisma.statusHistory.create({

        data: {

          serviceRequestId:
            request.id,

          status,

          note:
            note ||
            `Status updated to ${status}.`
        }
      });


      // ----------------------------------------------------
      // STEP 3:
      // RELOAD UPDATED REQUEST
      // ----------------------------------------------------

      const updated =
        await prisma.serviceRequest.findUnique({

          where: {

            id:
              request.id
          },


          include: {

            customer:
              true,

            technician:
              true,

            appointment:
              true,

            statusLogs: {

              orderBy: {

                createdAt:
                  'asc'
              }
            }
          }
        });


      // ----------------------------------------------------
      // AUTO CREATE / UPDATE CONVERSATION
      //
      // Only when request is accepted and a technician
      // User ID exists.
      // ----------------------------------------------------

      if (
        status ===
          'ACCEPTED' &&
        updated?.technicianId
      ) {

        try {

          await prisma.conversation.upsert({

            where: {

              serviceRequestId:
                updated.id
            },


            create: {

              serviceRequestId:
                updated.id,

              customerId:
                updated.customerId,

              technicianId:
                updated.technicianId
            },


            update: {

              technicianId:
                updated.technicianId
            }
          });


        } catch (
          conversationError
        ) {

          console.log(
            'Conversation auto-create skipped:',
            conversationError.message
          );
        }
      }


      // ----------------------------------------------------
      // CUSTOMER NOTIFICATION
      // ----------------------------------------------------

      try {

        const {
          createNotificationHelper
        } =
          await import(
            './notificationController.js'
          );


        await createNotificationHelper({

          userId:
            updated.customerId,

          userEmail:
            updated.customer
              ?.email,

          type:
            `REQUEST_${status}`,

          title:
            `Service Request #${updated.trackingId} Updated`,

          message:
            `Your technical issue "${updated.title}" status is now ${status}.`
        });


      } catch (
        notificationError
      ) {

        console.log(
          'Notification trigger skipped:',
          notificationError.message
        );
      }


      // ----------------------------------------------------
      // SUCCESS
      // ----------------------------------------------------

      return res.json({

        success:
          true,

        message:
          `Service progress stage updated to ${status} in Prisma database.`,

        data:
          updated
      });


    } catch (
      error
    ) {

      console.error(
        'Error updating status in DB:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Database error updating status.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET LATEST REQUEST FOR CUSTOMER
//
// GET /api/requests/customer/:customerId/latest
// ==========================================================

export const getLatestCustomerServiceRequest =
  async (
    req,
    res
  ) => {

    try {

      const {
        customerId
      } = req.params;


      if (
        !customerId
      ) {

        return res.status(
          400
        ).json({

          success:
            false,

          message:
            'Customer ID is required.'
        });
      }


      const customer =
        await prisma.user.findUnique({

          where: {

            id:
              customerId
          }
        });


      if (
        !customer
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'Customer not found.'
        });
      }


      const latestRequest =
        await prisma.serviceRequest.findFirst({

          where: {

            customerId
          },


          include: {

            attachments:
              true,

            customer:
              true,

            appointment:
              true,

            statusLogs: {

              orderBy: {

                createdAt:
                  'asc'
              }
            }
          },


          orderBy: {

            createdAt:
              'desc'
          }
        });


      if (
        !latestRequest
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'No service request found for this customer.'
        });
      }


      return res.json({

        success:
          true,

        data:
          latestRequest
      });


    } catch (
      error
    ) {

      console.error(
        'Get latest customer request error:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Server error while loading latest customer service request.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET FULL REQUEST DETAILS FOR TECHNICIAN
//
// GET /api/requests/:requestId/technician-view
// ==========================================================

export const getRequestForTechnicianView =
  async (
    req,
    res
  ) => {

    try {

      const {
        requestId
      } = req.params;


      const request =
        await findRequestByIdentifier(
          requestId,

          {
            customer:
              true,

            attachments:
              true,

            appointment:
              true,

            statusLogs: {

              orderBy: {

                createdAt:
                  'asc'
              }
            }
          }
        );


      if (
        !request
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          message:
            'Service request not found.'
        });
      }


      // ----------------------------------------------------
      // CUSTOMER LOCATION
      // ----------------------------------------------------

      const requestLocation =
        await prisma.serviceRequestLocation.findUnique({

          where: {

            serviceRequestId:
              request.id
          }
        });


      // ----------------------------------------------------
      // ACCEPTED AUTO ASSIGNMENT
      // ----------------------------------------------------

      const acceptedAssignment =
        await prisma.technicianAssignment.findFirst({

          where: {

            serviceRequestId:
              request.id,

            status:
              'ACCEPTED'
          },


          orderBy: {

            attempt:
              'desc'
          }
        });


      return res.json({

        success:
          true,

        data: {

          request: {

            id:
              request.id,

            trackingId:
              request.trackingId,

            deviceCategory:
              request.deviceCategory,

            title:
              request.title,

            description:
              request.description,

            urgency:
              request.urgency,

            serviceMethod:
              request.serviceMethod,

            status:
              request.status,

            estimatedCost:
              request.estimatedCost,

            createdAt:
              request.createdAt,

            updatedAt:
              request.updatedAt
          },


          customer:
            request.customer
              ? {

                  id:
                    request.customer.id,

                  name:
                    request.customer.name,

                  email:
                    request.customer.email,

                  phone:
                    request.customer.phone,

                  avatar:
                    request.customer.avatar
                }
              : null,


          appointment:
            request.appointment
              ? {

                  id:
                    request.appointment.id,

                  technicianId:
                    request.appointment
                      .technicianId,

                  customerId:
                    request.appointment
                      .customerId,

                  date:
                    request.appointment
                      .date,

                  timeSlot:
                    request.appointment
                      .timeSlot,

                  serviceType:
                    request.appointment
                      .serviceType,

                  status:
                    request.appointment
                      .status
                }
              : null,


          automaticAssignment:
            acceptedAssignment
              ? {

                  id:
                    acceptedAssignment.id,

                  technicianId:
                    acceptedAssignment
                      .technicianId,

                  assignedDate:
                    acceptedAssignment
                      .assignedDate,

                  assignedTimeSlot:
                    acceptedAssignment
                      .assignedTimeSlot,

                  status:
                    acceptedAssignment
                      .status,

                  totalScore:
                    acceptedAssignment
                      .totalScore,

                  distanceKm:
                    acceptedAssignment
                      .distanceKm
                }
              : null,


          location:
            requestLocation
              ? {

                  latitude:
                    requestLocation.latitude,

                  longitude:
                    requestLocation.longitude,

                  address:
                    requestLocation.address
                }
              : null,


          attachments:
            request.attachments ||
            [],


          statusLogs:
            request.statusLogs ||
            []
        }
      });


    } catch (
      error
    ) {

      console.error(
        'Technician request details error:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Server error while loading technician request details.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// EMERGENCY SUPPORT QUEUE
//
// GET /api/requests/emergency/queue
//
// REAL DATABASE ONLY.
// No mock/fake emergency requests.
// ==========================================================

export const getEmergencyQueue =
  async (
    req,
    res
  ) => {

    try {

      const emergencyRequests =
        await prisma.serviceRequest.findMany({

          where: {

            OR: [
              {
                urgency:
                  'Emergency'
              },

              {
                urgency:
                  'Critical'
              },

              {
                urgency:
                  'EMERGENCY'
              },

              {
                urgency:
                  'HIGH'
              }
            ],


            status: {

              in: [
                'PENDING',
                'ASSIGNED',
                'ACCEPTED',
                'IN_PROGRESS',
                'ON_THE_WAY'
              ]
            }
          },


          include: {

            customer:
              true,

            attachments:
              true,

            appointment:
              true,

            statusLogs: {

              orderBy: {

                createdAt:
                  'asc'
              }
            }
          },


          orderBy: {

            createdAt:
              'asc'
          }
        });


      return res.json({

        success:
          true,

        count:
          emergencyRequests.length,

        data:
          emergencyRequests
      });


    } catch (
      error
    ) {

      console.error(
        'Get emergency queue error:',
        error
      );


      return res.status(
        500
      ).json({

        success:
          false,

        message:
          'Failed to fetch emergency support queue.',

        details:
          error.message
      });
    }
  };