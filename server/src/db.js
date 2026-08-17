// In-Memory and Prisma Database Store for TechAid
import { PrismaClient } from '@prisma/client';

let prisma;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.warn("Prisma client initializing in fallback mode.");
}

// Default Seed Data matching dynamic user accounts
export const mockDatabase = {
  users: [
    { id: 'usr-1', name: 'Claire', email: 'claire@techaid.com', role: 'CUSTOMER' },
    { id: 'usr-4', name: 'TechAlex', email: 'techalex@techaid.com', role: 'TECHNICIAN' }
  ],
  technicians: [
    {
      id: 'tech-4',
      userId: 'usr-4',
      name: 'TechAlex',
      specialty: 'Networking & Wi-Fi Specialist',
      rating: 4.9,
      distanceKm: 2.1,
      isAvailable: true,
      avatar: 'TA',
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: '09:00 AM - 06:00 PM',
      serviceAreas: ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara'],
      maxDailyAppointments: 5
    }
  ],
  serviceRequests: [
    {
      id: 'req-101',
      trackingId: 'REQ-2026-8942',
      customerId: 'usr-1',
      deviceCategory: 'Internet',
      title: 'Office Router & Wi-Fi Configuration',
      description: 'Customer requested assistance configuring office router and network security.',
      urgency: 'Critical',
      serviceMethod: 'Remote Support',
      status: 'IN_PROGRESS',
      estimatedCost: '৳800 - 1,500',
      attachments: [],
      statusLogs: [
        { id: 'log-1', status: 'PENDING', note: 'Service request created by customer.', timestamp: new Date().toISOString() },
        { id: 'log-2', status: 'ASSIGNED', note: 'Assigned to Technician TechAlex.', timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  appointments: []
};

export { prisma };
export default prisma;
