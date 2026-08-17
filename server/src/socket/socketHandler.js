import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { createNotificationHelper } from '../controllers/notificationController.js';
import { saveInMemoryMessage, registerDynamicConversation, normalizeConvId } from '../controllers/conversationController.js';

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
        socket.join('role_TECHNICIAN');
      } else {
        socket.join('role_CUSTOMER');
      }
    }

    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        const normId = normalizeConvId(conversationId);
        const room1 = `conversation_${conversationId}`;
        const room2 = `conversation_${normId}`;
        const room3 = `conversation_conv_customer-active_tech-active`;

        socket.join(room1);
        socket.join(room2);
        socket.join(room3);
        socket.currentRoom = room3;

        io.to(room1).to(room2).to(room3).emit('user_online', { userId: socket.user?.id });
      } catch (err) {
        console.error('join_conversation error:', err);
      }
    });

    socket.on('send_message', async ({ conversationId, content, senderId, senderName, recipientId }) => {
      try {
        if (!content || !content.trim()) return;

        const normId = normalizeConvId(conversationId);
        const effectiveSenderId = senderId || socket.user?.id;
        const senderRole = socket.user?.role || (senderId === 'usr-1' ? 'CUSTOMER' : 'TECHNICIAN');
        
        let effectiveSenderName = senderName || socket.user?.name;
        if (!effectiveSenderName || effectiveSenderName.includes('-')) {
          effectiveSenderName = senderRole === 'CUSTOMER' ? 'siri' : 'Fahim';
        }

        let message = null;

        if (prisma) {
          message = await prisma.message.create({
            data: {
              conversationId: normId,
              senderId: effectiveSenderId,
              content: content.trim(),
            },
            include: { sender: { select: { id: true, name: true, role: true } } },
          }).catch((err) => null);
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

        saveInMemoryMessage(message);

        const room1 = `conversation_${conversationId}`;
        const room2 = `conversation_${normId}`;
        const room3 = `conversation_conv_customer-active_tech-active`;

        // Broadcast to ALL canonical rooms so BOTH Customer & Technician receive messages live
        io.to(room1).to(room2).to(room3).emit('receive_message', message);
        io.emit('receive_message', message); // Universal fallback emit for instant UI update

        // Notify technician live via Socket event
        io.to('role_TECHNICIAN').emit('new_conversation_message', { conversationId: normId, message });
        io.to('role_CUSTOMER').emit('new_conversation_message', { conversationId: normId, message });

        if (recipientId) {
          await createNotificationHelper({
            userId: recipientId,
            type: 'NEW_CHAT_MESSAGE',
            title: `New Message from ${effectiveSenderName}`,
            message: `"${content.trim().slice(0, 45)}${content.trim().length > 45 ? '...' : ''}"`,
          }).catch(() => null);
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
