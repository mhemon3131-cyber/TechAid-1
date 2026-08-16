import { prisma } from '../db.js';

// In-memory isolated message & conversation registries
const inMemoryMessages = {};
const dynamicConversations = {};

export function normalizeConvId(convId) {
  if (!convId) return 'conv_usr-1_usr-2';
  if (convId.includes('mehedi')) {
    return convId.replace('mehedi', 'usr-1');
  }
  return convId;
}

export function registerDynamicConversation({ id, serviceRequestId, customerId, customerName, customerEmail, technicianId, technicianName, deviceCategory, title }) {
  const normId = normalizeConvId(id);

  if (!dynamicConversations[normId]) {
    dynamicConversations[normId] = {
      id: normId,
      serviceRequestId: serviceRequestId || `req_${normId}`,
      customerId: customerId || 'usr-1',
      technicianId: technicianId || 'usr-2',
      customer: { id: customerId || 'usr-1', name: customerName || 'Customer', email: customerEmail || 'customer@techaid.com' },
      technician: { id: technicianId || 'usr-2', name: technicianName || 'Technician', email: 'tech@techaid.com' },
      serviceRequest: { id: serviceRequestId || `req_${normId}`, title: title || 'Technical Issue', deviceCategory: deviceCategory || 'Laptop', status: 'IN_PROGRESS', urgency: 'Critical' },
      createdAt: new Date().toISOString(),
    };
  } else {
    if (customerName) dynamicConversations[normId].customer.name = customerName;
    if (customerEmail) dynamicConversations[normId].customer.email = customerEmail;
  }

  // Also mirror alias for conv_mehedi_... compatibility
  if (id !== normId) {
    dynamicConversations[id] = dynamicConversations[normId];
  }

  return dynamicConversations[normId];
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

  // Auto-register dynamic conversation if not present
  if (!dynamicConversations[normId]) {
    const custId = msg.sender?.role === 'CUSTOMER' ? msg.senderId : 'usr-1';
    const techId = msg.sender?.role === 'TECHNICIAN' ? msg.senderId : 'usr-2';
    registerDynamicConversation({
      id: normId,
      customerId: custId,
      customerName: msg.sender?.role === 'CUSTOMER' ? msg.sender.name : 'Customer',
      technicianId: techId,
      technicianName: msg.sender?.role === 'TECHNICIAN' ? msg.sender.name : 'Technician',
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

    if (messages.length === 0) {
      messages = [
        {
          id: 'm-1',
          conversationId: normId,
          senderId: 'usr-1',
          content: 'Hello Rafiq, my laptop screen stays black after turning it on.',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          sender: { id: 'usr-1', name: 'Mehedi Hasan', role: 'CUSTOMER' }
        },
        {
          id: 'm-2',
          conversationId: normId,
          senderId: 'usr-2',
          content: 'Hello Mehedi! Does the power LED light up when you press the power button?',
          createdAt: new Date(Date.now() - 240000).toISOString(),
          sender: { id: 'usr-2', name: 'Rafiq Ahmed', role: 'TECHNICIAN' }
        }
      ];
      inMemoryMessages[normId] = messages;
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
      const isAlex = userId === 'usr-4' || userName.toLowerCase().includes('alex');
      const isSara = userId === 'usr-3' || userName.toLowerCase().includes('sara');
      const techId = isAlex ? 'usr-4' : isSara ? 'usr-3' : 'usr-2';
      const techName = isAlex ? 'Alex' : isSara ? 'Sara Noor' : 'Rafiq Ahmed';

      // Always seed Mehedi Hasan with CANONICAL ID: conv_usr-1_${techId}
      const defaultMehediConv = registerDynamicConversation({
        id: `conv_usr-1_${techId}`,
        serviceRequestId: `req_usr-1_${techId}`,
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

      // Deduplicate conversations by ID
      const uniqueMap = {};
      techConvs.forEach((c) => {
        const normId = normalizeConvId(c.id);
        if (!uniqueMap[normId]) {
          uniqueMap[normId] = {
            ...c,
            id: normId,
            messages: inMemoryMessages[normId] || inMemoryMessages[c.id] || c.messages || [{ content: 'Conversation active', createdAt: new Date().toISOString() }],
          };
        }
      });

      conversations = Object.values(uniqueMap);

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

      conversations = [tech1Conv, tech2Conv, tech3Conv].map((c) => {
        const normId = normalizeConvId(c.id);
        return {
          ...c,
          id: normId,
          messages: inMemoryMessages[normId] || inMemoryMessages[c.id] || [{ content: `Hello ${safeUserName}! How can I assist you with your issue today?`, createdAt: new Date().toISOString() }],
        };
      });
    }

    res.json(conversations);
  } catch (err) {
    console.error('List user conversations error:', err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}
