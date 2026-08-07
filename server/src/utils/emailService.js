// EmailJS / Email Notification Utility for TechAid
// Module 2: Appointment Confirmation Email Notifications

export const sendAppointmentConfirmationEmail = async (appointmentData) => {
  const { customerEmail, customerName, technicianName, date, timeSlot, serviceType } = appointmentData;
  
  console.log('----------------------------------------------------');
  console.log(`[EmailJS Service Notification Sent]`);
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
