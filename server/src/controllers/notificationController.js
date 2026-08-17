import { prisma } from '../db.js';
import { getIO } from '../socket/socketHandler.js';
import { sendEmailNotification } from '../services/emailService.js';

export async function createNotificationHelper({ userId, type, title, message, userEmail, actionUrl, actionText }) {
  try {
    let notification = null;

    if (prisma) {
      notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
        },
      }).catch(() => null);
    }

    if (!notification) {
      notification = {
        id: `notif_${Date.now()}`,
        userId,
        type,
        title,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
    }

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    }

    let recipientEmail = userEmail;
    if (!recipientEmail && prisma) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      }).catch(() => null);
      recipientEmail = user?.email;
    }

    if (recipientEmail) {
      await sendEmailNotification({
        to: recipientEmail,
        subject: `[TechAid] ${title}`,
        title,
        message,
        actionUrl,
        actionText,
      });
    }

    return notification;
  } catch (err) {
    console.error('Failed to create notification helper:', err);
  }
}

export async function getNotifications(req, res) {
  try {
    const userId = req.headers['user-id'] || 'usr-1';
    let notifications = [];

    if (prisma) {
      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }).catch(() => []);
    }

    res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    let updated = null;

    if (prisma) {
      updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      }).catch(() => null);
    }

    if (!updated) {
      updated = { id, isRead: true };
    }

    res.json(updated);
  } catch (err) {
    console.error('Mark read notification error:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
}
