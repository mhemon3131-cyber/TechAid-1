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

  // 4. Technician 3 User & Profile (Alex)
  const alexUser = await prisma.user.upsert({
    where: { email: 'alex@techaid.com' },
    update: {},
    create: {
      id: 'usr-4',
      name: 'Alex',
      email: 'alex@techaid.com',
      password: '123',
      role: 'TECHNICIAN',
      phone: '+8801600000000',
      avatar: 'AL'
    }
  });

  const alexTech = await prisma.technician.upsert({
    where: { userId: alexUser.id },
    update: {},
    create: {
      id: 'tech-3',
      userId: alexUser.id,
      name: 'Alex',
      specialty: 'Network & Printer Specialist',
      rating: 4.8,
      distanceKm: 2.5,
      isAvailable: true,
      avatar: 'AL',
      availableDays: 'Mon,Tue,Thu,Sat',
      workingHours: '09:00 AM - 05:00 PM',
      serviceAreas: 'Banani, Uttara, Gulshan',
      maxDailyAppointments: 5
    }
  });

  // 5. Initial Sample Service Requests
  const req1 = await prisma.serviceRequest.upsert({
    where: { trackingId: 'REQ-2026-8942' },
    update: {},
    create: {
      id: 'req-101',
      trackingId: 'REQ-2026-8942',
      customerId: customerUser.id,
      technicianId: rafiqUser.id,
      deviceCategory: 'Laptop',
      title: 'Laptop won\'t turn on after update',
      description: 'Laptop won\'t turn on after the last update, black screen even when plugged in...',
      urgency: 'Critical',
      serviceMethod: 'Live Chat',
      status: 'IN_PROGRESS',
      estimatedCost: '৳800 - 1,500',
      statusLogs: {
        create: [
          { status: 'PENDING', note: 'Service request created by customer.' },
          { status: 'ACCEPTED', note: 'Technician accepted the job.' }
        ]
      }
    }
  });

  const req2 = await prisma.serviceRequest.upsert({
    where: { trackingId: 'REQ-2026-8943' },
    update: {},
    create: {
      id: 'req-102',
      trackingId: 'REQ-2026-8943',
      customerId: customerUser.id,
      technicianId: saraUser.id,
      deviceCategory: 'Phone',
      title: 'Smartphone Screen & Battery Recovery',
      description: 'Touch screen unresponsive and battery draining within 1 hour...',
      urgency: 'Moderate',
      serviceMethod: 'Live Chat',
      status: 'IN_PROGRESS',
      estimatedCost: '৳1,000 - 2,000',
      statusLogs: {
        create: [
          { status: 'PENDING', note: 'Service request created by customer.' },
          { status: 'ACCEPTED', note: 'Technician Sara Noor accepted the job.' }
        ]
      }
    }
  });

  const req3 = await prisma.serviceRequest.upsert({
    where: { trackingId: 'REQ-2026-8944' },
    update: {},
    create: {
      id: 'req-103',
      trackingId: 'REQ-2026-8944',
      customerId: customerUser.id,
      technicianId: alexUser.id,
      deviceCategory: 'Internet',
      title: 'Office Router & Wi-Fi Configuration',
      description: 'High latency and frequent disconnects across all office laptops...',
      urgency: 'High',
      serviceMethod: 'Video Call',
      status: 'ACCEPTED',
      estimatedCost: '৳1,200 - 2,500',
      statusLogs: {
        create: [
          { status: 'PENDING', note: 'Service request created by customer.' },
          { status: 'ACCEPTED', note: 'Technician Alex accepted the job.' }
        ]
      }
    }
  });

  // 6. Conversations for all 3 technicians
  const conv1 = await prisma.conversation.upsert({
    where: { serviceRequestId: req1.id },
    update: {},
    create: {
      id: 'conv_req-101',
      serviceRequestId: req1.id,
      customerId: customerUser.id,
      technicianId: rafiqUser.id,
    }
  });

  const conv2 = await prisma.conversation.upsert({
    where: { serviceRequestId: req2.id },
    update: {},
    create: {
      id: 'conv_req-102',
      serviceRequestId: req2.id,
      customerId: customerUser.id,
      technicianId: saraUser.id,
    }
  });

  const conv3 = await prisma.conversation.upsert({
    where: { serviceRequestId: req3.id },
    update: {},
    create: {
      id: 'conv_req-103',
      serviceRequestId: req3.id,
      customerId: customerUser.id,
      technicianId: alexUser.id,
    }
  });

  // 7. Seed sample initial messages showing both Customer & Technician names!
  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: customerUser.id,
        content: 'Hello Rafiq, my laptop screen stays black after turning it on.',
        createdAt: new Date(Date.now() - 300000)
      },
      {
        conversationId: conv1.id,
        senderId: rafiqUser.id,
        content: 'Hello Mehedi! Does the power LED light up when you press the power button?',
        createdAt: new Date(Date.now() - 240000)
      },
      {
        conversationId: conv2.id,
        senderId: customerUser.id,
        content: 'Hi Sara, my phone battery drops from 100% to 20% in 30 minutes.',
        createdAt: new Date(Date.now() - 180000)
      },
      {
        conversationId: conv2.id,
        senderId: saraUser.id,
        content: 'Hi Mehedi! I can help replace the battery and check background battery drainage.',
        createdAt: new Date(Date.now() - 120000)
      },
      {
        conversationId: conv3.id,
        senderId: customerUser.id,
        content: 'Hey Alex, our Wi-Fi disconnects every 10 minutes.',
        createdAt: new Date(Date.now() - 60000)
      },
      {
        conversationId: conv3.id,
        senderId: alexUser.id,
        content: 'Hello Mehedi! I will guide you through resetting your router MTU and DNS settings.',
        createdAt: new Date(Date.now() - 30000)
      }
    ]
  }).catch(() => null);

  console.log('Database seeded with real records for all 3 technicians!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
