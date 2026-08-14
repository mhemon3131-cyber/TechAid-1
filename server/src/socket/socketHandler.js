import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

let ioInstance = null;

export function initSocket(io) {
  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Allow fallback dev socket connection if no token provided during testing
      socket.user = { id: 'dev-user', role: 'CUSTOMER' };
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techaid_jwt_secret_key_member3_2026');
      socket.user = decoded;
      next();
    } catch (err) {
      socket.user = { id: 'dev-user', role: 'CUSTOMER' };
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user?.id || 'guest'}`);

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

    socket.on('send_message', async ({ conversationId, content, senderId }) => {
      try {
        if (!content || !content.trim()) return;

        const effectiveSenderId = socket.user?.id || senderId;

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: effectiveSenderId,
            content: content.trim(),
          },
          include: { sender: { select: { id: true, name: true, role: true } } },
        });

        const room = `conversation_${conversationId}`;
        io.to(room).emit('receive_message', message);
      } catch (err) {
        console.error('send_message error:', err);
        socket.emit('error_message', { error: 'Failed to send message' });
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
