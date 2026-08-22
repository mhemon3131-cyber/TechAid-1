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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Check,
  X,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export const TechnicianDashboard = ({ currentUser }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Generate real dynamic upcoming calendar dates (today + next 6 days)
  const getUpcomingDates = () => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dayName = days[d.getDay()];
      const monthName = months[d.getMonth()];
      const dateNum = d.getDate();
      const year = d.getFullYear();
      dates.push({
        day: dayName,
        dateNum: `${dateNum}`,
        fullDateStr: `${dayName}, ${monthName} ${dateNum}, ${year}`,
        shortLabel: `${dayName} ${dateNum}`
      });
    }
    return dates;
  };

  const dateOptions = getUpcomingDates();

  // Reschedule Modal State with Interactive Dynamic Calendar Grid
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newSelectedDate, setNewSelectedDate] = useState(dateOptions[1]?.shortLabel || 'Mon 13');
  const [newTimeSlot, setNewTimeSlot] = useState('02:30 pm');

  const timeSlots = [
    '09:00 am',
    '10:30 am',
    '11:30 am',
    '01:00 pm',
    '02:30 pm',
    '04:00 pm',
    '05:30 pm',
    '06:30 pm'
  ];

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const techId = currentUser?.technicianId || currentUser?.id;
      const res = await axios.get(`http://localhost:1345/api/appointments?technicianId=${techId}`);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load appointments from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, extraData = {}, appItem = null) => {
    setLoading(true);
    setMsg('');
    try {
      await axios.put(`http://localhost:1345/api/appointments/${id}/status`, { status, ...extraData });

      // Dual update: Directly synchronize service request status in database
      const reqIdentifier = appItem?.trackingId || appItem?.serviceRequestId;
      if (reqIdentifier) {
        let reqStage = status;
        let noteMsg = `Technician ${currentUser?.name || ''} updated status to ${reqStage}.`;
        if (status === 'APPROVED') reqStage = 'ACCEPTED';
        if (status === 'RESCHEDULED') {
          reqStage = 'ASSIGNED';
          noteMsg = `⚠️ Technician ${currentUser?.name || ''} rescheduled appointment to ${extraData.newDate} at ${extraData.newTimeSlot}.`;
        }

        try {
          await axios.put(`http://localhost:1345/api/requests/${reqIdentifier}/status`, {
            status: reqStage,
            note: noteMsg
          });
        } catch (e) {}
      }

      setMsg(`Appointment status updated to ${status} in database.`);
      fetchData();
    } catch (err) {
      setMsg('Failed to update status.');
    } finally {
      setLoading(false);
      setRescheduleTarget(null);
    }
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleTarget) return;
    const selectedObj = dateOptions.find(d => d.shortLabel === newSelectedDate) || dateOptions[0];
    const formattedDate = selectedObj.fullDateStr;
    handleStatusUpdate(rescheduleTarget.id, 'RESCHEDULED', {
      newDate: formattedDate,
      newTimeSlot: newTimeSlot
    }, rescheduleTarget);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Header (No Member labels) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700 }}>
          Job Requests Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Logged in as Technician: <strong style={{ color: '#00A8FF' }}>{currentUser?.name || 'Technician'}</strong> ({currentUser?.specialty || 'Laptop Specialist'})
        </Typography>
      </Box>

      {msg && (
        <Alert severity="info" sx={{ mb: 3, backgroundColor: 'rgba(0, 168, 255, 0.15)', color: '#00A8FF', border: '1px solid #00A8FF' }}>
          {msg}
        </Alert>
      )}

      {loading ? (
        <CircularProgress color="primary" />
      ) : appointments.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#172036', borderRadius: 3, border: '1px solid #2A364F', textAlign: 'center' }}>
          <AlertCircle size={48} color="#94A3B8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
          <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 600 }}>
            No incoming job requests for {currentUser?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            When customers book an appointment with you, their requests will appear here in real time.
          </Typography>
        </Paper>
      ) : (
        /* Incoming Requests List with Real Titles & Descriptions from DB */
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
                      {app.customerName ? app.customerName.slice(0, 2).toUpperCase() : 'CU'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 700 }}>
                        {app.customerName}
                      </Typography>
                      {/* REAL Title from Database (Fix #4) */}
                      <Typography variant="body2" sx={{ color: '#00A8FF', fontWeight: 600 }}>
                        {app.requestTitle || 'Technical Repair Request'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={app.status}
                    size="small"
                    sx={{
                      backgroundColor: app.status === 'APPROVED' || app.status === 'ACCEPTED' || app.status === 'IN_PROGRESS' || app.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: app.status === 'APPROVED' || app.status === 'ACCEPTED' || app.status === 'IN_PROGRESS' || app.status === 'COMPLETED' ? '#10B981' : app.status === 'REJECTED' ? '#EF4444' : '#F59E0B',
                      fontWeight: 700
                    }}
                  />
                </Box>

                {/* REAL Description from Database (Fix #4) */}
                <Box sx={{ backgroundColor: '#0F172A', p: 2, borderRadius: 2, mb: 2.5, border: '1px solid #2A364F' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>
                    CUSTOMER ISSUE DESCRIPTION
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', lineHeight: 1.6 }}>
                    {app.requestDescription || 'Customer submitted issue for diagnosis.'}
                  </Typography>
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

                {/* Action Buttons based on Status */}
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {app.status === 'PENDING' && (
                    <>
                      <Button
                        size="small"
                        onClick={() => setRescheduleTarget(app)}
                        startIcon={<RefreshCw size={16} />}
                        sx={{
                          color: '#94A3B8',
                          backgroundColor: '#0F172A',
                          border: '1px solid #2A364F',
                          px: 2,
                          '&:hover': { backgroundColor: '#1E293B' }
                        }}
                      >
                        Reschedule
                      </Button>

                      <Button
                        size="small"
                        onClick={() => handleStatusUpdate(app.id, 'REJECTED', {}, app)}
                        startIcon={<X size={16} />}
                        sx={{
                          color: '#EF4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          px: 2,
                          '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                        }}
                      >
                        Decline
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleStatusUpdate(app.id, 'APPROVED', {}, app)}
                        startIcon={<Check size={16} />}
                        sx={{
                          backgroundColor: '#00A8FF',
                          color: '#0D1527',
                          fontWeight: 700,
                          px: 2.5,
                          '&:hover': { backgroundColor: '#38BDF8' }
                        }}
                      >
                        Accept Appointment
                      </Button>
                    </>
                  )}

                  {(app.status === 'APPROVED' || app.status === 'ACCEPTED' || app.status === 'RESCHEDULED') && (
                    <>
                      <Button
                        size="small"
                        onClick={() => setRescheduleTarget(app)}
                        startIcon={<RefreshCw size={16} />}
                        sx={{
                          color: '#F59E0B',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          px: 2,
                          '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.2)' }
                        }}
                      >
                        Reschedule
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleStatusUpdate(app.id, 'IN_PROGRESS', {}, app)}
                        sx={{
                          backgroundColor: '#3B82F6',
                          color: '#FFF',
                          fontWeight: 700,
                          px: 2.5,
                          '&:hover': { backgroundColor: '#2563EB' }
                        }}
                      >
                        Start Diagnosing (In Progress)
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleStatusUpdate(app.id, 'ON_THE_WAY', {}, app)}
                        sx={{
                          backgroundColor: '#F59E0B',
                          color: '#0D1527',
                          fontWeight: 700,
                          px: 2.5,
                          '&:hover': { backgroundColor: '#D97706' }
                        }}
                      >
                        On the Way
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleStatusUpdate(app.id, 'COMPLETED', {}, app)}
                        sx={{
                          backgroundColor: '#10B981',
                          color: '#0D1527',
                          fontWeight: 700,
                          px: 2.5,
                          '&:hover': { backgroundColor: '#059669' }
                        }}
                      >
                        Mark Completed
                      </Button>
                    </>
                  )}

                  {(app.status === 'IN_PROGRESS' || app.status === 'ON_THE_WAY') && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleStatusUpdate(app.id, 'COMPLETED', {}, app)}
                      startIcon={<Check size={16} />}
                      sx={{
                        backgroundColor: '#10B981',
                        color: '#0D1527',
                        fontWeight: 700,
                        px: 3,
                        '&:hover': { backgroundColor: '#059669' }
                      }}
                    >
                      Complete Service
                    </Button>
                  )}

                  {app.status === 'COMPLETED' && (
                    <Chip
                      label="Service Completed"
                      color="success"
                      sx={{ fontWeight: 700, px: 1 }}
                    />
                  )}

                  {app.status === 'REJECTED' && (
                    <Chip
                      label="Appointment Declined"
                      color="error"
                      sx={{ fontWeight: 700, px: 1 }}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Interactive Reschedule Calendar Modal (Fix #6) */}
      <Dialog
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        PaperProps={{
          sx: { backgroundColor: '#172036', color: '#FFF', borderRadius: 3, border: '1px solid #2A364F', minWidth: 420 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Reschedule Appointment
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Select a new date and available time slot for client <strong>{rescheduleTarget?.customerName}</strong>:
          </Typography>

          {/* Interactive Date Selector Grid */}
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 1 }}>
            New Date:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {dateOptions.map((d) => {
              const label = `${d.day} ${d.dateNum}`;
              const selected = newSelectedDate === label;
              return (
                <Box
                  key={label}
                  onClick={() => setNewSelectedDate(label)}
                  sx={{
                    flex: 1,
                    py: 1,
                    textAlign: 'center',
                    borderRadius: 2,
                    cursor: 'pointer',
                    backgroundColor: selected ? '#00A8FF' : '#0F172A',
                    color: selected ? '#0D1527' : '#FFF',
                    border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                    fontWeight: 700
                  }}
                >
                  <Typography variant="caption" sx={{ display: 'block' }}>{d.day}</Typography>
                  <Typography variant="body2">{d.dateNum}</Typography>
                </Box>
              );
            })}
          </Box>

          {/* Interactive Time Slot Selector Grid */}
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 1 }}>
            New Time Slot:
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {timeSlots.map((slot) => {
              const selected = newTimeSlot === slot;
              return (
                <Grid item xs={4} key={slot}>
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => setNewTimeSlot(slot)}
                    sx={{
                      backgroundColor: selected ? '#00A8FF' : '#0F172A',
                      color: selected ? '#0D1527' : '#94A3B8',
                      border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                      py: 0.8,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {slot}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRescheduleTarget(null)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmReschedule}
            sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700 }}
          >
            Confirm Reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
