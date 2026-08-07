import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  Check,
  X,
  Calendar,
  Clock,
  MapPin,
  Shield,
  RefreshCw
} from 'lucide-react';
import { getAppointments, updateAppointmentStatus } from '../services/api';

export const TechnicianDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('Wed Jul 16, 2026');
  const [newTime, setNewTime] = useState('02:30 pm');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAppointments();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    }
  };

  const handleStatusUpdate = async (id, status, extraData = {}) => {
    setLoading(true);
    setMsg('');
    try {
      const res = await updateAppointmentStatus(id, { status, ...extraData });
      if (res.success) {
        setMsg(`Appointment ${status} successfully.`);
        fetchData();
      }
    } catch (err) {
      setMsg('Failed to update status.');
    } finally {
      setLoading(false);
      setRescheduleModal(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="caption" sx={{ color: '#00A8FF', fontWeight: 700, letterSpacing: 1 }}>
          TECHNICIAN PORTAL • MEMBER 2 ASSIGNMENT
        </Typography>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700, mt: 0.5 }}>
          Technician Request Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Approve, Reject, or Reschedule incoming customer support requests
        </Typography>
      </Box>

      {msg && (
        <Alert severity="info" sx={{ mb: 3, backgroundColor: 'rgba(0, 168, 255, 0.15)', color: '#00A8FF' }}>
          {msg}
        </Alert>
      )}

      {/* Incoming Requests Cards */}
      <Grid container spacing={3} sx={{ maxWidth: 900 }}>
        {appointments.map((app) => (
          <Grid item xs={12} key={app.id}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3,
                p: 3,
                border: '1px solid #2A364F'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700 }}>
                    MH
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 700 }}>
                      {app.customerName || 'Mehedi Hasan'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Laptop won't turn on
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={app.status}
                  size="small"
                  sx={{
                    backgroundColor: app.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: app.status === 'APPROVED' ? '#10B981' : app.status === 'REJECTED' ? '#EF4444' : '#F59E0B',
                    fontWeight: 700
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={16} color="#00A8FF" />
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    {app.date} • {app.timeSlot}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={16} color="#00A8FF" />
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    {app.serviceType}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin size={16} color="#94A3B8" />
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    Gulshan, Dhaka • 2.1 km
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons matching Figma Screen */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => setRescheduleModal(app)}
                  startIcon={<RefreshCw size={16} />}
                  sx={{
                    color: '#94A3B8',
                    backgroundColor: '#0F172A',
                    border: '1px solid #2A364F',
                    px: 2.5,
                    '&:hover': { backgroundColor: '#1E293B' }
                  }}
                >
                  Reschedule
                </Button>

                <Button
                  onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                  startIcon={<X size={16} />}
                  sx={{
                    color: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    px: 2.5,
                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                  }}
                >
                  Decline
                </Button>

                <Button
                  variant="contained"
                  onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                  startIcon={<Check size={16} />}
                  sx={{
                    backgroundColor: '#00A8FF',
                    color: '#0D1527',
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { backgroundColor: '#38BDF8' }
                  }}
                >
                  Accept Appointment
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Reschedule Modal */}
      <Dialog
        open={Boolean(rescheduleModal)}
        onClose={() => setRescheduleModal(null)}
        PaperProps={{
          sx: { backgroundColor: '#172036', color: '#FFF', borderRadius: 3, border: '1px solid #2A364F', minWidth: 360 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
            Propose a new date and time slot for client Mehedi Hasan:
          </Typography>
          <TextField
            fullWidth
            label="New Date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#FFF' }, '& label': { color: '#94A3B8' } }}
          />
          <TextField
            fullWidth
            label="New Time Slot"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { color: '#FFF' }, '& label': { color: '#94A3B8' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRescheduleModal(null)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleStatusUpdate(rescheduleModal.id, 'RESCHEDULED', { newDate, newTimeSlot: newTime })}
            sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700 }}
          >
            Confirm Reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
