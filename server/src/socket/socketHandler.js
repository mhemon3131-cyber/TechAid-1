import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { createNotificationHelper } from '../controllers/notificationController.js';
import { saveInMemoryMessage, registerDynamicConversation, normalizeConvId, cleanName } from '../controllers/conversationController.js';

let ioInstance = null;

export function initSocket(io) {
  ioInstance = io;

  // JWT Socket Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const authUserId = socket.handshake.auth?.userId;
    const authRole = socket.handshake.auth?.role;
    const authName = socket.handshake.auth?.name;

    if (token && token !== 'dev-token') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techaid_jwt_secret_key_member3_2026');
        socket.user = decoded;
        return next();
      } catch (err) {
        console.warn('Socket JWT verification warning:', err.message);
      }
    }

    if (authUserId) {
      socket.user = { id: authUserId, role: authRole || 'CUSTOMER', name: authName || 'User' };
      return next();
    }

    socket.user = { id: 'usr-guest', role: 'CUSTOMER', name: 'Guest' };
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket authenticated connection: ${socket.user?.name} (${socket.user?.id}, role: ${socket.user?.role})`);

    if (socket.user?.id) {
      socket.join(`user_${socket.user.id}`);
      if (socket.user.role === 'TECHNICIAN') {
        socket.join(`role_TECHNICIAN_${socket.user.id}`);
        socket.join('role_TECHNICIAN_ALL');
      } else {
        socket.join(`role_CUSTOMER_${socket.user.id}`);
        socket.join('role_CUSTOMER_ALL');
      }
    }

    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        const normId = normalizeConvId(conversationId);
        const room1 = `conversation_${conversationId}`;
        const room2 = `conversation_${normId}`;

        socket.join(room1);
        socket.join(room2);
        socket.currentRoom = room2;

        io.to(room1).to(room2).emit('user_online', { userId: socket.user?.id });
      } catch (err) {
        console.error('join_conversation error:', err);
      }
    });

    // Handle emergency request acceptance -> Notify Customer & Open Chat
    socket.on('emergency_request_accepted', ({ targetConvId, serviceRequestId, customerId, customerName, technicianId, technicianName }) => {
      const normId = normalizeConvId(targetConvId || `conv_${customerId}_${technicianId}`);

      const safeCustName = cleanName(customerName, 'Customer');
      const safeTechName = cleanName(technicianName, 'Technician');

      registerDynamicConversation({
        id: normId,
        serviceRequestId: serviceRequestId || `req_${normId}`,
        customerId: customerId || 'usr-1',
        customerName: safeCustName,
        technicianId: technicianId || 'usr-4',
        technicianName: safeTechName,
        title: 'Emergency Technical Support',
        deviceCategory: 'Laptop'
      });

      const notifObj = {
        id: `notif_acc_${Date.now()}`,
        title: 'Emergency Request Accepted!',
        message: `Technician ${safeTechName} accepted your request. Live chat box opened.`,
        type: 'REQUEST_ACCEPTED',
        targetConvId: normId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      io.to(`user_${customerId}`).emit('new_notification', notifObj);
      io.to('role_CUSTOMER_ALL').emit('new_notification', notifObj);
      io.emit('new_notification', notifObj);

      io.to(`user_${customerId}`).emit('conversation_accepted', {
        targetConvId: normId,
        technicianId,
        technicianName: safeTechName,
      });
    });

    socket.on('send_message', async ({ conversationId, content, senderId, senderName, recipientId }) => {
      try {
        if (!content || !content.trim()) return;

        const normId = normalizeConvId(conversationId);
        const effectiveSenderId = senderId || socket.user?.id || 'usr-1';
        const senderRole = socket.user?.role || (effectiveSenderId === 'usr-1' ? 'CUSTOMER' : 'TECHNICIAN');
        
        let effectiveSenderName = senderName || socket.user?.name;
        effectiveSenderName = cleanName(effectiveSenderName, senderRole === 'CUSTOMER' ? 'Customer' : 'Technician');

        let message = null;

        if (prisma) {
          // Auto-upsert conversation in database to prevent foreign key errors
          await prisma.conversation.upsert({
            where: { id: normId },
            create: {
              id: normId,
              customerId: senderRole === 'CUSTOMER' ? effectiveSenderId : 'usr-1',
              technicianId: senderRole === 'TECHNICIAN' ? effectiveSenderId : 'usr-4',
            },
            update: {},
          }).catch(() => null);

          // Auto-upsert sender user in database to ensure user foreign key exists
          await prisma.user.upsert({
            where: { id: effectiveSenderId },
            create: {
              id: effectiveSenderId,
              name: effectiveSenderName,
              email: `${effectiveSenderName.toLowerCase().replace(/\s+/g, '')}@techaid.com`,
              role: senderRole,
            },
            update: { name: effectiveSenderName },
          }).catch(() => null);

          message = await prisma.message.create({
            data: {
              conversationId: normId,
              senderId: effectiveSenderId,
              content: content.trim(),
            },
            include: { sender: { select: { id: true, name: true, role: true } } },
          }).catch((err) => {
            console.warn('Prisma message save fallback:', err.message);
            return null;
          });
        }

        if (!message) {
          message = {
            id: `msg_${Date.now()}`,
            conversationId: normId,
            senderId: effectiveSenderId,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            sender: {
              id: effectiveSenderId,
              name: effectiveSenderName,
              role: senderRole,
            },
          };
        }

        // Save in memory for instant persistence
        saveInMemoryMessage(message);

        const room1 = `conversation_${conversationId}`;
        const room2 = `conversation_${normId}`;

        // UNIVERSAL & TARGETED BROADCAST: Ensures messages reach customer and technician 100% live!
        io.to(room1).to(room2).emit('receive_message', message);
        if (recipientId) io.to(`user_${recipientId}`).emit('receive_message', message);
        io.emit('receive_message', message);

        // Create Real-Time Bell Notification for Recipient
        const notifTitle = `New Message from ${effectiveSenderName}`;
        const notifMsg = `"${content.trim().slice(0, 40)}${content.trim().length > 40 ? '...' : ''}"`;
        const notifObj = {
          id: `notif_${Date.now()}`,
          title: notifTitle,
          message: notifMsg,
          type: 'NEW_CHAT_MESSAGE',
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        if (recipientId) {
          io.to(`user_${recipientId}`).emit('new_notification', notifObj);
          await createNotificationHelper({
            userId: recipientId,
            type: 'NEW_CHAT_MESSAGE',
            title: notifTitle,
            message: notifMsg,
          }).catch(() => null);
        } else {
          io.to(room1).to(room2).emit('new_notification', notifObj);
        }

      } catch (err) {
        console.error('send_message error:', err);
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      const normId = normalizeConvId(conversationId);
      const room = `conversation_${normId}`;
      socket.to(room).emit('typing', { userId: socket.user?.id, isTyping });
    });

    socket.on('disconnect', () => {
      if (socket.currentRoom) {
        io.to(socket.currentRoom).emit('user_offline', { userId: socket.user?.id });
      }
    });
  });
}

export function getIO() {
  return ioInstance;
}
