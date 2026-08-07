// In-Memory and Prisma Database Store for TechAid
import { PrismaClient } from '@prisma/client';

let prisma;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.warn("Prisma client initializing in fallback mode.");
}

// Default Seed Data matching Figma Prototype Screen
export const mockDatabase = {
  users: [
    { id: 'usr-1', name: 'Mehedi Hasan', email: 'mehedi@bracu.ac.bd', role: 'CUSTOMER' },
    { id: 'usr-2', name: 'Rafiq Ahmed', email: 'rafiq@techaid.com', role: 'TECHNICIAN' },
    { id: 'usr-3', name: 'Sara Noor', email: 'sara@techaid.com', role: 'TECHNICIAN' }
  ],
  technicians: [
    {
      id: 'tech-1',
      userId: 'usr-2',
      name: 'Rafiq Ahmed',
      specialty: 'Laptop & desktop specialist',
      rating: 4.9,
      distanceKm: 2.1,
      isAvailable: true,
      avatar: 'RA'
    },
    {
      id: 'tech-2',
      userId: 'usr-3',
      name: 'Sara Noor',
      specialty: 'Smartphone repair & OS recovery',
      rating: 4.7,
      distanceKm: 3.7,
      isAvailable: true,
      avatar: 'SN'
    }
  ],
  serviceRequests: [
    {
      id: 'req-101',
      trackingId: 'REQ-2026-8942',
      customerId: 'usr-1',
      deviceCategory: 'Laptop',
      title: 'Laptop won\'t turn on after update',
      description: 'Laptop won\'t turn on after the last update, black screen even when plugged in...',
      urgency: 'Critical',
      serviceMethod: 'Live Chat',
      status: 'PENDING',
      estimatedCost: '৳800 - 1,500',
      attachments: [
        { id: 'att-1', fileUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500', fileType: 'SCREENSHOT', fileName: 'error_screen.jpg' }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  appointments: [
    {
      id: 'app-501',
      serviceRequestId: 'req-101',
      customerId: 'usr-1',
      customerName: 'Mehedi Hasan',
      technicianId: 'tech-1',
      technicianName: 'Rafiq Ahmed',
      date: 'Mon Jul 13, 2026',
      timeSlot: '10:00 am',
      serviceType: 'Remote support',
      status: 'PENDING',
      estimatedCost: '৳800 - 1,500',
      createdAt: new Date().toISOString()
    }
  ]
};

export default prisma;
