import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';

import technicianAssignmentRoutes from './routes/technicianAssignmentRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/technicians', technicianRoutes);

app.use('/api/assignments', technicianAssignmentRoutes);
app.use('/api/locations', locationRoutes);

app.get('/', (req, res) => {
  res.json({
    project: 'TechAid - Interactive Tech Support & Troubleshooting System',

    status:
      'Backend API Server Running with Prisma Database Persistence',

    modulesImplemented: [
      'Auth: Customer & Technician Login API',

      'Module 1: Service Request Creation & Cloudinary Upload',

      'Module 1 Feature 4: Automatic Technician Assignment Engine',

      'Module 1 Feature 4: OpenStreetMap Location & Map Pin Support',

      'Module 2: Appointment Scheduling System & Conflict Check & EmailJS',

      'Module 3: Technician Availability Management & Progress Tracking'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` TechAid Backend Server listening on port ${PORT}`);
  console.log(` Base URL: http://localhost:${PORT}`);
  console.log(` Database: Prisma ORM persistence active`);
  console.log(
    ` Member 4 Assignment API: http://localhost:${PORT}/api/assignments`
  );
  console.log(
    ` Member 4 Location API: http://localhost:${PORT}/api/locations`
  );
  console.log(`====================================================`);
});