import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  CircularProgress,
  TextField,
  Alert,
  Divider,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  Wrench,
  Navigation,
  CheckCheck,
  Search
} from 'lucide-react';
import axios from 'axios';

// Custom Glowing Stepper Connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    height: 4,
    border: 0,
    backgroundColor: '#2A364F',
    borderRadius: 1,
  },
  '&.Mui-active .MuiStepConnector-line': {
    backgroundColor: '#00A8FF',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    backgroundColor: '#10B981',
  },
}));

export const ServiceProgressTracker = ({ currentUser }) => {
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [activeTrackingId, setActiveTrackingId] = useState('');
  const [userTickets, setUserTickets] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stagesList = [
    { key: 'PENDING', label: 'Pending', icon: <Clock size={18} /> },
    { key: 'ASSIGNED', label: 'Assigned', icon: <UserCheck size={18} /> },
    { key: 'ACCEPTED', label: 'Accepted', icon: <CheckCircle2 size={18} /> },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: <Wrench size={18} /> },
    { key: 'ON_THE_WAY', label: 'On the Way', icon: <Navigation size={18} /> },
    { key: 'COMPLETED', label: 'Completed', icon: <CheckCheck size={18} /> }
  ];

  // Initial Load: Find current user's active requests and saved tracking ID
  useEffect(() => {
    fetchUserTicketsAndLatest();
  }, [currentUser]);

  // Background Polling: Periodically refresh active tracking ID every 2 seconds without touching search input
  useEffect(() => {
    if (!activeTrackingId) return;

    const interval = setInterval(() => {
      fetchProgress(activeTrackingId, true);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTrackingId]);

  const fetchUserTicketsAndLatest = async () => {
    try {
      const res = await axios.get('http://localhost:1345/api/requests');
      if (res.data.success && res.data.data.length > 0) {
        const userReqs = res.data.data.filter(r => r.customerId === currentUser?.id);
        setUserTickets(userReqs.length > 0 ? userReqs : res.data.data);

        const savedTrackingId = localStorage.getItem('techaid_active_tracking_id');
        const targetId = savedTrackingId || (userReqs.length > 0 ? userReqs[0].trackingId : res.data.data[0].trackingId);

        if (targetId) {
          setTrackingIdInput(targetId);
          setActiveTrackingId(targetId);
          fetchProgress(targetId);
        }
      }
    } catch (err) {
      console.warn('Could not load user requests.');
    }
  };

  const handleSelectTicket = (ticket) => {
    setTrackingIdInput(ticket.trackingId);
    setActiveTrackingId(ticket.trackingId);
    fetchProgress(ticket.trackingId, false);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanId = trackingIdInput.trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter a Tracking ID to search.');
      return;
    }
    setActiveTrackingId(cleanId);
    fetchProgress(cleanId, false);
  };

  const fetchProgress = async (idToFetch, isSilent = false) => {
    if (!idToFetch || !idToFetch.trim()) {
      if (!isSilent) {
        setError('Please enter a valid Tracking ID.');
        setProgressData(null);
      }
      return;
    }

    if (!isSilent) {
      setLoading(true);
      setError('');
    }

    try {
      const cleanId = idToFetch.trim().toUpperCase();
      const res = await axios.get(`http://localhost:1345/api/requests/${cleanId}/progress`);
      if (res.data.success) {
        setProgressData(res.data.data);
        localStorage.setItem('techaid_active_tracking_id', cleanId);
        if (!isSilent) setError('');
      }
    } catch (err) {
      if (!isSilent) {
        setProgressData(null);
        setError(`No service request found for Tracking ID "${idToFetch}". Please verify your Tracking ID.`);
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  const hasRescheduleLog = progressData?.logs?.some(l => 
    l.status === 'RESCHEDULED' || (l.note && l.note.toLowerCase().includes('rescheduled'))
  );

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700 }}>
          Service Progress Tracking System
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Real-time lifecycle monitoring: Pending ➔ Assigned ➔ Accepted ➔ In Progress ➔ On the Way ➔ Completed
        </Typography>
      </Box>

      {/* Persistent "My Service Requests" Selector Box (No memorization needed!) */}
      {userTickets.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#172036',
            borderRadius: 3,
            border: '1px solid #2A364F',
            maxWidth: 900,
            mb: 3
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1.5, letterSpacing: 0.5 }}>
            MY SERVICE TICKETS (CLICK TO TRACK INSTANTLY)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {userTickets.map((t) => {
              const isSelected = activeTrackingId === t.trackingId;
              return (
                <Chip
                  key={t.id || t.trackingId}
                  label={`${t.trackingId} • ${t.deviceCategory || 'Request'} (${t.status})`}
                  onClick={() => handleSelectTicket(t)}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    backgroundColor: isSelected ? '#00A8FF' : '#0F172A',
                    color: isSelected ? '#0D1527' : '#E2E8F0',
                    borderColor: isSelected ? '#00A8FF' : '#2A364F',
                    fontWeight: 700,
                    cursor: 'pointer',
                    py: 2,
                    px: 1,
                    '&:hover': {
                      backgroundColor: isSelected ? '#38BDF8' : '#1E293B'
                    }
                  }}
                />
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Search Bar for Tracking ID */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: '#172036',
          borderRadius: 3,
          border: '1px solid #2A364F',
          maxWidth: 900,
          mb: 3,
          display: 'flex',
          gap: 2,
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Enter or paste any Tracking ID (e.g. REQ-2026-XXXX)..."
          value={trackingIdInput}
          onChange={(e) => setTrackingIdInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#FFF',
              backgroundColor: '#0F172A',
              '& fieldset': { borderColor: '#2A364F' }
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearchSubmit}
          startIcon={<Search size={18} />}
          sx={{
            backgroundColor: '#00A8FF',
            color: '#0D1527',
            fontWeight: 700,
            px: 3,
            '&:hover': { backgroundColor: '#38BDF8' }
          }}
        >
          Track Request
        </Button>
      </Paper>

      {/* Reschedule Alert Notification Banner (Role-aware) */}
      {hasRescheduleLog && (
        <Alert
          severity={currentUser?.role === 'TECHNICIAN' ? 'info' : 'warning'}
          sx={{
            mb: 3,
            maxWidth: 900,
            backgroundColor: currentUser?.role === 'TECHNICIAN' ? 'rgba(0, 168, 255, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: currentUser?.role === 'TECHNICIAN' ? '#00A8FF' : '#F59E0B',
            border: currentUser?.role === 'TECHNICIAN' ? '1px solid #00A8FF' : '1px solid #F59E0B',
            fontWeight: 600
          }}
        >
          {currentUser?.role === 'TECHNICIAN' ? (
            <>ℹ️ <strong>Reschedule Notice:</strong> You rescheduled this service appointment. The updated schedule and customer notification logs are active below.</>
          ) : (
            <>⚠️ <strong>Appointment Rescheduled by Technician:</strong> Your technician has updated the appointment schedule. Please review the updated date, time, and history logs below.</>
          )}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 900, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress color="primary" />
      ) : progressData ? (
        <Grid container spacing={4} sx={{ maxWidth: 900 }}>
          {/* Main Visual Stepper Card */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3,
                p: 4,
                border: '1px solid #2A364F'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>TRACKING NUMBER</Typography>
                  <Typography variant="h6" sx={{ color: '#00A8FF', fontWeight: 700 }}>
                    {progressData.trackingId}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', mt: 0.5, fontWeight: 600 }}>
                    {progressData.title || `${progressData.deviceCategory} Support Request`}
                  </Typography>
                </Box>
                <Chip
                  label={progressData.currentStatus}
                  sx={{
                    backgroundColor: progressData.currentStatus === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : progressData.currentStatus === 'RESCHEDULED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 168, 255, 0.2)',
                    color: progressData.currentStatus === 'COMPLETED' ? '#10B981' : progressData.currentStatus === 'RESCHEDULED' ? '#F59E0B' : '#00A8FF',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                />
              </Box>

              {/* Progress Stepper Timeline */}
              <Box sx={{ my: 4 }}>
                <Stepper activeStep={progressData.currentStageIndex} connector={<ColorlibConnector />} alternativeLabel>
                  {stagesList.map((stage, idx) => {
                    const isCompleted = idx < progressData.currentStageIndex;
                    const isActive = idx === progressData.currentStageIndex;
                    return (
                      <Step key={stage.key}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Avatar
                              sx={{
                                width: 42,
                                height: 42,
                                backgroundColor: isCompleted ? '#10B981' : isActive ? '#00A8FF' : '#0F172A',
                                color: isCompleted || isActive ? '#0D1527' : '#94A3B8',
                                border: isActive ? '3px solid #38BDF8' : '1px solid #2A364F',
                                boxShadow: isActive ? '0 0 12px rgba(0, 168, 255, 0.5)' : 'none'
                              }}
                            >
                              {stage.icon}
                            </Avatar>
                          )}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: isActive ? '#00A8FF' : isCompleted ? '#10B981' : '#94A3B8',
                              fontWeight: isActive ? 700 : 500,
                              display: 'block',
                              mt: 0.5
                            }}
                          >
                            {stage.label}
                          </Typography>
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Box>
            </Paper>
          </Grid>

          {/* Activity Logs Timeline */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3,
                p: 3,
                border: '1px solid #2A364F'
              }}
            >
              <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 700, mb: 2 }}>
                Service Lifecycle History Logs
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {progressData.logs && progressData.logs.length > 0 ? (
                  progressData.logs.map((log, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        backgroundColor: '#0F172A',
                        borderRadius: 2,
                        borderLeft: log.note && log.note.includes('rescheduled') ? '4px solid #F59E0B' : '4px solid #00A8FF'
                      }}
                    >
                      <CheckCircle2 size={20} color={log.note && log.note.includes('rescheduled') ? '#F59E0B' : '#00A8FF'} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>
                          Stage: {log.status}
                        </Typography>
                        <Typography variant="caption" sx={{ color: log.note && log.note.includes('rescheduled') ? '#FBBF24' : '#94A3B8' }}>
                          {log.note || 'Status updated in system.'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    No activity logs recorded yet.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#172036', borderRadius: 3, border: '1px dashed #2A364F', maxWidth: 900, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#94A3B8' }}>
            Select a service ticket above or enter your Tracking ID to view its live progress.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ServiceProgressTracker;
