// Module 1 & Module 3 Feature 4 Controller: Real Prisma Database Operations
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const prisma = new PrismaClient();


// ==========================================================
// EXISTING GROUP CODE
// ==========================================================


// Helper to generate unique tracking ID e.g. REQ-2026-8942
const generateTrackingId = () => {
  const randomNum =
    Math.floor(
      1000 +
      Math.random() *
      9000
    );

  return `REQ-2026-${randomNum}`;
};


// ==========================================================
// @desc    Create a new Service Request (Module 1 - Prisma DB)
// @route   POST /api/requests
//
// EXISTING GROUPMATE CODE
// ==========================================================

export const createServiceRequest = async (req, res) => {
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

    if (
      !deviceCategory ||
      !description ||
      !urgency ||
      !serviceMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide device category, description, urgency, and service method.'
      });
    }

    const trackingId =
      generateTrackingId();

    // 1. Process Cloudinary uploads
    const processedAttachments = [];

    for (const file of attachments) {
      const cloudinaryResult =
        await uploadToCloudinary(
          null,
          file.name || 'attachment.png',
          file.type
        );

      processedAttachments.push({
        fileUrl:
          file.url ||
          cloudinaryResult.url,

        fileType:
          file.type ||
          'IMAGE',

        fileName:
          file.name ||
          'Uploaded File'
      });
    }

    // Default to Customer Mehedi Hasan if customerId not passed
    const custId =
      customerId ||
      'usr-1';

    // 2. Save directly to Prisma Database
    const newRequest =
      await prisma.serviceRequest.create({
        data: {
          trackingId,

          customerId:
            custId,

          deviceCategory,

          title:
            title ||
            `${deviceCategory} Support: ${description.slice(0, 30)}...`,

          description,

          urgency,

          serviceMethod,

          status:
            'PENDING',

          estimatedCost:
            urgency === 'Critical'
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

    res.status(201).json({
      success: true,

      message:
        'Service request created successfully in Prisma database with unique tracking ID.',

      data:
        newRequest
    });

  } catch (error) {
    console.error(
      'Error creating service request in DB:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Server database error while creating request.'
    });
  }
};


// ==========================================================
// @desc    Get all Service Requests from Prisma DB
// @route   GET /api/requests
//
// EXISTING GROUPMATE CODE
// ==========================================================

