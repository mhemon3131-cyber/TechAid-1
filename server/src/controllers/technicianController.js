// Technician Controller: Real Prisma Database Operations
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// @desc    Get all technicians from Prisma DB
// @route   GET /api/technicians
export const getTechnicians = async (req, res) => {
  try {
    const technicians = await prisma.technician.findMany({
      include: { user: true }
    });

    const formatted = technicians.map(t => ({
      id: t.id,
      userId: t.userId,
      name: t.name,
      specialty: t.specialty,
      rating: t.rating,
      distanceKm: t.distanceKm,
      isAvailable: t.isAvailable,
      avatar: t.avatar || t.name.slice(0, 2).toUpperCase(),
      availableDays: t.availableDays ? t.availableDays.split(',') : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: t.workingHours,
      serviceAreas: t.serviceAreas ? t.serviceAreas.split(',') : ['Gulshan', 'Banani'],
      maxDailyAppointments: t.maxDailyAppointments
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching technicians from DB:', error);
    res.status(500).json({ success: false, message: 'Database error fetching technicians.' });
  }
};

// @desc    Get single technician availability configuration (Module 3 Feature 3 - Prisma DB)
// @route   GET /api/technicians/availability/:techId
export const getTechnicianAvailability = async (req, res) => {
  try {
    const { techId } = req.params;
    
    let tech = await prisma.technician.findFirst({
      where: {
        OR: [
          { id: techId },
          { userId: techId }
        ]
      }
    });

    if (!tech) {
      tech = await prisma.technician.findFirst();
    }

    if (!tech) {
      return res.status(404).json({ success: false, message: 'Technician not found in database.' });
    }

    res.json({
      success: true,
      data: {
        id: tech.id,
        name: tech.name,
        specialty: tech.specialty,
        availableDays: tech.availableDays ? tech.availableDays.split(',') : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workingHours: tech.workingHours,
        serviceAreas: tech.serviceAreas ? tech.serviceAreas.split(',') : ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara'],
        maxDailyAppointments: tech.maxDailyAppointments,
        isAvailable: tech.isAvailable
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database query error.' });
  }
};

// @desc    Update technician working schedule in Prisma DB (Module 3 Feature 3)
// @route   PUT /api/technicians/availability/:techId
export const updateTechnicianAvailability = async (req, res) => {
  try {
    const { techId } = req.params;
    const { availableDays, workingHours, serviceAreas, maxDailyAppointments, isAvailable } = req.body;

    let tech = await prisma.technician.findFirst({
      where: {
        OR: [
          { id: techId },
          { userId: techId }
        ]
      }
    });

    if (!tech) {
      tech = await prisma.technician.findFirst();
    }

    if (!tech) {
      return res.status(404).json({ success: false, message: 'Technician record not found.' });
    }

    const updatePayload = {};
    if (availableDays) updatePayload.availableDays = Array.isArray(availableDays) ? availableDays.join(',') : availableDays;
    if (workingHours) updatePayload.workingHours = workingHours;
    if (serviceAreas) updatePayload.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas.join(',') : serviceAreas;
    if (maxDailyAppointments !== undefined) updatePayload.maxDailyAppointments = parseInt(maxDailyAppointments, 10);
    if (isAvailable !== undefined) updatePayload.isAvailable = isAvailable;

    const updated = await prisma.technician.update({
      where: { id: tech.id },
      data: updatePayload
    });

    res.json({
      success: true,
      message: 'Technician availability schedule updated successfully in database.',
      data: {
        ...updated,
        availableDays: updated.availableDays.split(','),
        serviceAreas: updated.serviceAreas.split(',')
      }
    });

  } catch (error) {
    console.error('Error updating technician availability in DB:', error);
    res.status(500).json({ success: false, message: 'Database update error.' });
  }
};
