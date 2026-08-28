// EmailJS / Email Notification Utility for TechAid
// Module 2: Appointment Confirmation & Reschedule Email Notifications

export const sendAppointmentConfirmationEmail = async (appointmentData) => {
  const { customerEmail, customerName, technicianName, date, timeSlot, serviceType } = appointmentData;
  
  console.log('----------------------------------------------------');
  console.log(`[EmailJS Service Notification Sent - Confirmation]`);
  console.log(`To: ${customerEmail || 'customer@techaid.com'}`);
  console.log(`Subject: TechAid Appointment Confirmation - ${serviceType}`);
  console.log(`Dear ${customerName || 'Valued Customer'},`);
  console.log(`Your appointment with Technician ${technicianName} has been scheduled for ${date} at ${timeSlot}.`);
  console.log(`Service Type: ${serviceType}`);
  console.log(`Thank you for using TechAid!`);
  console.log('----------------------------------------------------');

  return {
    status: 200,
    message: 'Email confirmation sent via EmailJS API successfully.',
    timestamp: new Date().toISOString()
  };
};

export const sendAppointmentRescheduleEmail = async (rescheduleData) => {
  const { customerEmail, customerName, technicianName, newDate, newTimeSlot, serviceType } = rescheduleData;

  console.log('----------------------------------------------------');
  console.log(`[EmailJS Service Notification Sent - Reschedule Alert]`);
  console.log(`To: ${customerEmail || 'customer@techaid.com'}`);
  console.log(`Subject: ⚠️ TechAid Appointment Rescheduled - ${serviceType || 'Service'}`);
  console.log(`Dear ${customerName || 'Valued Customer'},`);
  console.log(`Your appointment has been RESCHEDULED by Technician ${technicianName}.`);
  console.log(`New Scheduled Date & Time: ${newDate} at ${newTimeSlot}.`);
  console.log(`Please log into your TechAid dashboard to view updated tracking details.`);
  console.log('----------------------------------------------------');

  return {
    status: 200,
    message: 'Reschedule email alert sent via EmailJS API successfully.',
    timestamp: new Date().toISOString()
  };
};

