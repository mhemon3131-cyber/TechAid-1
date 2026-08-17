// Member 1 Route - Module 3 Feature: Issue Resolution History
import express from 'express';
import { getResolutionHistory, getResolutionDetail } from '../controllers/historyController.js';

const router = express.Router();

router.get('/detail/:trackingId', getResolutionDetail);
router.get('/:customerId', getResolutionHistory);

export default router;
