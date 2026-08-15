import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TechAid database with real users and technicians...');

  // 1. Customer User (Mehedi Hasan)
  const customerUser = await prisma.user.upsert({
    where: { email: 'mehedi@bracu.ac.bd' },
    update: {},
    create: {
      id: 'usr-1',
      name: 'Mehedi Hasan',
      email: 'mehedi@bracu.ac.bd',
      password: '123',
      role: 'CUSTOMER',
      phone: '+8801700000000',
      avatar: 'MH'
    }
  });

  // 2. Technician 1 User & Profile (Rafiq Ahmed)
  const rafiqUser = await prisma.user.upsert({
    where: { email: 'rafiq@techaid.com' },
    update: {},
    create: {
      id: 'usr-2',
      name: 'Rafiq Ahmed',
      email: 'rafiq@techaid.com',
      password: '123',
      role: 'TECHNICIAN',
      phone: '+8801800000000',
      avatar: 'RA'
    }
  });

  const rafiqTech = await prisma.technician.upsert({
    where: { userId: rafiqUser.id },
    update: {},
    create: {
      id: 'tech-1',
      userId: rafiqUser.id,
      name: 'Rafiq Ahmed',
      specialty: 'Laptop & Desktop Specialist',
      rating: 4.9,
      distanceKm: 2.1,
      isAvailable: true,
      avatar: 'RA',
      availableDays: 'Mon,Tue,Wed,Thu,Fri',
      workingHours: '09:00 AM - 06:00 PM',
      serviceAreas: 'Gulshan, Banani, Dhanmondi, Uttara',
      maxDailyAppointments: 5
    }
  });

  // 3. Technician 2 User & Profile (Sara Noor)
  const saraUser = await prisma.user.upsert({
    where: { email: 'sara@techaid.com' },
    update: {},
    create: {
      id: 'usr-3',
      name: 'Sara Noor',
      email: 'sara@techaid.com',
      password: '123',
      role: 'TECHNICIAN',
      phone: '+8801900000000',
      avatar: 'SN'
    }
  });

  const saraTech = await prisma.technician.upsert({
    where: { userId: saraUser.id },
    update: {},
    create: {
      id: 'tech-2',
      userId: saraUser.id,
      name: 'Sara Noor',
      specialty: 'Smartphone Repair & OS Recovery',
      rating: 4.7,
      distanceKm: 3.7,
      isAvailable: true,
      avatar: 'SN',
      availableDays: 'Mon,Wed,Fri,Sat',
      workingHours: '10:00 AM - 05:00 PM',
      serviceAreas: 'Dhanmondi, Mohakhali, Mirpur',
      maxDailyAppointments: 4
    }
  });

  // 4. Initial Sample Service Request
  const sampleRequest = await prisma.serviceRequest.upsert({
    where: { trackingId: 'REQ-2026-8942' },
    update: {},
    create: {
      id: 'req-101',
      trackingId: 'REQ-2026-8942',
      customerId: customerUser.id,
      deviceCategory: 'Laptop',
      title: 'Laptop won\'t turn on after update',
      description: 'Laptop won\'t turn on after the last update, black screen even when plugged in...',
      urgency: 'Critical',
      serviceMethod: 'Home Visit',
      status: 'IN_PROGRESS',
      estimatedCost: '৳800 - 1,500',
      statusLogs: {
        create: [
          { status: 'PENDING', note: 'Service request created by customer.' },
          { status: 'ASSIGNED', note: 'Assigned to Technician Rafiq Ahmed.' },
          { status: 'ACCEPTED', note: 'Technician accepted the job.' },
          { status: 'IN_PROGRESS', note: 'Technician is diagnosing hardware issue.' }
        ]
      }
    }
  });

  // 5. Initial Sample Appointment
  await prisma.appointment.upsert({
    where: { serviceRequestId: sampleRequest.id },
    update: {},
    create: {
      id: 'app-501',
      serviceRequestId: sampleRequest.id,
      customerId: customerUser.id,
      technicianId: rafiqTech.id,
      date: 'Mon 13',
      timeSlot: '10:00 am',
      serviceType: 'Home Visit',
      status: 'APPROVED',
      estimatedCost: '৳800 - 1,500'
    }
  });

  console.log('Database seeded with real records successfully!', { customerUser, rafiqTech, saraTech });
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
