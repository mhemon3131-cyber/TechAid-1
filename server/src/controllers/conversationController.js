import { prisma, mockDatabase } from '../db.js';

export async function getOrCreateConversation(req, res) {
  try {
    const { serviceRequestId } = req.params;

    let conversation = null;
    if (prisma) {
      conversation = await prisma.conversation.findUnique({
        where: { serviceRequestId },
        include: {
          messages: { orderBy: { createdAt: 'asc' }, include: { sender: true } },
          customer: true,
          technician: true,
          serviceRequest: true,
        },
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
        customer: { id: 'usr-1', name: 'Mehedi Hasan', email: 'mehedi@bracu.ac.bd' },
        technician: { id: 'usr-2', name: 'Rafiq Ahmed', email: 'rafiq@techaid.com' },
        serviceRequest: { id: serviceRequestId, title: 'Technical Issue', deviceCategory: 'Laptop' },
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

    if (messages.length === 0) {
      if (id === 'conv_req-101') {
        messages = [
          { id: 'm-1', conversationId: id, senderId: 'usr-1', content: 'Hello Rafiq, my laptop screen stays black after turning it on.', createdAt: new Date(Date.now() - 300000).toISOString(), sender: { id: 'usr-1', name: 'Mehedi Hasan', role: 'CUSTOMER' } },
          { id: 'm-2', conversationId: id, senderId: 'usr-2', content: 'Hello Mehedi! Does the power LED light up when you press the power button?', createdAt: new Date(Date.now() - 240000).toISOString(), sender: { id: 'usr-2', name: 'Rafiq Ahmed', role: 'TECHNICIAN' } }
        ];
      } else if (id === 'conv_req-102') {
        messages = [
          { id: 'm-3', conversationId: id, senderId: 'usr-1', content: 'Hi Sara, my phone battery drops from 100% to 20% in 30 minutes.', createdAt: new Date(Date.now() - 180000).toISOString(), sender: { id: 'usr-1', name: 'Mehedi Hasan', role: 'CUSTOMER' } },
          { id: 'm-4', conversationId: id, senderId: 'usr-3', content: 'Hi Mehedi! I can help replace the battery and check background drainage.', createdAt: new Date(Date.now() - 120000).toISOString(), sender: { id: 'usr-3', name: 'Sara Noor', role: 'TECHNICIAN' } }
        ];
      } else if (id === 'conv_req-103') {
        messages = [
          { id: 'm-5', conversationId: id, senderId: 'usr-1', content: 'Hey Alex, our office Wi-Fi disconnects every 10 minutes.', createdAt: new Date(Date.now() - 60000).toISOString(), sender: { id: 'usr-1', name: 'Mehedi Hasan', role: 'CUSTOMER' } },
          { id: 'm-6', conversationId: id, senderId: 'usr-4', content: 'Hello Mehedi! I will guide you through resetting your router MTU & DNS settings.', createdAt: new Date(Date.now() - 30000).toISOString(), sender: { id: 'usr-4', name: 'Alex', role: 'TECHNICIAN' } }
        ];
      }
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
          technician: { id: 'usr-2', name: 'Rafiq Ahmed', email: 'rafiq@techaid.com', specialty: 'Laptop & Desktop Specialist', rating: 4.9, avatar: 'RA' },
          messages: [{ content: 'Does the charging light turn on when plugged in?', createdAt: new Date().toISOString() }],
        },
        {
          id: 'conv_req-102',
          serviceRequestId: 'req-102',
          customerId: 'usr-1',
          technicianId: 'usr-3',
          serviceRequest: { id: 'req-102', title: "Smartphone Screen & Battery Recovery", deviceCategory: 'Phone', status: 'IN_PROGRESS', urgency: 'Moderate' },
          customer: { id: 'usr-1', name: 'Mehedi Hasan', email: 'mehedi@bracu.ac.bd' },
          technician: { id: 'usr-3', name: 'Sara Noor', email: 'sara@techaid.com', specialty: 'Smartphone Repair & OS Recovery', rating: 4.7, avatar: 'SN' },
          messages: [{ content: 'Hi Mehedi! I can help replace the battery.', createdAt: new Date().toISOString() }],
        },
        {
          id: 'conv_req-103',
          serviceRequestId: 'req-103',
          customerId: 'usr-1',
          technicianId: 'usr-4',
          serviceRequest: { id: 'req-103', title: "Office Router & Wi-Fi Configuration", deviceCategory: 'Internet', status: 'ACCEPTED', urgency: 'High' },
          customer: { id: 'usr-1', name: 'Mehedi Hasan', email: 'mehedi@bracu.ac.bd' },
          technician: { id: 'usr-4', name: 'Alex', email: 'alex@techaid.com', specialty: 'Network & Printer Specialist', rating: 4.8, avatar: 'AL' },
          messages: [{ content: 'I will guide you through resetting your router.', createdAt: new Date().toISOString() }],
        },
      ];
    }

    res.json(conversations);
  } catch (err) {
    console.error('List user conversations error:', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}
