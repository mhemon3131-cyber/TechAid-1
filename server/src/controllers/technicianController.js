// Technician Controller
import { mockDatabase } from '../db.js';

export const getTechnicians = async (req, res) => {
  res.json({
    success: true,
    count: mockDatabase.technicians.length,
    data: mockDatabase.technicians
  });
};
