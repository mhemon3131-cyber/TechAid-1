import express from 'express';
import { getTechnicians } from '../controllers/technicianController.js';

const router = express.Router();

router.get('/', getTechnicians);

export default router;
