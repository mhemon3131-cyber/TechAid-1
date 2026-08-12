// Authentication Controller: Real Database User Login & Registration
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// @desc    User Login (Customer or Technician)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address.' });
    }

    // Query Prisma Database
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { technician: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found. Please register.' });
    }

    // Role check
    if (role && user.role !== role) {
      return res.status(401).json({ success: false, message: `Access denied. Account is registered as ${user.role}.` });
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! Logged in as ${user.role}.`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
        technicianId: user.technician ? user.technician.id : null,
        specialty: user.technician ? user.technician.specialty : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server database error during authentication.' });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me/:email
export const getCurrentUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { technician: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        technicianId: user.technician ? user.technician.id : null,
        specialty: user.technician ? user.technician.specialty : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error.' });
  }
};
