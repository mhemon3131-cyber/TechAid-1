import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
// Member 1 Routes
import aiRoutes from './routes/aiRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import costEstimationRoutes from './routes/costEstimationRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/technicians', technicianRoutes);
// Member 1 Endpoints
app.use('/api/ai', aiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/cost-estimate', costEstimationRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    project: 'TechAid - Interactive Tech Support & Troubleshooting System',
    status: 'Backend API Server Running with Prisma Database Persistence',
    modulesImplemented: [
      'Auth: Customer & Technician Login API',
      'Module 1: Service Request Creation & Cloudinary Upload',
      'Module 2: Appointment Scheduling System & Conflict Check & EmailJS',
      'Module 3: Technician Availability Management & Progress Tracking',
      'Member 1 - Module 1: AI-Powered Issue Classification',
      'Member 1 - Module 2: Interactive AI Troubleshooting Assistant',
      'Member 1 - Module 3: Issue Resolution History',
      'Member 1 - Module 3: Service Cost Estimation System'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` TechAid Backend Server listening on port ${PORT}`);
  console.log(` Base URL: http://localhost:${PORT}`);
  console.log(` Database: Prisma ORM persistence active`);
  console.log(`====================================================`);
});
