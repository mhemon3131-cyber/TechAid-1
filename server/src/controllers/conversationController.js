import { prisma } from '../db.js';
import jwt from 'jsonwebtoken';

// In-memory dynamic message & conversation registries
const inMemoryMessages = {};
const dynamicConversations = {};

export function cleanName(nameVal, fallback = 'User') {
  if (!nameVal || typeof nameVal !== 'string') return fallback;
  const trimmed = nameVal.trim();
  if (trimmed.length > 20 && trimmed.includes('-') && /^[0-9a-fA-F-]+$/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

export function normalizeConvId(convId) {
  if (!convId) return 'conv_siri_fahim';
  let norm = convId;

  if (norm.startsWith('req_')) norm = norm.replace('req_', 'conv_');
  return norm;
}

export function registerDynamicConversation({ id, serviceRequestId, customerId, customerName, customerEmail, technicianId, technicianName, deviceCategory, title }) {
  const normId = normalizeConvId(id || `conv_${customerId || 'siri'}_${technicianId || 'fahim'}`);

  const safeCustomerName = cleanName(customerName, 'siri');
  const safeTechName = cleanName(technicianName, 'Fahim');

  if (!dynamicConversations[normId]) {
    dynamicConversations[normId] = {
      id: normId,
      serviceRequestId: serviceRequestId || `req_${normId}`,
      customerId: customerId || 'usr-siri',
      technicianId: technicianId || 'tech-fahim',
      customer: { id: customerId || 'usr-siri', name: safeCustomerName, email: `${safeCustomerName.toLowerCase()}@techaid.com`, role: 'CUSTOMER' },
      technician: { id: technicianId || 'tech-fahim', name: safeTechName, email: `${safeTechName.toLowerCase()}@techaid.com`, role: 'TECHNICIAN', specialty: 'Smartphone Repair & OS Recovery' },
      serviceRequest: { id: serviceRequestId || `req_${normId}`, title: title || 'Technical Troubleshooting & Repair', deviceCategory: deviceCategory || 'Laptop', status: 'IN_PROGRESS', urgency: 'Critical' },
      createdAt: new Date().toISOString(),
    };
  } else {
    if (customerId) dynamicConversations[normId].customerId = customerId;
    if (technicianId) dynamicConversations[normId].technicianId = technicianId;
    if (customerName && !customerName.includes('-')) dynamicConversations[normId].customer.name = cleanName(customerName, 'siri');
    if (customerEmail) dynamicConversations[normId].customer.email = customerEmail;
    if (technicianName && !technicianName.includes('-')) dynamicConversations[normId].technician.name = cleanName(technicianName, 'Fahim');
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

  // Ensure dynamic conversation exists and has clean names
  if (!dynamicConversations[normId]) {
    registerDynamicConversation({
      id: normId,
      customerId: msg.sender?.role === 'CUSTOMER' ? msg.senderId : 'usr-siri',
      customerName: msg.sender?.role === 'CUSTOMER' ? cleanName(msg.sender?.name, 'siri') : 'siri',
      technicianId: msg.sender?.role === 'TECHNICIAN' ? msg.senderId : 'tech-fahim',
      technicianName: msg.sender?.role === 'TECHNICIAN' ? cleanName(msg.sender?.name, 'Fahim') : 'Fahim',
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

    let dbMessages = [];

    if (prisma) {
      dbMessages = await prisma.message.findMany({
        where: { OR: [{ conversationId: id }, { conversationId: normId }] },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, role: true } } },
      }).catch(() => []);
    }

    const memMessages = inMemoryMessages[normId] || inMemoryMessages[id] || [];

    // Combine DB and Memory messages seamlessly, eliminating duplicates
    const combinedMap = {};
    [...dbMessages, ...memMessages].forEach((m) => {
      const key = `${m.senderId}_${m.content}_${Math.floor(new Date(m.createdAt || Date.now()).getTime() / 2000)}`;
      if (!combinedMap[key]) {
        combinedMap[key] = m;
      }
    });

    const finalMessages = Object.values(combinedMap).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.json(finalMessages);
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

    // Default dynamic conversation for siri and fahim
    const canonicalKey = 'conv_siri_fahim';
    if (!dynamicConversations[canonicalKey]) {
      registerDynamicConversation({
        id: canonicalKey,
        customerName: 'siri',
        technicianName: 'Fahim',
        title: 'Technical Troubleshooting & Repair',
        deviceCategory: 'Laptop',
      });
    }

    // STRICT USER PRIVACY FILTER: No technician or customer can see another user's conversations!
    const dynamicList = Object.values(dynamicConversations).filter((c) => {
      const uIdStr = String(userId || '').toLowerCase();
      const uNameStr = String(userName || '').toLowerCase();

      if (userRole === 'TECHNICIAN') {
        const techIdStr = String(c.technicianId || c.technician?.id || '').toLowerCase();
        const techNameStr = String(c.technician?.name || '').toLowerCase();

        return (
          techIdStr === uIdStr ||
          (techNameStr && uNameStr && techNameStr === uNameStr) ||
          (techNameStr && uNameStr && uNameStr.includes(techNameStr)) ||
          (techNameStr && uNameStr && techNameStr.includes(uNameStr))
        );
      } else {
        const custIdStr = String(c.customerId || c.customer?.id || '').toLowerCase();
        const custNameStr = String(c.customer?.name || '').toLowerCase();

        return (
          custIdStr === uIdStr ||
          (custNameStr && uNameStr && custNameStr === uNameStr) ||
          (custNameStr && uNameStr && uNameStr.includes(custNameStr)) ||
          (custNameStr && uNameStr && custNameStr.includes(uNameStr))
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
