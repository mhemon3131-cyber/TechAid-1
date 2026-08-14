// Module 1 & Module 3 Feature 4 Controller: Real Prisma Database Operations
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const prisma = new PrismaClient();

// Helper to generate unique tracking ID e.g. REQ-2026-8942
const generateTrackingId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `REQ-2026-${randomNum}`;
};

// @desc    Create a new Service Request (Module 1 - Prisma DB)
// @route   POST /api/requests
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

    if (!deviceCategory || !description || !urgency || !serviceMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide device category, description, urgency, and service method.'
      });
    }

    const trackingId = generateTrackingId();

    // 1. Process Cloudinary uploads
    const processedAttachments = [];
    for (const file of attachments) {
      const cloudinaryResult = await uploadToCloudinary(null, file.name || 'attachment.png', file.type);
      processedAttachments.push({
        fileUrl: file.url || cloudinaryResult.url,
        fileType: file.type || 'IMAGE',
        fileName: file.name || 'Uploaded File'
      });
    }

    // Default to Customer Mehedi Hasan if customerId not passed
    const custId = customerId || 'usr-1';

    // 2. Save directly to Prisma Database
    const newRequest = await prisma.serviceRequest.create({
      data: {
        trackingId,
        customerId: custId,
        deviceCategory,
        title: title || `${deviceCategory} Support: ${description.slice(0, 30)}...`,
        description,
        urgency,
        serviceMethod,
        status: 'PENDING',
        estimatedCost: urgency === 'Critical' ? '৳1,200 - 2,000' : '৳800 - 1,500',
        attachments: {
          create: processedAttachments
        },
        statusLogs: {
          create: [
            {
              status: 'PENDING',
              note: 'Service request created by customer in database.'
            }
          ]
        }
      },
      include: {
        attachments: true,
        statusLogs: true,
        customer: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Service request created successfully in Prisma database with unique tracking ID.',
      data: newRequest
    });

  } catch (error) {
    console.error('Error creating service request in DB:', error);
    res.status(500).json({ success: false, message: 'Server database error while creating request.' });
  }
};

// @desc    Get all Service Requests from Prisma DB
// @route   GET /api/requests
export const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      include: {
        attachments: true,
        customer: true,
        statusLogs: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ success: false, message: 'Database error fetching requests.' });
  }
};

// @desc    Get single request by Tracking ID from Prisma DB
// @route   GET /api/requests/:trackingId
export const getRequestByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const request = await prisma.serviceRequest.findFirst({
      where: {
        OR: [
          { trackingId: trackingId.toUpperCase() },
          { id: trackingId }
        ]
      },
      include: {
        attachments: true,
        customer: true,
        statusLogs: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found in database.' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database query error.' });
  }
};

// @desc    Get Progress Tracking Logs from Prisma DB (Module 3 Feature 4)
// @route   GET /api/requests/:trackingId/progress
export const getServiceProgress = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const request = await prisma.serviceRequest.findFirst({
      where: {
        OR: [
          { trackingId: trackingId.toUpperCase() },
          { id: trackingId }
        ]
      },
      include: {
        statusLogs: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request tracking ID not found in database.' });
    }

    const stagesOrder = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_THE_WAY', 'COMPLETED'];
    const currentStageIndex = stagesOrder.indexOf(request.status);

    res.json({
      success: true,
      data: {
        trackingId: request.trackingId,
        deviceCategory: request.deviceCategory,
        title: request.title,
        currentStatus: request.status,
        currentStageIndex: currentStageIndex >= 0 ? currentStageIndex : 0,
        stages: stagesOrder,
        logs: request.statusLogs || [],
        updatedAt: request.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Database error reading progress.' });
  }
};

// @desc    Update Service Request Status Stage in Prisma DB (Module 3 Feature 4)
// @route   PUT /api/requests/:id/status
export const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, technicianId } = req.body;

    const validStatuses = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_THE_WAY', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status stage.` });
    }

    // Update Request and append to StatusHistory table
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status,
        ...(technicianId && { technicianId }),
        statusLogs: {
          create: {
            status,
            note: note || `Status updated to ${status}.`
          }
        }
      },
      include: { statusLogs: true, customer: true }
    });

    // Auto-create Conversation when request is ACCEPTED
    if (status === 'ACCEPTED' && updated.technicianId) {
      await prisma.conversation.upsert({
        where: { serviceRequestId: id },
        create: {
          serviceRequestId: id,
          customerId: updated.customerId,
          technicianId: updated.technicianId,
        },
        update: {
          technicianId: updated.technicianId,
        },
      }).catch(() => null);
    }

    // Trigger Notification
    try {
      const { createNotificationHelper } = await import('./notificationController.js');
      await createNotificationHelper({
        userId: updated.customerId,
        userEmail: updated.customer?.email,
        type: `REQUEST_${status}`,
        title: `Service Request #${updated.trackingId || id} Updated`,
        message: `Your technical issue "${updated.title}" status is now ${status}.`,
      });
    } catch (e) {
      console.log('Notification trigger skipped:', e.message);
    }

    res.json({
      success: true,
      message: `Service progress stage updated to ${status} in Prisma database.`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating status in DB:', error);
    res.status(500).json({ success: false, message: 'Database error updating status.' });
  }
};

// @desc    Get Emergency Support Queue (Priority 1)
// @route   GET /api/requests/emergency/queue
export const getEmergencyQueue = async (req, res) => {
  try {
    const emergencyRequests = await prisma.serviceRequest.findMany({
      where: {
        OR: [{ urgency: 'Emergency' }, { urgency: 'Critical' }, { urgency: 'EMERGENCY' }],
        status: 'PENDING',
      },
      include: {
        customer: true,
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      count: emergencyRequests.length,
      data: emergencyRequests,
    });
  } catch (error) {
    console.error('Get emergency queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emergency support queue.' });
  }
};

