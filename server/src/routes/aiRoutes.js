// Member 1 Routes
// Module 1 Feature 1: AI-Powered Issue Classification
// Module 2 Feature 1: Interactive AI Troubleshooting Assistant
import express from 'express';
import { classifyIssue } from '../controllers/aiClassificationController.js';
import { troubleshootChat } from '../controllers/aiTroubleshootController.js';

const router = express.Router();

router.post('/classify', classifyIssue);
router.post('/troubleshoot', troubleshootChat);

export default router;
