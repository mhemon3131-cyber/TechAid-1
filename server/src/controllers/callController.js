import { prisma } from '../db.js';

export async function startCall(req, res) {
  try {
    const { id: conversationId } = req.params;
    const { callType } = req.body; // 'VOICE' or 'VIDEO'

    const roomName = `techaid-${conversationId}-${Date.now()}`;
    let callSession = null;

    if (prisma) {
      callSession = await prisma.callSession.create({
        data: {
          conversationId,
          roomName,
          callType: callType === 'VOICE' ? 'VOICE' : 'VIDEO',
        },
      }).catch(() => null);
    }

    if (!callSession) {
      callSession = {
        id: `call_${Date.now()}`,
        conversationId,
        roomName,
        callType: callType === 'VOICE' ? 'VOICE' : 'VIDEO',
        startedAt: new Date().toISOString(),
      };
    }

    res.status(201).json(callSession);
  } catch (err) {
    console.error('Start call error:', err);
    res.status(500).json({ error: 'Failed to start call session' });
  }
}

export async function endCall(req, res) {
  try {
    const { id } = req.params;
    let callSession = null;

    if (prisma) {
      callSession = await prisma.callSession.update({
        where: { id },
        data: { endedAt: new Date() },
      }).catch(() => null);
    }

    if (!callSession) {
      callSession = { id, endedAt: new Date().toISOString() };
    }

    res.json(callSession);
  } catch (err) {
    console.error('End call error:', err);
    res.status(500).json({ error: 'Failed to end call session' });
  }
}
