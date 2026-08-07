import express from 'express';
import {
  createServiceRequest,
  getAllServiceRequests,
  getRequestByTrackingId
} from '../controllers/requestController.js';

const router = express.Router();

router.post('/', createServiceRequest);
router.get('/', getAllServiceRequests);
router.get('/:trackingId', getRequestByTrackingId);

export default router;
