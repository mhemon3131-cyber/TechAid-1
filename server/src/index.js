import express from 'express';
import http from 'http';
import cors from 'cors';

import {
  Server as SocketIOServer
} from 'socket.io';


// ==========================================================
// EXISTING CORE ROUTES
// ==========================================================

import authRoutes from './routes/authRoutes.js';

import requestRoutes from './routes/requestRoutes.js';

import appointmentRoutes from './routes/appointmentRoutes.js';

import technicianRoutes from './routes/technicianRoutes.js';


// ==========================================================
// MEMBER 4 ROUTES
// ==========================================================

import technicianAssignmentRoutes
  from './routes/technicianAssignmentRoutes.js';

import locationRoutes
  from './routes/locationRoutes.js';

import reviewRoutes
  from './routes/reviewRoutes.js';

import paymentRoutes
  from './routes/paymentRoutes.js';


// ==========================================================
// MAIN BRANCH ROUTES
// ==========================================================

import notificationRoutes
  from './routes/notificationRoutes.js';

import conversationRoutes
  from './routes/conversationRoutes.js';

import aiRoutes
  from './routes/aiRoutes.js';

import historyRoutes
  from './routes/historyRoutes.js';

import costEstimationRoutes
  from './routes/costEstimationRoutes.js';


// ==========================================================
// SOCKET.IO
// ==========================================================

import {
  initSocket
} from './socket/socketHandler.js';


// ==========================================================
// EXPRESS APP
// ==========================================================

const app =
  express();


// ==========================================================
// PORTS
//
// Existing Member 4 frontend:
// localhost:5000
//
// Main branch / teammate realtime features:
// localhost:1257
//
// Same Express API will temporarily work on BOTH ports.
// ==========================================================

const PRIMARY_PORT =
  Number(
    process.env.PORT
  ) ||
  5000;


const TEAM_PORT =
  1257;


// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(
  cors({
    origin:
      '*',

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ]
  })
);


app.use(
  express.json({
    limit:
      '10mb'
  })
);


// ==========================================================
// API ROUTES
// ==========================================================

// Authentication
app.use(
  '/api/auth',
  authRoutes
);


// Service requests
app.use(
  '/api/requests',
  requestRoutes
);


// Appointments
app.use(
  '/api/appointments',
  appointmentRoutes
);


// Technician profile / availability
app.use(
  '/api/technicians',
  technicianRoutes
);


// ==========================================================
// MEMBER 4 APIs
// ==========================================================

// Automatic technician assignment
app.use(
  '/api/assignments',
  technicianAssignmentRoutes
);


// Location / map support
app.use(
  '/api/locations',
  locationRoutes
);


// Rating & Review
app.use(
  '/api/reviews',
  reviewRoutes
);


// Stripe payment & invoice
app.use(
  '/api/payments',
  paymentRoutes
);


// ==========================================================
// MAIN BRANCH APIs
// ==========================================================

// Notification system
app.use(
  '/api/notifications',
  notificationRoutes
);


// Live chat / conversation
app.use(
  '/api/conversations',
  conversationRoutes
);


// AI features
app.use(
  '/api/ai',
  aiRoutes
);


// Issue history
app.use(
  '/api/history',
  historyRoutes
);


// Service cost estimator
app.use(
  '/api/cost-estimate',
  costEstimationRoutes
);


// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get(
  '/',
  (
    req,
    res
  ) => {

    return res.json({

      project:
        'TechAid - Interactive Tech Support & Troubleshooting System',

      status:
        'Backend API Server Running with Prisma Database and Socket.IO',

      ports: {
        primary:
          PRIMARY_PORT,

        teammate:
          TEAM_PORT
      },

      modulesImplemented: [

        'Auth: Customer & Technician Login API',

        'Module 1: Service Request Creation & Cloudinary Upload',

        'Module 1 Feature 4: Automatic Technician Assignment Engine',

        'Module 1 Feature 4: OpenStreetMap Location & Map Pin Support',

        'Module 2: Appointment Scheduling System & Conflict Check',

        'Module 2 Feature 4: Secure Payment & Invoice System with Stripe Test Mode',

        'Module 3: Technician Availability Management & Progress Tracking',

        'Module 3 Feature 4: Rating & Review System',

        'Real-Time Communication: Chat / Voice / Video',

        'Notification & Reminder System',

        'Emergency Support Queue',

        'AI Issue Classification & Troubleshooting',

        'Issue Resolution History',

        'Service Cost Estimation'
      ]
    });
  }
);


// ==========================================================
// PRIMARY SERVER
//
// Used by existing Member 4 features:
// http://localhost:5000
// ==========================================================

const primaryServer =
  http.createServer(
    app
  );


const primaryIO =
  new SocketIOServer(
    primaryServer,
    {
      cors: {

        origin:
          '*',

        methods: [
          'GET',
          'POST',
          'PUT',
          'PATCH',
          'DELETE'
        ]
      }
    }
  );


initSocket(
  primaryIO
);


// ==========================================================
// START PRIMARY SERVER
// ==========================================================

primaryServer.listen(
  PRIMARY_PORT,
  () => {

    console.log(
      '===================================================='
    );

    console.log(
      ` TechAid Backend Server running on port ${PRIMARY_PORT}`
    );

    console.log(
      ` Primary URL: http://localhost:${PRIMARY_PORT}`
    );

    console.log(
      ' Database: Prisma ORM persistence active'
    );

    console.log(
      ' Socket.IO: Real-time engine active'
    );

    console.log(
      ` Assignment API: http://localhost:${PRIMARY_PORT}/api/assignments`
    );

    console.log(
      ` Location API: http://localhost:${PRIMARY_PORT}/api/locations`
    );

    console.log(
      ` Review API: http://localhost:${PRIMARY_PORT}/api/reviews`
    );

    console.log(
      ` Payment API: http://localhost:${PRIMARY_PORT}/api/payments`
    );

    console.log(
      '===================================================='
    );
  }
);


// ==========================================================
// SECONDARY TEAM SERVER
//
// Some main-branch frontend files currently use:
// http://localhost:1257
//
// Same API is exposed here so those teammate features
// continue working without changing their frontend code.
// ==========================================================

if (
  TEAM_PORT !==
  PRIMARY_PORT
) {

  const teamServer =
    http.createServer(
      app
    );


  const teamIO =
    new SocketIOServer(
      teamServer,
      {
        cors: {

          origin:
            '*',

          methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE'
          ]
        }
      }
    );


  initSocket(
    teamIO
  );


  teamServer.listen(
    TEAM_PORT,
    () => {

      console.log(
        ` Team compatibility server running on port ${TEAM_PORT}`
      );

      console.log(
        ` Team URL: http://localhost:${TEAM_PORT}`
      );

      console.log(
        ` Chat API: http://localhost:${TEAM_PORT}/api/conversations`
      );

      console.log(
        ` Notification API: http://localhost:${TEAM_PORT}/api/notifications`
      );

      console.log(
        ` AI API: http://localhost:${TEAM_PORT}/api/ai`
      );

      console.log(
        '===================================================='
      );
    }
  );
}