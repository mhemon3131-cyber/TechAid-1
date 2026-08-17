// Member 1 - Module 3 Feature Controller
// Service Cost Estimation System
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Base diagnostic/service rate per device category (in BDT, Taka).
const BASE_RATE = {
  Laptop: 600,
  Desktop: 550,
  Phone: 450,
  Printer: 400,
  Internet: 350
};

// Multiplier applied on top of the base rate depending on issue severity.
const SEVERITY_MULTIPLIER = {
  Low: 1,
  Moderate: 1.4,
  Critical: 1.9
};

// Flat surcharge/discount depending on the chosen service type.
const SERVICE_TYPE_ADJUSTMENT = {
  'Live Chat': 0,
  'Video Call': 100,
  'Home Visit': 300,
  'Remote support': 100,
  'Service center': 150
};

// Per-kilometer travel fee, only applied for Home Visit / on-site service.
const TRAVEL_RATE_PER_KM = 25;

const round50 = (n) => Math.round(n / 50) * 50;

// @desc    Estimate the expected cost of a service before the customer
//          confirms a booking, based on severity, technician pricing signal
//          (rating), distance, and the selected service type.
// @route   POST /api/cost-estimate
export const estimateServiceCost = async (req, res) => {
  try {
    const {
      deviceCategory = 'Laptop',
      severity = 'Moderate',
      serviceType = 'Live Chat',
      technicianId
    } = req.body;

    const baseRate = BASE_RATE[deviceCategory] ?? BASE_RATE.Laptop;
    const severityMultiplier = SEVERITY_MULTIPLIER[severity] ?? SEVERITY_MULTIPLIER.Moderate;
    const serviceTypeFee = SERVICE_TYPE_ADJUSTMENT[serviceType] ?? 0;

    let technician = null;
    let distanceKm = 0;
    let ratingFactor = 1;

    if (technicianId) {
      technician = await prisma.technician.findFirst({
        where: { OR: [{ id: technicianId }, { userId: technicianId }] }
      });
    }
    if (!technician) {
      technician = await prisma.technician.findFirst({ orderBy: { rating: 'desc' } });
    }
    if (technician) {
      distanceKm = technician.distanceKm || 0;
      // Higher-rated technicians (closer to 5.0) command a small premium.
      ratingFactor = 1 + Math.max(0, (technician.rating - 4.0)) * 0.1;
    }

    const isOnSite = serviceType === 'Home Visit';
    const travelFee = isOnSite ? round50(distanceKm * TRAVEL_RATE_PER_KM) : 0;

    const midEstimate = round50(baseRate * severityMultiplier * ratingFactor + serviceTypeFee + travelFee);
    const lowEstimate = round50(midEstimate * 0.85);
    const highEstimate = round50(midEstimate * 1.25);

    res.json({
      success: true,
      message: 'Service cost estimated successfully.',
      data: {
        deviceCategory,
        severity,
        serviceType,
        technician: technician
          ? { id: technician.id, name: technician.name, rating: technician.rating, distanceKm: technician.distanceKm }
          : null,
        breakdown: {
          baseRate,
          severityMultiplier,
          ratingFactor: Number(ratingFactor.toFixed(2)),
          serviceTypeFee,
          travelFee
        },
        estimatedRange: `৳${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}`,
        lowEstimate,
        midEstimate,
        highEstimate
      }
    });
  } catch (error) {
    console.error('Error estimating service cost:', error);
    res.status(500).json({ success: false, message: 'Server error while estimating service cost.' });
  }
};
