import { prisma, mockDatabase } from '../db.js';

export async function getOrCreateConversation(req, res) {
  try {
    const { serviceRequestId } = req.params;

    let conversation = null;
    if (prisma) {
      conversation = await prisma.conversation.findUnique({
        where: { serviceRequestId },
        include: { messages: true, callSessions: true },
      }).catch(() => null);
    }

    if (!conversation) {
      const reqInfo = mockDatabase.serviceRequests.find((r) => r.id === serviceRequestId) || {
        id: serviceRequestId,
        customerId: 'usr-1',
        technicianId: 'usr-2',
      };

      conversation = {
        id: `conv_${serviceRequestId}`,
        serviceRequestId,
        customerId: reqInfo.customerId || 'usr-1',
        technicianId: reqInfo.technicianId || 'usr-2',
        createdAt: new Date().toISOString(),
      };
    }

    res.json(conversation);
  } catch (err) {
    console.error('Get or create conversation error:', err);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
}

export async function getMessages(req, res) {
  try {
    const { id } = req.params;
    let messages = [];

    if (prisma) {
      messages = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, role: true } } },
      }).catch(() => []);
    }

    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

export async function listUserConversations(req, res) {
  try {
    const userId = req.headers['user-id'] || 'usr-1';
    let conversations = [];

    if (prisma) {
      conversations = await prisma.conversation.findMany({
        where: {
          OR: [{ customerId: userId }, { technicianId: userId }],
        },
        include: {
          serviceRequest: { select: { id: true, title: true, deviceCategory: true, status: true, urgency: true } },
          customer: { select: { id: true, name: true, email: true } },
          technician: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []);
    }

    if (conversations.length === 0) {
      conversations = [
        {
          id: 'conv_req-101',
          serviceRequestId: 'req-101',
          customerId: 'usr-1',
          technicianId: 'usr-2',
          serviceRequest: { id: 'req-101', title: "Laptop won't turn on after update", deviceCategory: 'Laptop', status: 'IN_PROGRESS', urgency: 'Critical' },
          customer: { id: 'usr-1', name: 'Mehedi Hasan', email: 'mehedi@bracu.ac.bd' },
          technician: { id: 'usr-2', name: 'Rafiq Ahmed', email: 'rafiq@techaid.com' },
          messages: [{ content: 'Does the charging light turn on when plugged in?', createdAt: new Date().toISOString() }],
        },
      ];
    }

    res.json(conversations);
  } catch (err) {
    console.error('List user conversations error:', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}
