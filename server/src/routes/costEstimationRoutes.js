// Member 1 Route - Module 3 Feature: Service Cost Estimation System
import express from 'express';
import { estimateServiceCost } from '../controllers/costEstimationController.js';

const router = express.Router();

router.post('/', estimateServiceCost);

export default router;
