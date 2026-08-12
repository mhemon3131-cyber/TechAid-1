import express from 'express';
import { loginUser, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me/:email', getCurrentUser);

export default router;
