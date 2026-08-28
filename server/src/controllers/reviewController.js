import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// ======================================================
// MODULE 3 - FEATURE 4
// RATING & REVIEW SYSTEM
// ======================================================


// ======================================================
// HELPER: SAFE REVIEW SCORE
// ======================================================

const getSafeScore = (value, fallback) => {

  const number =
    Number(
      value ?? fallback
    );


  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > 5
  ) {

    return fallback;
  }


  return number;
};


// ======================================================
// GET CUSTOMER COMPLETED SERVICES
//
// GET
// /api/reviews/customer/:customerId/completed-services
//
// Customer-er completed services automatically show.
//
// IMPORTANT:
//
// Groupmate-er requestController change kora lagbe na.
//
// Completed dhora hobe jodi:
//
// 1. ServiceRequest.status === COMPLETED
//
// OR
//
// 2. Latest StatusHistory.status === COMPLETED
//
// Technician:
//
// 1. Accepted Auto Assignment technician
//
// OR
//
// 2. Linked normal Appointment technician
// ======================================================

export const getCustomerCompletedServices =
  async (
    req,
    res
  ) => {

    try {

      const {
        customerId
      } = req.params;


      // =================================================
      // VALIDATION
      // =================================================

      if (!customerId) {

        return res.status(400).json({

          success:
            false,

          message:
            'Customer ID is required.'
        });
      }


      // =================================================
      // FIND CUSTOMER REQUESTS
      //
      // Main request status + status history duita load.
      // =================================================

      const requests =
        await prisma.serviceRequest.findMany({

          where: {
            customerId:
              customerId
          },

          include: {

            statusLogs: {

              orderBy: {
                createdAt:
                  'desc'
              }
            }
          },

          orderBy: {
            updatedAt:
              'desc'
          }
        });


      // =================================================
      // FIND COMPLETED REQUESTS
      // =================================================

      const completedRequests =
        requests.filter(
          (request) => {

            const latestStatus =
              request.statusLogs?.[0]
                ?.status ||
              null;


            return (

              request.status ===
                'COMPLETED' ||

              latestStatus ===
                'COMPLETED'
            );
          }
        );


      const completedServices =
        [];


      // =================================================
      // BUILD COMPLETED SERVICE CARDS
      // =================================================

      for (
        const request
        of completedRequests
      ) {

        // ===============================================
        // AUTO ASSIGNMENT TECHNICIAN
        // ===============================================

        const assignment =
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


        let technicianId =
          assignment?.technicianId ||
          null;


        let scheduleDate =
          assignment?.assignedDate ||
          null;


        let scheduleTime =
          assignment?.assignedTimeSlot ||
          null;


        let source =
          assignment
            ? 'AUTO_ASSIGNMENT'
            : null;


        // ===============================================
        // NORMAL APPOINTMENT SUPPORT
        //
        // Auto assignment na thakle linked appointment
        // technician use korbo.
        // ===============================================

        if (!technicianId) {

          const appointment =
            await prisma.appointment.findFirst({

              where: {
                serviceRequestId:
                  request.id
              },

              orderBy: {
                createdAt:
                  'desc'
              }
            });


          if (appointment) {

            technicianId =
              appointment.technicianId;


            scheduleDate =
              appointment.date;


            scheduleTime =
              appointment.timeSlot;


            source =
              'APPOINTMENT';
          }
        }


        // ===============================================
        // NO TECHNICIAN LINKED
        // ===============================================

        if (!technicianId) {

          continue;
        }


        // ===============================================
        // TECHNICIAN DETAILS
        // ===============================================

        const technician =
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


        if (!technician) {

          continue;
        }


        // ===============================================
        // EXISTING REVIEW
        //
        // Schema:
        // Review.serviceRequestId
        // ===============================================

        const existingReview =
          await prisma.review.findUnique({

            where: {
              serviceRequestId:
                request.id
            }
          });


        // ===============================================
        // FINAL SERVICE CARD
        // ===============================================

        completedServices.push({

          source,


          request: {

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

            serviceMethod:
              request.serviceMethod,

            urgency:
              request.urgency,

            status:
              'COMPLETED',

            estimatedCost:
              request.estimatedCost
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

            avatar:
              technician.avatar,

            email:
              technician.user?.email ||
              null,

            phone:
              technician.user?.phone ||
              null
          },


          schedule: {

            date:
              scheduleDate,

            time:
              scheduleTime,

            timeSlot:
              scheduleTime
          },


          reviewed:
            Boolean(
              existingReview
            ),


          review:
            existingReview ||
            null
        });
      }


      // =================================================
      // SUCCESS
      // =================================================

      return res.json({

        success:
          true,

        count:
          completedServices.length,

        data:
          completedServices
      });


    } catch (error) {

      console.error(
        'Get completed services error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Could not load completed services.',

        details:
          error.message
      });
    }
  };


