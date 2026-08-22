import express from 'express';
import {
  createServiceRequest,
  getAllServiceRequests,
  getRequestByTrackingId,
  getServiceProgress,
  updateServiceStatus
} from '../controllers/requestController.js';

const router = express.Router();

router.post('/', createServiceRequest);
router.get('/', getAllServiceRequests);
router.get('/:trackingId', getRequestByTrackingId);
router.get('/:trackingId/progress', getServiceProgress);
router.put('/:id/status', updateServiceStatus);

export default router;
