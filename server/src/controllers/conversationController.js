import { prisma, mockDatabase } from '../db.js';

// In-memory isolated message & conversation registries
const inMemoryMessages = {};
const dynamicConversations = {};

export function registerDynamicConversation({ id, serviceRequestId, customerId, customerName, customerEmail, technicianId, technicianName, deviceCategory, title }) {
  if (!dynamicConversations[id]) {
    dynamicConversations[id] = {
      id,
      serviceRequestId: serviceRequestId || `req_${id}`,
      customerId,
      technicianId,
      customer: { id: customerId, name: customerName || 'Customer', email: customerEmail || 'customer@techaid.com' },
      technician: { id: technicianId, name: technicianName || 'Technician', email: 'tech@techaid.com' },
      serviceRequest: { id: serviceRequestId || `req_${id}`, title: title || 'Technical Issue', deviceCategory: deviceCategory || 'Laptop', status: 'IN_PROGRESS', urgency: 'Critical' },
      createdAt: new Date().toISOString(),
    };
  } else {
    if (customerName) dynamicConversations[id].customer.name = customerName;
    if (customerEmail) dynamicConversations[id].customer.email = customerEmail;
  }
  return dynamicConversations[id];
}

export function saveInMemoryMessage(msg) {
  if (!inMemoryMessages[msg.conversationId]) {
    inMemoryMessages[msg.conversationId] = [];
  }
  inMemoryMessages[msg.conversationId].push(msg);

  // Auto-register dynamic conversation if not present
  if (!dynamicConversations[msg.conversationId]) {
    const parts = msg.conversationId.split('_');
    const custId = msg.sender?.role === 'CUSTOMER' ? msg.senderId : 'usr-1';
    const techId = msg.sender?.role === 'TECHNICIAN' ? msg.senderId : 'usr-4';
    registerDynamicConversation({
      id: msg.conversationId,
      customerId: custId,
      customerName: msg.sender?.role === 'CUSTOMER' ? msg.sender.name : 'Customer',
      technicianId: techId,
      technicianName: msg.sender?.role === 'TECHNICIAN' ? msg.sender.name : 'Technician',
    });
  }
}

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
      conversation = dynamicConversations[`conv_${serviceRequestId}`] || {
        id: `conv_${serviceRequestId}`,
        serviceRequestId,
        customerId: 'usr-1',
        technicianId: 'usr-2',
        customer: { id: 'usr-1', name: 'Customer', email: 'customer@techaid.com' },
        technician: { id: 'usr-2', name: 'Technician', email: 'tech@techaid.com' },
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

export async function listUserConversations(req, res) {
  try {
    const userId = req.headers['user-id'] || 'usr-1';
    const userName = req.headers['user-name'] || 'User';
    const userRole = req.headers['user-role'] || 'CUSTOMER';

    let conversations = [];

    if (prisma) {
      conversations = await prisma.conversation.findMany({
        where: userRole === 'TECHNICIAN'
          ? { OR: [{ technicianId: userId }, { technician: { name: { contains: userName, mode: 'insensitive' } } }] }
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

    if (userRole === 'TECHNICIAN') {
      // Find all dynamic conversations registered for this technician (by userId or technicianId like usr-2, usr-3, usr-4)
      const isAlex = userId === 'usr-4' || userName.toLowerCase().includes('alex');
      const isSara = userId === 'usr-3' || userName.toLowerCase().includes('sara');
      const techId = isAlex ? 'usr-4' : isSara ? 'usr-3' : 'usr-2';
      const techName = isAlex ? 'Alex' : isSara ? 'Sara Noor' : 'Rafiq Ahmed';

      // Always seed Mehedi Hasan and any registered customer conversations for this technician
      const defaultMehediConv = registerDynamicConversation({
        id: `conv_mehedi_${techId}`,
        serviceRequestId: `req_mehedi_${techId}`,
        customerId: 'usr-1',
        customerName: 'Mehedi Hasan',
        customerEmail: 'mehedi@bracu.ac.bd',
        technicianId: techId,
        technicianName: techName,
        title: 'Office Router & Wi-Fi Configuration',
        deviceCategory: 'Internet',
      });

      // Gather all conversations where technicianId matches techId or userId
      const techConvs = Object.values(dynamicConversations).filter(
        (c) => c.technicianId === techId || c.technicianId === userId || c.technician?.name?.toLowerCase().includes(techName.toLowerCase())
      );

      conversations = techConvs.map((c) => ({
        ...c,
        messages: inMemoryMessages[c.id] || c.messages || [{ content: 'Conversation active', createdAt: new Date().toISOString() }],
      }));

    } else {
      // Customer perspective: generate private conversations strictly scoped to THIS customer ID & Name!
      const safeUserName = userName || 'Customer';

      const tech1Conv = registerDynamicConversation({
        id: `conv_${userId}_usr-2`,
        serviceRequestId: `req_${userId}_usr-2`,
        customerId: userId,
        customerName: safeUserName,
        technicianId: 'usr-2',
        technicianName: 'Rafiq Ahmed',
        title: "Laptop won't turn on after update",
        deviceCategory: 'Laptop',
      });

      const tech2Conv = registerDynamicConversation({
        id: `conv_${userId}_usr-3`,
        serviceRequestId: `req_${userId}_usr-3`,
        customerId: userId,
        customerName: safeUserName,
        technicianId: 'usr-3',
        technicianName: 'Sara Noor',
        title: 'Smartphone Screen & Battery Recovery',
        deviceCategory: 'Phone',
      });

      const tech3Conv = registerDynamicConversation({
        id: `conv_${userId}_usr-4`,
        serviceRequestId: `req_${userId}_usr-4`,
        customerId: userId,
        customerName: safeUserName,
        technicianId: 'usr-4',
        technicianName: 'Alex',
        title: 'Office Router & Wi-Fi Configuration',
        deviceCategory: 'Internet',
      });

      conversations = [tech1Conv, tech2Conv, tech3Conv].map((c) => ({
        ...c,
        messages: inMemoryMessages[c.id] || [{ content: `Hello ${safeUserName}! How can I assist you with your issue today?`, createdAt: new Date().toISOString() }],
      }));
    }

    res.json(conversations);
  } catch (err) {
    console.error('List user conversations error:', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}
