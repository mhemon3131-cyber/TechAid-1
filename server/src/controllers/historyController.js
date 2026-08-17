// Member 1 - Module 3 Feature Controller
// Issue Resolution History
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get the full resolution history for a customer: past requests,
//          their status log trail, attachments, and final resolution stage.
// @route   GET /api/history/:customerId
export const getResolutionHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    const requests = await prisma.serviceRequest.findMany({
      where: customerId && customerId !== 'all' ? { customerId } : undefined,
      include: {
        attachments: true,
        statusLogs: { orderBy: { createdAt: 'asc' } },
        customer: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const history = requests.map((r) => ({
      id: r.id,
      trackingId: r.trackingId,
      deviceCategory: r.deviceCategory,
      title: r.title,
      description: r.description,
      urgency: r.urgency,
      serviceMethod: r.serviceMethod,
      status: r.status,
      isResolved: r.status === 'COMPLETED',
      estimatedCost: r.estimatedCost,
      attachments: r.attachments,
      resolutionTrail: r.statusLogs,
      finalNote: r.statusLogs.length ? r.statusLogs[r.statusLogs.length - 1].note : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    res.json({
      success: true,
      count: history.length,
      resolvedCount: history.filter((h) => h.isResolved).length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching resolution history:', error);
    res.status(500).json({ success: false, message: 'Database error fetching resolution history.' });
  }
};

// @desc    Get a single past request's full resolution detail by tracking ID.
// @route   GET /api/history/detail/:trackingId
export const getResolutionDetail = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const request = await prisma.serviceRequest.findFirst({
      where: {
        OR: [{ trackingId: trackingId.toUpperCase() }, { id: trackingId }]
      },
      include: {
        attachments: true,
        statusLogs: { orderBy: { createdAt: 'asc' } },
        customer: true
      }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service record not found in history.' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Error fetching resolution detail:', error);
    res.status(500).json({ success: false, message: 'Database error fetching resolution detail.' });
  }
};
