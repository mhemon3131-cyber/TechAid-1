// Technician Controller (Module 2 & Module 3 Feature 3: Availability Management)
import { mockDatabase } from '../db.js';

// @desc    Get all technicians
// @route   GET /api/technicians
export const getTechnicians = async (req, res) => {
  res.json({
    success: true,
    count: mockDatabase.technicians.length,
    data: mockDatabase.technicians
  });
};

// @desc    Get single technician availability configuration (Module 3 Feature 3)
// @route   GET /api/technicians/availability/:techId
export const getTechnicianAvailability = async (req, res) => {
  const { techId } = req.params;
  const tech = mockDatabase.technicians.find(t => t.id === techId || t.userId === techId);
  
  if (!tech) {
    return res.status(404).json({ success: false, message: 'Technician not found.' });
  }

  res.json({
    success: true,
    data: {
      id: tech.id,
      name: tech.name,
      specialty: tech.specialty,
      availableDays: tech.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: tech.workingHours || '09:00 AM - 06:00 PM',
      serviceAreas: tech.serviceAreas || ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara'],
      maxDailyAppointments: tech.maxDailyAppointments || 5,
      isAvailable: tech.isAvailable
    }
  });
};

// @desc    Update technician working schedule & availability (Module 3 Feature 3)
// @route   PUT /api/technicians/availability/:techId
export const updateTechnicianAvailability = async (req, res) => {
  const { techId } = req.params;
  const { availableDays, workingHours, serviceAreas, maxDailyAppointments, isAvailable } = req.body;

  const tech = mockDatabase.technicians.find(t => t.id === techId || t.userId === techId);
  
  if (!tech) {
    return res.status(404).json({ success: false, message: 'Technician not found.' });
  }

  if (availableDays) tech.availableDays = availableDays;
  if (workingHours) tech.workingHours = workingHours;
  if (serviceAreas) tech.serviceAreas = serviceAreas;
  if (maxDailyAppointments !== undefined) tech.maxDailyAppointments = parseInt(maxDailyAppointments, 10);
  if (isAvailable !== undefined) tech.isAvailable = isAvailable;

  res.json({
    success: true,
    message: 'Technician availability schedule updated successfully.',
    data: tech
  });
};