// ======================================================
// CREATE REVIEW
//
// POST
// /api/reviews
//
// Frontend can send:
//
// {
//   requestId,
//   technicianId,
//   rating,
//   comment
// }
//
// OR:
//
// {
//   serviceRequestId,
//   technicianId,
//   rating,
//   comment
// }
//
// Schema requires:
//
// serviceQuality
// professionalism
// communication
// responseTime
//
// Current simple frontend overall rating dile
// same score criteria fields-e save hobe.
// ======================================================

export const createReview =
  async (
    req,
    res
  ) => {

    try {

      const {

        requestId,

        serviceRequestId,

        technicianId,

        rating,

        comment,

        serviceQuality,

        professionalism,

        communication,

        responseTime

      } = req.body;


      // =================================================
      // SUPPORT BOTH requestId & serviceRequestId
      // =================================================

      const finalServiceRequestId =
        serviceRequestId ||
        requestId;


      // =================================================
      // VALIDATION
      // =================================================

      if (
        !finalServiceRequestId ||
        !technicianId ||
        rating === undefined
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            'Service request, technician and rating are required.'
        });
      }


      const numericRating =
        Number(
          rating
        );


      if (
        !Number.isInteger(
          numericRating
        ) ||

        numericRating < 1 ||

        numericRating > 5
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            'Rating must be between 1 and 5.'
        });
      }


      // =================================================
      // FIND SERVICE REQUEST
      // =================================================

      const request =
        await prisma.serviceRequest.findUnique({

          where: {
            id:
              finalServiceRequestId
          },

          include: {

            statusLogs: {

              orderBy: {
                createdAt:
                  'desc'
              }
            }
          }
        });


      if (!request) {

        return res.status(404).json({

          success:
            false,

          message:
            'Service request not found.'
        });
      }


      // =================================================
      // COMPLETION CHECK
      //
      // Main status OR latest status history.
      // =================================================

      const latestStatus =
        request.statusLogs?.[0]
          ?.status ||
        null;


      const isCompleted =
        request.status ===
          'COMPLETED' ||

        latestStatus ===
          'COMPLETED';


      if (!isCompleted) {

        return res.status(400).json({

          success:
            false,

          message:
            'Review can only be submitted after service completion.'
        });
      }


      // =================================================
      // VERIFY TECHNICIAN
      //
      // 1. Accepted auto assignment
      // OR
      // 2. Linked normal appointment
      // =================================================

      const acceptedAssignment =
        await prisma.technicianAssignment.findFirst({

          where: {

            serviceRequestId:
              finalServiceRequestId,

            technicianId:
              technicianId,

            status:
              'ACCEPTED'
          }
        });


      const linkedAppointment =
        await prisma.appointment.findFirst({

          where: {

            serviceRequestId:
              finalServiceRequestId,

            technicianId:
              technicianId
          }
        });


      if (
        !acceptedAssignment &&
        !linkedAppointment
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            'This technician is not linked with this completed service.'
        });
      }


      // =================================================
      // TECHNICIAN EXISTS?
      // =================================================

      const technician =
        await prisma.technician.findUnique({

          where: {
            id:
              technicianId
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


      // =================================================
      // DUPLICATE REVIEW PREVENTION
      //
      // serviceRequestId is @unique
      // =================================================

      const existingReview =
        await prisma.review.findUnique({

          where: {
            serviceRequestId:
              finalServiceRequestId
          }
        });


      if (existingReview) {

        return res.status(409).json({

          success:
            false,

          alreadyReviewed:
            true,

          message:
            'You have already reviewed this service.',

          data:
            existingReview
        });
      }


      // =================================================
      // REQUIRED CRITERIA
      //
      // Frontend separate criteria na pathale
      // overall rating use hobe.
      // =================================================

      const finalServiceQuality =
        getSafeScore(
          serviceQuality,
          numericRating
        );


      const finalProfessionalism =
        getSafeScore(
          professionalism,
          numericRating
        );


      const finalCommunication =
        getSafeScore(
          communication,
          numericRating
        );


      const finalResponseTime =
        getSafeScore(
          responseTime,
          numericRating
        );


      // =================================================
      // CREATE REVIEW
      // =================================================

      const review =
        await prisma.review.create({

          data: {

            serviceRequestId:
              finalServiceRequestId,

            technicianId:
              technicianId,

            rating:
              numericRating,

            serviceQuality:
              finalServiceQuality,

            professionalism:
              finalProfessionalism,

            communication:
              finalCommunication,

            responseTime:
              finalResponseTime,

            comment:
              String(
                comment ||
                ''
              ).trim()
          }
        });


      // =================================================
      // RECALCULATE TECHNICIAN AVERAGE RATING
      // =================================================

      const technicianReviews =
        await prisma.review.findMany({

          where: {
            technicianId:
              technicianId
          },

          select: {
            rating:
              true
          }
        });


      const ratingTotal =
        technicianReviews.reduce(

          (
            total,
            item
          ) => {

            return (
              total +
              Number(
                item.rating
              )
            );
          },

          0
        );


      const averageRating =
        technicianReviews.length > 0

          ? Number(
              (
                ratingTotal /
                technicianReviews.length
              ).toFixed(
                1
              )
            )

          : numericRating;


      // =================================================
      // UPDATE TECHNICIAN RATING
      // =================================================

      await prisma.technician.update({

        where: {
          id:
            technicianId
        },

        data: {
          rating:
            averageRating
        }
      });


      // =================================================
      // SUCCESS
      // =================================================

      return res.status(201).json({

        success:
          true,

        message:
          'Review submitted successfully.',

        data: {

          review,

          newTechnicianRating:
            averageRating
        }
      });


    } catch (error) {

      console.error(
        'Create review error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while submitting review.',

        details:
          error.message
      });
    }
  };


