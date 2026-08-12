// Module 2 Controller: Real Database Appointment Scheduling System
import { PrismaClient } from '@prisma/client';
import { sendAppointmentConfirmationEmail } from '../utils/emailService.js';

const prisma = new PrismaClient();

// @desc    Create / Book an Appointment (Module 2)
// @route   POST /api/appointments
export const createAppointment = async (req, res) => {
  try {
    const { technicianId, date, timeSlot, serviceType, serviceRequestId, customerId } = req.body;

    if (!technicianId || !date || !timeSlot || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide technician ID, date, time slot, and service type.'
      });
    }

    // 1. Conflict Check via Prisma Database
    const existingConflict = await prisma.appointment.findFirst({
      where: {
        technicianId,
        date,
        timeSlot,
        status: { not: 'REJECTED' }
      }
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: `Scheduling Conflict: Technician is already booked for ${timeSlot} on ${date}. Please select another available time slot.`
      });
    }

    // 2. Fetch Customer & Technician details
    const technician = await prisma.technician.findUnique({ where: { id: technicianId } });
    const custId = customerId || 'usr-1';
    const customer = await prisma.user.findUnique({ where: { id: custId } });

    // 3. Persist Appointment to Real Prisma Database
    const newAppointment = await prisma.appointment.create({
      data: {
        serviceRequestId: serviceRequestId || null,
        customerId: custId,
        technicianId,
        date,
        timeSlot,
        serviceType,
        status: 'PENDING',
        estimatedCost: '৳800 - 1,500'
      },
      include: {
        customer: true,
        technician: true,
        serviceRequest: true
      }
    });

    // 4. Trigger EmailJS notification
    await sendAppointmentConfirmationEmail({
      customerEmail: customer ? customer.email : 'mehedi@bracu.ac.bd',
      customerName: customer ? customer.name : 'Mehedi Hasan',
      technicianName: technician ? technician.name : 'Rafiq Ahmed',
      date,
      timeSlot,
      serviceType
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully in Prisma database!',
      data: {
        id: newAppointment.id,
        customerId: newAppointment.customerId,
        customerName: newAppointment.customer ? newAppointment.customer.name : 'Customer',
        technicianId: newAppointment.technicianId,
        technicianName: newAppointment.technician ? newAppointment.technician.name : 'Technician',
        date: newAppointment.date,
        timeSlot: newAppointment.timeSlot,
        serviceType: newAppointment.serviceType,
        status: newAppointment.status,
        estimatedCost: newAppointment.estimatedCost,
        createdAt: newAppointment.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating appointment in database:', error);
    res.status(500).json({ success: false, message: 'Server database error while booking appointment.' });
  }
};

// @desc    Get all appointments from Prisma Database
// @route   GET /api/appointments
export const getAppointments = async (req, res) => {
  try {
    const { technicianId, customerId, date } = req.query;
    
    const whereClause = {};
    if (technicianId) whereClause.technicianId = technicianId;
    if (customerId) whereClause.customerId = customerId;
    if (date) whereClause.date = date;

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: true,
        technician: true,
        serviceRequest: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = appointments.map(app => ({
      id: app.id,
      serviceRequestId: app.serviceRequestId,
      requestTitle: app.serviceRequest ? app.serviceRequest.title : 'Laptop Technical Service',
      requestDescription: app.serviceRequest ? app.serviceRequest.description : 'Customer requested technical troubleshooting.',
      urgency: app.serviceRequest ? app.serviceRequest.urgency : 'Critical',
      deviceCategory: app.serviceRequest ? app.serviceRequest.deviceCategory : 'Laptop',
      customerId: app.customerId,
      customerName: app.customer ? app.customer.name : 'Customer',
      customerPhone: app.customer ? app.customer.phone : '+8801700000000',
      technicianId: app.technicianId,
      technicianName: app.technician ? app.technician.name : 'Technician',
      date: app.date,
      timeSlot: app.timeSlot,
      serviceType: app.serviceType,
      status: app.status,
      estimatedCost: app.estimatedCost,
      createdAt: app.createdAt
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Database error fetching appointments.' });
  }
};

// @desc    Technician Update Appointment Status / Reschedule in Prisma Database
// @route   PUT /api/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, newDate, newTimeSlot } = req.body;

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found in database.' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (newDate) updateData.date = newDate;
    if (newTimeSlot) updateData.timeSlot = newTimeSlot;

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: { customer: true, technician: true }
    });

    res.json({
      success: true,
      message: `Appointment ${status ? status.toLowerCase() : 'updated'} successfully in database.`,
      data: {
        id: updated.id,
        status: updated.status,
        date: updated.date,
        timeSlot: updated.timeSlot,
        customerName: updated.customer ? updated.customer.name : 'Customer',
        technicianName: updated.technician ? updated.technician.name : 'Technician'
      }
    });

  } catch (error) {
    console.error('Error updating appointment in DB:', error);
    res.status(500).json({ success: false, message: 'Database error updating appointment.' });
  }
};
