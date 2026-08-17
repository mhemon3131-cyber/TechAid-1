import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TechAid database with active user accounts...');

  // 1. Customer User (Claire)
  const customerUser = await prisma.user.upsert({
    where: { email: 'claire@techaid.com' },
    update: { name: 'Claire' },
    create: {
      id: 'usr-1',
      name: 'Claire',
      email: 'claire@techaid.com',
      password: '123',
      role: 'CUSTOMER',
      phone: '+8801700000000',
      avatar: 'CL'
    }
  });

  // 2. Technician User & Profile (TechAlex)
  const alexUser = await prisma.user.upsert({
    where: { email: 'techalex@techaid.com' },
    update: { name: 'TechAlex' },
    create: {
      id: 'usr-4',
      name: 'TechAlex',
      email: 'techalex@techaid.com',
      password: '123',
      role: 'TECHNICIAN',
      phone: '+8801600000000',
      avatar: 'TA'
    }
  });

  const alexTech = await prisma.technician.upsert({
    where: { userId: alexUser.id },
    update: { name: 'TechAlex' },
    create: {
      id: 'tech-3',
      userId: alexUser.id,
      name: 'TechAlex',
      specialty: 'Network & Printer Specialist',
      rating: 4.9,
      distanceKm: 2.1,
      isAvailable: true,
      avatar: 'TA',
      availableDays: 'Mon,Tue,Wed,Thu,Fri',
      workingHours: '09:00 AM - 06:00 PM',
      serviceAreas: 'Gulshan, Banani, Dhanmondi, Uttara',
      maxDailyAppointments: 5
    }
  });

  // 3. Sample Service Request
  const req1 = await prisma.serviceRequest.upsert({
    where: { trackingId: 'REQ-2026-8942' },
    update: {},
    create: {
      id: 'req-101',
      trackingId: 'REQ-2026-8942',
      customerId: customerUser.id,
      technicianId: alexUser.id,
      deviceCategory: 'Internet',
      title: 'Office Router & Wi-Fi Configuration',
      description: 'High latency and frequent disconnects across all office laptops...',
      urgency: 'Critical',
      serviceMethod: 'Live Chat',
      status: 'IN_PROGRESS',
      estimatedCost: '৳800 - 1,500',
      statusLogs: {
        create: [
          { status: 'PENDING', note: 'Service request created by customer Claire.' },
          { status: 'ACCEPTED', note: 'Technician TechAlex accepted the job.' }
        ]
      }
    }
  });

  // 4. Conversation
  const conv1 = await prisma.conversation.upsert({
    where: { serviceRequestId: req1.id },
    update: {},
    create: {
      id: 'conv_usr-1_usr-4',
      serviceRequestId: req1.id,
      customerId: customerUser.id,
      technicianId: alexUser.id,
    }
  });

  // 5. Initial Messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: customerUser.id,
        content: 'Hello TechAlex, I need help setting up my office Wi-Fi router.',
        createdAt: new Date(Date.now() - 300000)
      },
      {
        conversationId: conv1.id,
        senderId: alexUser.id,
        content: 'Hello Claire! I am ready to assist with your router configuration.',
        createdAt: new Date(Date.now() - 240000)
      }
    ]
  }).catch(() => null);

  console.log('Database seeded with active accounts Claire and TechAlex!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
