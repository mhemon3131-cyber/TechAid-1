import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TechAid database...');

  // Create Customer User
  const customer = await prisma.user.upsert({
    where: { email: 'mehedi@bracu.ac.bd' },
    update: {},
    create: {
      id: 'usr-1',
      name: 'Mehedi Hasan',
      email: 'mehedi@bracu.ac.bd',
      role: 'CUSTOMER'
    }
  });

  // Create Technician User & Profile
  const techUser = await prisma.user.upsert({
    where: { email: 'rafiq@techaid.com' },
    update: {},
    create: {
      id: 'usr-2',
      name: 'Rafiq Ahmed',
      email: 'rafiq@techaid.com',
      role: 'TECHNICIAN'
    }
  });

  const technician = await prisma.technician.upsert({
    where: { userId: techUser.id },
    update: {},
    create: {
      id: 'tech-1',
      userId: techUser.id,
      name: 'Rafiq Ahmed',
      specialty: 'Laptop & desktop specialist',
      rating: 4.9,
      distanceKm: 2.1,
      isAvailable: true,
      avatar: 'RA'
    }
  });

  console.log('Database seeded successfully!', { customer, technician });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
