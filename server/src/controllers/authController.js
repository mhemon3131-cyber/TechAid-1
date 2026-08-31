// Authentication Controller: Real Database User Login & Registration
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// @desc    Register New User (Customer or Technician) in Prisma Database
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, specialty, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    let cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail.replace(/[^a-z0-9]/g, '')}@gmail.com`;
    }

    // Check if user already exists in database
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    }).catch(() => null);

    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
    }

    const userRole = role || 'CUSTOMER';
    const avatar = (name || 'User').slice(0, 2).toUpperCase();

    // Create User in Prisma Database
    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: password || '123456',
        role: userRole,
        phone: phone || '+8801700000000',
        avatar
      }
    });

    // If Technician role, create linked Technician Profile
    let techRecord = null;
    if (userRole === 'TECHNICIAN') {
      try {
        techRecord = await prisma.technician.create({
          data: {
            userId: newUser.id,
            name: newUser.name,
            specialty: specialty || 'Smartphone Repair & OS Recovery',
            rating: 4.9,
            distanceKm: 2.1,
            isAvailable: true,
            avatar,
            availableDays: 'Mon,Tue,Wed,Thu,Fri',
            workingHours: '09:00 AM - 06:00 PM',
            serviceAreas: 'Gulshan, Banani, Dhanmondi, Uttara',
            maxDailyAppointments: 5
          }
        });
      } catch (tErr) {
        console.warn('Technician profile create notice:', tErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: `Account created successfully for ${newUser.name}! Saved in database.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        technicianId: techRecord ? techRecord.id : null,
        specialty: techRecord ? techRecord.specialty : null
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server database error during account creation.' });
  }
};

// @desc    User Login (Customer or Technician) from Prisma Database
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query Prisma Database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { technician: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found. Please create an account.' });
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
        phone: user.phone || '',
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
      where: { email: email.toLowerCase().trim() },
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
        phone: user.phone,
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
