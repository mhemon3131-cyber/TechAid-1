import { prisma, mockDatabase } from '../db.js';

// In-memory fallback message store per conversation ID to ensure isolation when Prisma DB is empty
const inMemoryMessages = {};

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
        customer: { id: reqInfo.customerId || 'usr-1', name: 'Customer', email: 'customer@techaid.com' },
        technician: { id: reqInfo.technicianId || 'usr-2', name: 'Technician', email: 'tech@techaid.com' },
        serviceRequest: { id: serviceRequestId, title: 'Technical Support Request', deviceCategory: 'Laptop' },
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
      messages = inMemoryMessages[id] || [];
    }

    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

export function saveInMemoryMessage(msg) {
  if (!inMemoryMessages[msg.conversationId]) {
    inMemoryMessages[msg.conversationId] = [];
  }
  inMemoryMessages[msg.conversationId].push(msg);
}

export async function listUserConversations(req, res) {
  try {
    const userId = req.headers['user-id'] || 'usr-1';
    const userName = req.headers['user-name'] || (userId === 'usr-1' ? 'Mehedi Hasan' : 'Customer');
    const userRole = req.headers['user-role'] || 'CUSTOMER';

    let conversations = [];

    if (prisma) {
      conversations = await prisma.conversation.findMany({
        where: userRole === 'TECHNICIAN'
          ? { technicianId: userId }
          : { customerId: userId },
        include: {
          serviceRequest: { select: { id: true, title: true, deviceCategory: true, status: true, urgency: true, description: true } },
          customer: { select: { id: true, name: true, email: true, phone: true } },
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
      if (userRole === 'TECHNICIAN') {
        // Technician perspective: list unique Customer conversations assigned to this technician!
        // Tech Sara Noor (usr-3), Tech Alex (usr-4), Tech Rafiq (usr-2)
        const techName = userId === 'usr-3' ? 'Sara Noor' : userId === 'usr-4' ? 'Alex' : 'Rafiq Ahmed';

        conversations = [
          {
            id: `conv_mehedi_${userId}`,
            serviceRequestId: `req_mehedi_${userId}`,
            customerId: 'usr-1',
            technicianId: userId,
            serviceRequest: { id: `req_mehedi_${userId}`, title: 'Laptop & Hardware Repair', deviceCategory: 'Laptop', status: 'IN_PROGRESS', urgency: 'Critical', description: 'Hardware diagnostics requested.' },
            customer: { id: 'usr-1', name: 'Mehedi Hasan', email: 'mehedi@bracu.ac.bd', phone: '+8801700000000' },
            technician: { id: userId, name: techName, email: `${techName.toLowerCase().replace(' ', '')}@techaid.com` },
            messages: inMemoryMessages[`conv_mehedi_${userId}`] || [{ content: 'Hello Mehedi! How can I assist you today?', createdAt: new Date().toISOString() }],
          },
          {
            id: `conv_siri_${userId}`,
            serviceRequestId: `req_siri_${userId}`,
            customerId: 'usr-siri',
            technicianId: userId,
            serviceRequest: { id: `req_siri_${userId}`, title: 'Smartphone & Network Issue', deviceCategory: 'Phone', status: 'IN_PROGRESS', urgency: 'Moderate', description: 'Network connectivity and screen check.' },
            customer: { id: 'usr-siri', name: 'Siri', email: 'siri@apple.com', phone: '+8801900000000' },
            technician: { id: userId, name: techName, email: `${techName.toLowerCase().replace(' ', '')}@techaid.com` },
            messages: inMemoryMessages[`conv_siri_${userId}`] || [{ content: 'Hi Siri! How can I help you today?', createdAt: new Date().toISOString() }],
          }
        ];

      } else {
        // Customer perspective: generate private conversations strictly scoped to THIS customer ID (userId)
        // Customer siri gets conv_siri_usr-2, conv_siri_usr-3, conv_siri_usr-4!
        const safeUserName = userName || (userId === 'usr-1' ? 'Mehedi Hasan' : userId === 'usr-siri' ? 'Siri' : 'Customer');

        conversations = [
          {
            id: `conv_${userId}_usr-2`,
            serviceRequestId: `req_${userId}_usr-2`,
            customerId: userId,
            technicianId: 'usr-2',
            serviceRequest: { id: `req_${userId}_usr-2`, title: "Laptop won't turn on after update", deviceCategory: 'Laptop', status: 'IN_PROGRESS', urgency: 'Critical' },
            customer: { id: userId, name: safeUserName, email: `${userId}@techaid.com` },
            technician: { id: 'usr-2', name: 'Rafiq Ahmed', email: 'rafiq@techaid.com', specialty: 'Laptop & Desktop Specialist', rating: 4.9, avatar: 'RA' },
            messages: inMemoryMessages[`conv_${userId}_usr-2`] || [{ content: `Hello ${safeUserName}! Does the charging light turn on when plugged in?`, createdAt: new Date().toISOString() }],
          },
          {
            id: `conv_${userId}_usr-3`,
            serviceRequestId: `req_${userId}_usr-3`,
            customerId: userId,
            technicianId: 'usr-3',
            serviceRequest: { id: `req_${userId}_usr-3`, title: "Smartphone Screen & Battery Recovery", deviceCategory: 'Phone', status: 'IN_PROGRESS', urgency: 'Moderate' },
            customer: { id: userId, name: safeUserName, email: `${userId}@techaid.com` },
            technician: { id: 'usr-3', name: 'Sara Noor', email: 'sara@techaid.com', specialty: 'Smartphone Repair & OS Recovery', rating: 4.7, avatar: 'SN' },
            messages: inMemoryMessages[`conv_${userId}_usr-3`] || [{ content: `Hi ${safeUserName}! I can help replace your battery.`, createdAt: new Date().toISOString() }],
          },
          {
            id: `conv_${userId}_usr-4`,
            serviceRequestId: `req_${userId}_usr-4`,
            customerId: userId,
            technicianId: 'usr-4',
            serviceRequest: { id: `req_${userId}_usr-4`, title: "Office Router & Wi-Fi Configuration", deviceCategory: 'Internet', status: 'ACCEPTED', urgency: 'High' },
            customer: { id: userId, name: safeUserName, email: `${userId}@techaid.com` },
            technician: { id: 'usr-4', name: 'Alex', email: 'alex@techaid.com', specialty: 'Network & Printer Specialist', rating: 4.8, avatar: 'AL' },
            messages: inMemoryMessages[`conv_${userId}_usr-4`] || [{ content: `Hello ${safeUserName}! I will guide you through resetting your router settings.`, createdAt: new Date().toISOString() }],
          },
        ];
      }
    }

    res.json(conversations);
  } catch (err) {
    console.error('List user conversations error:', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}
