import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import { initSocket } from './socket/socketHandler.js';
import aiRoutes from './routes/aiRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import costEstimationRoutes from './routes/costEstimationRoutes.js';
const app = express();
const server = http.createServer(app);
const PORT = 1257; // Last 4 digits of Student ID: 24141257

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});
initSocket(io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/cost-estimate', costEstimationRoutes);
// Health Check Route
app.get('/', (req, res) => {
  res.json({
    project: 'TechAid - Interactive Tech Support & Troubleshooting System',
    status: 'Backend API Server Running with Prisma & Socket.IO Persistence',
    studentId: '24141257',
    port: PORT,
    modulesImplemented: [
      'Auth: Customer & Technician Login API',
      'Module 1: Service Request Creation & Cloudinary Upload',
      'Module 2: Appointment Scheduling System & Real-Time Communication (Chat/Voice/Video)',
      'Module 3: Notification & Reminder System, Emergency Queue & Progress Tracking'
    ]
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` TechAid Backend Server listening on port ${PORT}`);
  console.log(` Base URL: http://localhost:${PORT} or http://127.0.0.1:${PORT}`);
  console.log(` Database: Prisma ORM & Socket.IO Real-Time Engine Active`);
  console.log(`====================================================`);
});
