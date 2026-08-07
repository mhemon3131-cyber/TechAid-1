// Module 1 Controller: Service Request Creation
import { mockDatabase } from '../db.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Helper function to generate unique tracking ID e.g. REQ-2026-8942
const generateTrackingId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `REQ-2026-${randomNum}`;
};

// @desc    Create a new Service Request (Module 1)
// @route   POST /api/requests
export const createServiceRequest = async (req, res) => {
  try {
    const {
      deviceCategory,
      title,
      description,
      urgency,
      serviceMethod,
      attachments = []
    } = req.body;

    if (!deviceCategory || !description || !urgency || !serviceMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide device category, description, urgency, and service method.'
      });
    }

    const trackingId = generateTrackingId();
    
    // Process Cloudinary uploads if any files attached
    const processedAttachments = [];
    for (const file of attachments) {
      const cloudinaryResult = await uploadToCloudinary(null, file.name || 'attachment.png', file.type);
      processedAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fileUrl: file.url || cloudinaryResult.url,
        fileType: file.type || 'IMAGE',
        fileName: file.name || 'Uploaded File'
      });
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      trackingId,
      customerId: 'usr-1',
      deviceCategory,
      title: title || `${deviceCategory} Technical Support Request`,
      description,
      urgency,
      serviceMethod,
      status: 'PENDING',
      estimatedCost: urgency === 'Critical' ? '৳1,200 - 2,000' : '৳800 - 1,500',
      attachments: processedAttachments,
      createdAt: new Date().toISOString()
    };

    mockDatabase.serviceRequests.unshift(newRequest);

    res.status(201).json({
      success: true,
      message: 'Service request created successfully with unique tracking ID.',
      data: newRequest
    });

  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ success: false, message: 'Server error while creating request.' });
  }
};

// @desc    Get all Service Requests
// @route   GET /api/requests
export const getAllServiceRequests = async (req, res) => {
  res.json({
    success: true,
    count: mockDatabase.serviceRequests.length,
    data: mockDatabase.serviceRequests
  });
};

// @desc    Get single request by Tracking ID
// @route   GET /api/requests/:trackingId
export const getRequestByTrackingId = async (req, res) => {
  const { trackingId } = req.params;
  const request = mockDatabase.serviceRequests.find(r => r.trackingId === trackingId);
  
  if (!request) {
    return res.status(404).json({ success: false, message: 'Service request not found.' });
  }

  res.json({ success: true, data: request });
};
