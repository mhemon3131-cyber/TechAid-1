// Module 2 Controller: Appointment Scheduling System
import { mockDatabase } from '../db.js';
import { sendAppointmentConfirmationEmail } from '../utils/emailService.js';

// @desc    Create / Book an Appointment (Module 2)
// @route   POST /api/appointments
export const createAppointment = async (req, res) => {
  try {
    const { technicianId, date, timeSlot, serviceType, serviceRequestId } = req.body;

    if (!technicianId || !date || !timeSlot || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide technician ID, date, time slot, and service type.'
      });
    }

    // 1. Conflict Prevention Check
    const existingConflict = mockDatabase.appointments.find(
      app => app.technicianId === technicianId &&
             app.date === date &&
             app.timeSlot === timeSlot &&
             app.status !== 'REJECTED'
    );

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: `Scheduling Conflict: Technician is already booked for ${timeSlot} on ${date}. Please select another time slot.`
      });
    }

    // Find technician details
    const technician = mockDatabase.technicians.find(t => t.id === technicianId) || { name: 'Rafiq Ahmed' };

    const newAppointment = {
      id: `app-${Date.now()}`,
      serviceRequestId: serviceRequestId || 'req-101',
      customerId: 'usr-1',
      customerName: 'Mehedi Hasan',
      technicianId,
      technicianName: technician.name,
      date,
      timeSlot,
      serviceType,
      status: 'PENDING',
      estimatedCost: '৳800 - 1,500',
      createdAt: new Date().toISOString()
    };

    mockDatabase.appointments.unshift(newAppointment);

    // 2. Trigger EmailJS confirmation email notification simulation
    await sendAppointmentConfirmationEmail({
      customerEmail: 'mehedi@bracu.ac.bd',
      customerName: 'Mehedi Hasan',
      technicianName: technician.name,
      date,
      timeSlot,
      serviceType
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! Confirmation email sent.',
      data: newAppointment
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Server error while booking appointment.' });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
export const getAppointments = async (req, res) => {
  res.json({
    success: true,
    count: mockDatabase.appointments.length,
    data: mockDatabase.appointments
  });
};

// @desc    Technician Update Appointment Status (Approve, Reject, Reschedule)
// @route   PUT /api/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, newDate, newTimeSlot } = req.body; // status = APPROVED | REJECTED | RESCHEDULED

  const appointment = mockDatabase.appointments.find(a => a.id === id);
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  if (status) appointment.status = status;
  if (newDate) appointment.date = newDate;
  if (newTimeSlot) appointment.timeSlot = newTimeSlot;

  res.json({
    success: true,
    message: `Appointment ${status.toLowerCase()} successfully.`,
    data: appointment
  });
};
