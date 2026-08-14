import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

export async function sendEmailNotification({ to, subject, title, message, actionUrl, actionText }) {
  if (!to) return;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #0F172A; padding: 20px; text-align: center; color: #38BDF8;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 700;">TechAid Notification</h2>
        </div>
        <div style="padding: 24px; color: #334155;">
          <h3 style="margin-top: 0; color: #0F172A;">${title || subject}</h3>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">${message}</p>
          ${
            actionUrl && actionText
              ? `<div style="margin-top: 24px; text-align: center;">
                  <a href="${actionUrl}" style="background-color: #0284C7; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">${actionText}</a>
                </div>`
              : ''
          }
        </div>
        <div style="background-color: #F8FAFC; padding: 16px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0;">This is an automated notification from TechAid System. Please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
  `;

  try {
    if (!process.env.EMAIL_USER) {
      console.log(`[Email Service Mock] Sent email to ${to} | Subject: "${subject}"`);
      return;
    }

    const info = await transporter.sendMail({
      from: `"TechAid Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`[Email Service] Message sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('[Email Service Error]', err.message);
  }
}