export const getAllServiceRequests = async (req, res) => {
  try {
    const requests =
      await prisma.serviceRequest.findMany({
        include: {
          attachments:
            true,

          customer:
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

    res.json({
      success: true,
      count:
        requests.length,
      data:
        requests
    });

  } catch (error) {
    console.error(
      'Error fetching service requests:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Database error fetching requests.'
    });
  }
};


// ==========================================================
// @desc    Get single request by Tracking ID from Prisma DB
// @route   GET /api/requests/:trackingId
//
// EXISTING GROUPMATE CODE
// ==========================================================

export const getRequestByTrackingId = async (req, res) => {
  try {
    const {
      trackingId
    } = req.params;

    const request =
      await prisma.serviceRequest.findFirst({
        where: {
          OR: [
            {
              trackingId:
                trackingId.toUpperCase()
            },

            {
              id:
                trackingId
            }
          ]
        },

        include: {
          attachments:
            true,

          customer:
            true,

          statusLogs: {
            orderBy: {
              createdAt:
                'asc'
            }
          }
        }
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          'Service request not found in database.'
      });
    }

    res.json({
      success: true,
      data:
        request
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        'Database query error.'
    });
  }
};


// ==========================================================
// @desc    Get Progress Tracking Logs from Prisma DB
//          (Module 3 Feature 4)
//
// @route   GET /api/requests/:trackingId/progress
//
// EXISTING GROUPMATE CODE
// ==========================================================

export const getServiceProgress = async (req, res) => {
  try {
    const {
      trackingId
    } = req.params;

    const request =
      await prisma.serviceRequest.findFirst({
        where: {
          OR: [
            {
              trackingId:
                trackingId.toUpperCase()
            },

            {
              id:
                trackingId
            }
          ]
        },

        include: {
          statusLogs: {
            orderBy: {
              createdAt:
                'asc'
            }
          }
        }
      });

    if (!request) {
      return res.status(404).json({
        success: false,
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

    res.json({
      success: true,

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
          currentStageIndex >= 0
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

  } catch (error) {
    console.error(
      'Error fetching progress:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Database error reading progress.'
    });
  }
};


// ==========================================================
// @desc    Update Service Request Status Stage in Prisma DB
//          (Module 3 Feature 4)
//
// @route   PUT /api/requests/:id/status
//
// EXISTING GROUPMATE CODE
// ==========================================================

export const updateServiceStatus = async (req, res) => {
  try {
    const {
      id
    } = req.params;

    const {
      status,
      note
    } = req.body;

    const validStatuses = [
      'PENDING',
      'ASSIGNED',
      'ACCEPTED',
      'IN_PROGRESS',
      'ON_THE_WAY',
      'COMPLETED'
    ];

    if (
      !validStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid status stage.'
      });
    }

    // Update Request and append to StatusHistory table
    const updated =
      await prisma.serviceRequest.update({
        where: {
          id
        },

        data: {
          status,

          statusLogs: {
            create: {
              status,

              note:
                note ||
                `Status updated to ${status}.`
            }
          }
        },

        include: {
          statusLogs:
            true
        }
      });

    res.json({
      success: true,

      message:
        `Service progress stage updated to ${status} in Prisma database.`,

      data:
        updated
    });

  } catch (error) {
    console.error(
      'Error updating status in DB:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Database error updating status.'
    });
  }
};



// GET LATEST SERVICE REQUEST FOR A CUSTOMER
//
// Automatic Technician Assignment page-e all requests
// frontend-e load/filter na kore directly latest request
// retrieve kora jabe.
//
// Existing group code change kore na.
//
// @route
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


      if (!customerId) {
        return res.status(400).json({
          success: false,
          message:
            'Customer ID is required.'
        });
      }


      // Customer ID actually exists kina
      const customer =
        await prisma.user.findUnique({
          where: {
            id:
              customerId
          }
        });


      if (!customer) {
        return res.status(404).json({
          success: false,
          message:
            'Customer not found.'
        });
      }


      // Latest service request only
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

            statusLogs: {
              orderBy: {
                createdAt:
                  'asc'
              }
            },

            appointment:
              true
          },

          orderBy: {
            createdAt:
              'desc'
          }
        });


      if (!latestRequest) {
        return res.status(404).json({
          success: false,

          message:
            'No service request found for this customer.'
        });
      }


      return res.json({
        success: true,

        data:
          latestRequest
      });

    } catch (error) {
      console.error(
        'Get latest customer request error:',
        error
      );


      return res.status(500).json({
        success: false,

        message:
          'Server error while loading latest customer service request.'
      });
    }
  };


//
// GET FULL REQUEST DETAILS FOR TECHNICIAN JOB VIEW
//
// Technician-er Job Requests page-e accepted customer-er:
//
// Name
// Phone
// Email
// Problem
// Device
// Urgency
// Service Method
// Appointment
// Customer Location
//
// show korar jonno full request info provide kore.
//
// Existing request data modify kore na.
//
// @route
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
        await prisma.serviceRequest.findFirst({
          where: {
            OR: [
              {
                id:
                  requestId
              },

              {
                trackingId:
                  requestId.toUpperCase()
              }
            ]
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
          }
        });


      if (!request) {
        return res.status(404).json({
          success: false,

          message:
            'Service request not found.'
        });
      }


      const requestLocation =
        await prisma.serviceRequestLocation.findUnique({
          where: {
            serviceRequestId:
              request.id
          }
        });


      // Automatic assignment-er latest accepted record
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
        success: true,

        data: {

          // -----------------------------------------------
          // Request information
          // -----------------------------------------------

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


          // -----------------------------------------------
          // Customer contact information
          // -----------------------------------------------

          customer: request.customer
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


          // -----------------------------------------------
          // Confirmed appointment
          // -----------------------------------------------

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
                    request.appointment.date,

                  timeSlot:
                    request.appointment
                      .timeSlot,

                  status:
                    request.appointment.status
                }
              : null,


          // -----------------------------------------------
          // Automatic accepted assignment
          // -----------------------------------------------

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
                    acceptedAssignment.status,

                  totalScore:
                    acceptedAssignment
                      .totalScore,

                  distanceKm:
                    acceptedAssignment
                      .distanceKm
                }
              : null,


          // -----------------------------------------------
          // Customer service location
          // -----------------------------------------------

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


          // -----------------------------------------------
          // Attachments
          // -----------------------------------------------

          attachments:
            request.attachments ||
            [],


          // -----------------------------------------------
          // Existing progress logs
          // -----------------------------------------------

          statusLogs:
            request.statusLogs ||
            []
        }
      });

    } catch (error) {
      console.error(
        'Technician request details error:',
        error
      );


      return res.status(500).json({
        success: false,

        message:
          'Server error while loading technician request details.'
      });
    }
  };