// ======================================================
// GET TECHNICIAN REVIEWS
//
// GET
// /api/reviews/technician/:technicianId
// ======================================================

export const getTechnicianReviews =
  async (
    req,
    res
  ) => {

    try {

      const {
        technicianId
      } = req.params;


      if (!technicianId) {

        return res.status(400).json({

          success:
            false,

          message:
            'Technician ID is required.'
        });
      }


      const reviews =
        await prisma.review.findMany({

          where: {
            technicianId:
              technicianId
          },

          include: {

            serviceRequest:
              true
          },

          orderBy: {
            createdAt:
              'desc'
          }
        });


      // =================================================
      // AVERAGE
      // =================================================

      const totalRating =
        reviews.reduce(

          (
            total,
            review
          ) => {

            return (
              total +
              Number(
                review.rating
              )
            );
          },

          0
        );


      const averageRating =
        reviews.length > 0

          ? Number(
              (
                totalRating /
                reviews.length
              ).toFixed(
                1
              )
            )

          : 0;


      return res.json({

        success:
          true,

        count:
          reviews.length,

        averageRating,

        data:
          reviews
      });


    } catch (error) {

      console.error(
        'Get technician reviews error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while loading technician reviews.',

        details:
          error.message
      });
    }
  };


// ======================================================
// GET REVIEW BY SERVICE REQUEST
//
// GET
// /api/reviews/request/:serviceRequestId
// ======================================================

export const getReviewByServiceRequest =
  async (
    req,
    res
  ) => {

    try {

      const {
        serviceRequestId
      } = req.params;


      if (!serviceRequestId) {

        return res.status(400).json({

          success:
            false,

          message:
            'Service request ID is required.'
        });
      }


      const review =
        await prisma.review.findUnique({

          where: {
            serviceRequestId:
              serviceRequestId
          },

          include: {

            technician:
              true,

            serviceRequest:
              true
          }
        });


      return res.json({

        success:
          true,

        reviewed:
          Boolean(
            review
          ),

        data:
          review ||
          null
      });


    } catch (error) {

      console.error(
        'Get review by service request error:',
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          'Server error while loading review.',

        details:
          error.message
      });
    }
  };