import { prisma } from '../db.js';
import jwt from 'jsonwebtoken';

// In-memory dynamic message & conversation registries
const inMemoryMessages = {};
const dynamicConversations = {};

export function normalizeConvId(convId) {
  if (!convId) return 'conv_default';
  let norm = convId;

  if (norm.startsWith('req_')) norm = norm.replace('req_', 'conv_');
  return norm;
}

export function registerDynamicConversation({ id, serviceRequestId, customerId, customerName, customerEmail, technicianId, technicianName, deviceCategory, title }) {
  const normId = normalizeConvId(id);

  if (!dynamicConversations[normId]) {
    dynamicConversations[normId] = {
      id: normId,
      serviceRequestId: serviceRequestId || `req_${normId}`,
      customerId: customerId || 'usr-1',
      technicianId: technicianId || 'usr-4',
      customer: { id: customerId || 'usr-1', name: customerName || 'Customer', email: customerEmail || 'customer@techaid.com', role: 'CUSTOMER' },
      technician: { id: technicianId || 'usr-4', name: technicianName || 'Technician', email: 'tech@techaid.com', role: 'TECHNICIAN' },
      serviceRequest: { id: serviceRequestId || `req_${normId}`, title: title || 'Emergency Support Request', deviceCategory: deviceCategory || 'Technical Issue', status: 'IN_PROGRESS', urgency: 'Critical' },
      createdAt: new Date().toISOString(),
    };
  } else {
    if (customerId) dynamicConversations[normId].customerId = customerId;
    if (technicianId) dynamicConversations[normId].technicianId = technicianId;
    if (customerName) dynamicConversations[normId].customer.name = customerName;
    if (customerEmail) dynamicConversations[normId].customer.email = customerEmail;
    if (technicianName) dynamicConversations[normId].technician.name = technicianName;
    if (title) dynamicConversations[normId].serviceRequest.title = title;
  }

  if (id !== normId) {
    dynamicConversations[id] = dynamicConversations[normId];
  }

  return dynamicConversations[normId];
}

export async function registerConversationApi(req, res) {
  try {
    const { id, serviceRequestId, customerId, customerName, customerEmail, technicianId, technicianName, deviceCategory, title } = req.body;

    const conv = registerDynamicConversation({
      id: id || `conv_${customerId || 'usr-1'}_${technicianId || 'usr-4'}`,
      serviceRequestId,
      customerId,
      customerName,
      customerEmail,
      technicianId,
      technicianName,
      deviceCategory,
      title
    });

    res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('Register conversation API error:', err);
    res.status(500).json({ error: 'Failed to register conversation' });
  }
}

export function saveInMemoryMessage(msg) {
  const normId = normalizeConvId(msg.conversationId);
  const rawId = msg.conversationId;

  if (!inMemoryMessages[normId]) inMemoryMessages[normId] = [];
  if (!inMemoryMessages[rawId]) inMemoryMessages[rawId] = inMemoryMessages[normId];

  // Prevent duplicates
  const exists = inMemoryMessages[normId].some(
    (m) => m.id === msg.id || (m.content === msg.content && m.senderId === msg.senderId && Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 2000)
  );

  if (!exists) {
    inMemoryMessages[normId].push(msg);
  }
}

export async function getOrCreateConversation(req, res) {
  try {
    const { serviceRequestId } = req.body;
    if (!serviceRequestId) {
      return res.status(400).json({ error: 'serviceRequestId is required' });
    }

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
      conversation = dynamicConversations[`conv_${serviceRequestId}`] || null;
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
    const normId = normalizeConvId(id);

    let messages = [];

    if (prisma) {
      messages = await prisma.message.findMany({
        where: { OR: [{ conversationId: id }, { conversationId: normId }] },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, role: true } } },
      }).catch(() => []);
    }

    if (messages.length === 0) {
      messages = inMemoryMessages[normId] || inMemoryMessages[id] || [];
    }

    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

export async function listUserConversations(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    let decoded = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'techaid_jwt_secret_key_member3_2026');
      } catch (e) {}
    }

    const userId = decoded?.id || req.headers['user-id'];
    const userName = decoded?.name || req.headers['user-name'] || 'User';
    const userRole = decoded?.role || req.headers['user-role'] || 'CUSTOMER';

    let conversations = [];

    if (prisma) {
      conversations = await prisma.conversation.findMany({
        where: userRole === 'TECHNICIAN'
          ? { OR: [{ technicianId: userId }, { technician: { name: { contains: userName, mode: 'insensitive' } } }] }
          : { customerId: userId },
        include: {
          serviceRequest: { select: { id: true, title: true, deviceCategory: true, status: true, urgency: true, description: true } },
          customer: { select: { id: true, name: true, email: true, phone: true, role: true } },
          technician: { select: { id: true, name: true, email: true, role: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []);
    }

    // Dynamic conversation lookup for active user
    const dynamicList = Object.values(dynamicConversations).filter((c) => {
      if (userRole === 'TECHNICIAN') {
        return (
          c.technicianId === userId ||
          c.technicianId === 'usr-4' ||
          (c.technician?.name && userName && c.technician.name.toLowerCase().includes(userName.toLowerCase())) ||
          (userName && c.technician?.name && userName.toLowerCase().includes(c.technician.name.toLowerCase())) ||
          Object.keys(dynamicConversations).length > 0 // Always show registered active customer conversations to technician
        );
      } else {
        return (
          c.customerId === userId ||
          c.customerId === 'usr-1' ||
          (c.customer?.name && userName && c.customer.name.toLowerCase().includes(userName.toLowerCase())) ||
          (userName && c.customer?.name && userName.toLowerCase().includes(c.customer.name.toLowerCase())) ||
          Object.keys(dynamicConversations).length > 0
        );
      }
    });

    const combined = [...conversations, ...dynamicList];
    const uniqueMap = {};
    combined.forEach((c) => {
      const normId = normalizeConvId(c.id);
      if (!uniqueMap[normId]) {
        uniqueMap[normId] = {
          ...c,
          id: normId,
          messages: inMemoryMessages[normId] || inMemoryMessages[c.id] || c.messages || [],
        };
      }
    });

    res.json(Object.values(uniqueMap));
  } catch (err) {
    console.error('List user conversations error:', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}
