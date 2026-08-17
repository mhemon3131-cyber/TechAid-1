import { prisma } from '../db.js';
import jwt from 'jsonwebtoken';

// In-memory dynamic message & conversation registries
const inMemoryMessages = {};
const dynamicConversations = {};

export function normalizeConvId(convId) {
  if (!convId) return 'conv_customer-active_tech-active';
  let norm = convId;

  if (norm.startsWith('req_')) norm = norm.replace('req_', 'conv_');

  // Normalize customer ID variations to shared customer canonical room
  if (norm.includes('1996233a') || norm.includes('siri') || norm.includes('claire') || norm.includes('usr-1')) {
    norm = norm.replace(/^conv_[^_]+_/, 'conv_customer-active_');
  }

  // Normalize technician ID variations to shared technician canonical room
  if (norm.includes('925ea') || norm.includes('fahim') || norm.includes('tech-1') || norm.includes('usr-4')) {
    norm = norm.replace(/_[^_]+$/, '_tech-active');
  }

  if (norm === 'conv_default' || !norm.includes('_')) {
    norm = 'conv_customer-active_tech-active';
  }

  return norm;
}

export function registerDynamicConversation({ id, serviceRequestId, customerId, customerName, customerEmail, technicianId, technicianName, deviceCategory, title }) {
  const normId = normalizeConvId(id || `conv_${customerId || 'usr-1'}_${technicianId || 'usr-4'}`);

  const safeCustomerName = (customerName && !customerName.includes('-')) ? customerName : 'siri';
  const safeTechName = (technicianName && !technicianName.includes('-')) ? technicianName : 'Fahim';

  if (!dynamicConversations[normId]) {
    dynamicConversations[normId] = {
      id: normId,
      serviceRequestId: serviceRequestId || `req_${normId}`,
      customerId: customerId || 'usr-1',
      technicianId: technicianId || 'usr-4',
      customer: { id: customerId || 'usr-1', name: safeCustomerName, email: customerEmail || `${safeCustomerName.toLowerCase()}@techaid.com`, role: 'CUSTOMER' },
      technician: { id: technicianId || 'usr-4', name: safeTechName, email: `${safeTechName.toLowerCase()}@techaid.com`, role: 'TECHNICIAN' },
      serviceRequest: { id: serviceRequestId || `req_${normId}`, title: title || 'Technical Troubleshooting & Repair', deviceCategory: deviceCategory || 'Laptop', status: 'IN_PROGRESS', urgency: 'Critical' },
      createdAt: new Date().toISOString(),
    };
  } else {
    if (customerId) dynamicConversations[normId].customerId = customerId;
    if (technicianId) dynamicConversations[normId].technicianId = technicianId;
    if (customerName && !customerName.includes('-')) dynamicConversations[normId].customer.name = customerName;
    if (customerEmail) dynamicConversations[normId].customer.email = customerEmail;
    if (technicianName && !technicianName.includes('-')) dynamicConversations[normId].technician.name = technicianName;
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
      id,
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

  // Auto-register conversation if not present
  if (!dynamicConversations[normId]) {
    registerDynamicConversation({
      id: normId,
      customerId: msg.sender?.role === 'CUSTOMER' ? msg.senderId : 'usr-1',
      customerName: msg.sender?.role === 'CUSTOMER' ? msg.sender?.name : 'siri',
      technicianId: msg.sender?.role === 'TECHNICIAN' ? msg.senderId : 'usr-4',
      technicianName: msg.sender?.role === 'TECHNICIAN' ? msg.sender?.name : 'Fahim',
    });
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

    // Default dynamic conversation fallback if dynamic list is currently empty
    const canonicalKey = 'conv_customer-active_tech-active';
    if (!dynamicConversations[canonicalKey]) {
      registerDynamicConversation({
        id: canonicalKey,
        customerName: 'siri',
        technicianName: 'Fahim',
        title: 'Technical Troubleshooting & Repair',
        deviceCategory: 'Laptop',
      });
    }

    const dynamicList = Object.values(dynamicConversations);

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
