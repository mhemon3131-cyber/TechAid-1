import express from 'express';
import cors from 'cors';
import requestRoutes from './routes/requestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// REST API Endpoints
app.use('/api/requests', requestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/technicians', technicianRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    project: 'TechAid - Interactive Tech Support & Troubleshooting System',
    author: 'Member 2 (ID: 23201345 - Mehedi Hasan)',
    status: 'Backend API Server Running',
    modulesImplemented: [
      'Module 1: Service Request Creation & Cloudinary Upload',
      'Module 2: Appointment Scheduling System & Conflict Check & EmailJS'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` TechAid Backend Server listening on port ${PORT}`);
  console.log(` Base URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
