import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { createNotificationHelper } from '../controllers/notificationController.js';
import { saveInMemoryMessage, registerDynamicConversation } from '../controllers/conversationController.js';

let ioInstance = null;

export function initSocket(io) {
  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const authUserId = socket.handshake.auth?.userId || 'usr-1';
    const authRole = socket.handshake.auth?.role || 'CUSTOMER';

    if (!token || token === 'dev-token') {
      socket.user = { id: authUserId, role: authRole };
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techaid_jwt_secret_key_member3_2026');
      socket.user = decoded;
      next();
    } catch (err) {
      socket.user = { id: authUserId, role: authRole };
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user?.id || 'guest'} (role: ${socket.user?.role})`);

    if (socket.user?.id) {
      socket.join(`user_${socket.user.id}`);
      if (socket.user.role === 'TECHNICIAN') {
        socket.join('role_TECHNICIAN');
      }
    }

    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        const room = `conversation_${conversationId}`;
        socket.join(room);
        socket.currentRoom = room;

        io.to(room).emit('user_online', { userId: socket.user?.id });
      } catch (err) {
        console.error('join_conversation error:', err);
      }
    });

    socket.on('send_message', async ({ conversationId, content, senderId, senderName }) => {
      try {
        if (!content || !content.trim()) return;

        const effectiveSenderId = senderId || socket.user?.id || 'usr-1';
        const effectiveSenderName = senderName || (effectiveSenderId === 'usr-1' ? 'Mehedi Hasan' : 'User');
        let message = null;

        if (prisma) {
          message = await prisma.message.create({
            data: {
              conversationId,
              senderId: effectiveSenderId,
              content: content.trim(),
            },
            include: { sender: { select: { id: true, name: true, role: true } } },
          }).catch((err) => {
            console.warn('Prisma message save warning:', err.message);
            return null;
          });
        }

        if (!message) {
          message = {
            id: `msg_${Date.now()}`,
            conversationId,
            senderId: effectiveSenderId,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            sender: {
              id: effectiveSenderId,
              name: effectiveSenderName,
              role: socket.user?.role || 'CUSTOMER',
            },
          };
        }

        // Save message and register conversation dynamically for recipient technician/customer
        saveInMemoryMessage(message);

        const room = `conversation_${conversationId}`;
        io.to(room).emit('receive_message', message);

        // Notify technician live via Socket event
        io.to('role_TECHNICIAN').emit('new_conversation_message', { conversationId, message });

        // Send Real-Time Notification to recipient
        const recipientId = socket.user?.role === 'TECHNICIAN' ? 'usr-1' : 'usr-4';
        await createNotificationHelper({
          userId: recipientId,
          type: 'NEW_CHAT_MESSAGE',
          title: `New Message from ${effectiveSenderName}`,
          message: `"${content.trim().slice(0, 45)}${content.trim().length > 45 ? '...' : ''}"`,
        }).catch(() => null);

      } catch (err) {
        console.error('send_message error:', err);
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      const room = `conversation_${conversationId}`;
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
