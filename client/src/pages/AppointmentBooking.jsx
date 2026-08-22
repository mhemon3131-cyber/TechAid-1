import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
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
  Search,
  Star,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';

export const AppointmentBooking = ({ currentUser }) => {
  const [step, setStep] = useState(1);
  const [technicians, setTechnicians] = useState([]);
  const [fetchingTechs, setFetchingTechs] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
        monthName: monthName,
        year: year,
        fullDateStr: `${dayName}, ${monthName} ${dateNum}, ${year}`,
        shortLabel: `${dayName} ${dateNum}`
      });
    }
    return dates;
  };

  const dateOptions = getUpcomingDates();

  // Slot selection state
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.shortLabel || 'Mon 13');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 am');
  const [serviceType, setServiceType] = useState('Remote support');
  
  // PER-TECHNICIAN AND PER-DATE BOOKED SLOTS DICTIONARY (Fixes Leakage Bug!)
  // Key format: `${techId}_${formattedDate}` e.g. "tech-1_Mon, Aug 24, 2026"
  const [bookedMap, setBookedMap] = useState({});

  // Confirmation Modal & API state
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [conflictError, setConflictError] = useState('');

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

  const serviceTypes = ['Remote support', 'Home visit', 'Service center'];

  // Helper to format exact date string e.g. "Mon 24" -> "Mon, Aug 24, 2026"
  const getFormattedDateStr = (dateLabel) => {
    const found = dateOptions.find(d => d.shortLabel === dateLabel);
    return found ? found.fullDateStr : dateLabel;
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  // Fetch booked slots SPECIFIC to selected tech and SPECIFIC date whenever either changes
  useEffect(() => {
    if (selectedTech && selectedDate) {
      fetchBookedSlotsForCurrentSelection();
    }
  }, [selectedTech?.id, selectedDate]);

  const fetchTechs = async () => {
    setFetchingTechs(true);
    try {
      const res = await axios.get('http://localhost:1345/api/technicians');
      if (res.data.success && res.data.data.length > 0) {
        setTechnicians(res.data.data);
        setSelectedTech(res.data.data[0]);
      } else {
        setTechnicians([]);
        setSelectedTech(null);
      }
    } catch (err) {
      console.error('Failed to load technicians:', err);
      setTechnicians([]);
      setSelectedTech(null);
    } finally {
      setFetchingTechs(false);
    }
  };

  const fetchBookedSlotsForCurrentSelection = async () => {
    if (!selectedTech) return;
    const formattedDate = getFormattedDateStr(selectedDate);
    const key = `${selectedTech.id}_${formattedDate}`;

    try {
      const res = await axios.get(`http://localhost:1345/api/appointments?technicianId=${selectedTech.id}&date=${encodeURIComponent(formattedDate)}`);
      if (res.data.success) {
        const taken = res.data.data
          .filter(app => app.status !== 'REJECTED' && app.technicianId === selectedTech.id && app.date === formattedDate)
          .map(app => app.timeSlot);
        
        setBookedMap(prev => ({
          ...prev,
          [key]: taken
        }));
      }
    } catch (err) {
      // Keep local entries for this key if backend offline
    }
  };

  // Get currently booked slots for the active tech + active date
  const currentFormattedDate = getFormattedDateStr(selectedDate);
  const currentKey = selectedTech ? `${selectedTech.id}_${currentFormattedDate}` : '';
  const activeBookedSlots = bookedMap[currentKey] || [];

  const filteredTechs = (technicians || []).filter((t) => {
    if (!t) return false;
    const nameMatch = (t.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const specMatch = (t.specialty || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    return nameMatch || specMatch;
  });

  const handleConfirmBooking = async () => {
    setLoading(true);
    setConflictError('');

    if (activeBookedSlots.includes(selectedTimeSlot)) {
      setConflictError(`Scheduling Conflict: ${selectedTech?.name} is already booked for ${selectedTimeSlot} on ${selectedDate}. Please select another available time slot.`);
      setLoading(false);
      return;
    }

    const formattedDate = getFormattedDateStr(selectedDate);

    try {
      let activeRequest = null;
      try {
        activeRequest = JSON.parse(localStorage.getItem('techaid_active_request') || 'null');
      } catch (e) {}

      const payload = {
        technicianId: selectedTech ? selectedTech.id : null,
        date: formattedDate,
        timeSlot: selectedTimeSlot,
        serviceType,
        customerId: currentUser?.id || 'usr-1',
        serviceRequestId: activeRequest ? activeRequest.id : null
      };

      const res = await axios.post('http://localhost:1345/api/appointments', payload);
      if (res.data.success) {
        setBookingSuccess(res.data.data);
        setBookedMap(prev => ({
          ...prev,
          [currentKey]: [...(prev[currentKey] || []), selectedTimeSlot]
        }));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to book appointment.';
      setConflictError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700 }}>
          Appointment Scheduling System
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Select technician, date, time slot & prevent scheduling conflicts
        </Typography>
      </Box>

      {step === 1 ? (
        /* STEP 1: Choose a technician */
        <Box sx={{ maxWidth: 800 }}>
          <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 600, mb: 2 }}>
            Choose a technician
          </Typography>

          <TextField
            fullWidth
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search size={20} color="#94A3B8" style={{ marginRight: 10 }} />
            }}
            sx={{
              mb: 3,
              backgroundColor: '#172036',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                color: '#FFF',
                '& fieldset': { borderColor: '#2A364F' },
                '&:hover fieldset': { borderColor: '#00A8FF' },
                '&.Mui-focused fieldset': { borderColor: '#00A8FF' }
              }
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fetchingTechs ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#00A8FF', mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Loading available technicians from PostgreSQL database...
                </Typography>
              </Box>
            ) : filteredTechs.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#172036', border: '1px dashed #2A364F', borderRadius: 3 }}>
                <Typography variant="body1" sx={{ color: '#94A3B8' }}>
                  No technicians found in database. Please ensure a technician account exists to schedule an appointment.
                </Typography>
              </Paper>
            ) : (
              filteredTechs.map((tech) => (
                <Paper
                  key={tech.id}
                  elevation={0}
                  onClick={() => setSelectedTech(tech)}
                  sx={{
                    backgroundColor: '#172036',
                    borderRadius: 3,
                    p: 2.5,
                    border: selectedTech?.id === tech.id ? '2px solid #00A8FF' : '1px solid #2A364F',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#00A8FF' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        backgroundColor: '#0F172A',
                        color: '#00A8FF',
                        fontWeight: 700,
                        border: '2px solid #00A8FF'
                      }}
                    >
                      {tech.avatar || (tech.name ? tech.name.slice(0, 2).toUpperCase() : 'TC')}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 700 }}>
                        {tech.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {tech.specialty || 'General Hardware Specialist'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star size={18} fill="#F59E0B" color="#F59E0B" />
                      <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 700 }}>
                        {tech.rating || 4.8}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={16} color="#94A3B8" />
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {tech.distanceKm || 2.5} km
                      </Typography>
                    </Box>

                    {tech.isAvailable && (
                      <Chip label="Available" size="small" sx={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 700 }} />
                    )}
                  </Box>
                </Paper>
              ))
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => setStep(2)}
              disabled={!selectedTech}
              sx={{
                backgroundColor: '#00A8FF',
                color: '#0D1527',
                px: 4,
                py: 1.2,
                fontSize: '1rem',
                fontWeight: 700,
                '&:hover': { backgroundColor: '#38BDF8' }
              }}
            >
              Continue to Select Slot
            </Button>
          </Box>
        </Box>
      ) : (
        /* STEP 2: Calendar & Time Slots Screen (With Strict Dynamic Tech & Date Separation) */
        <Grid container spacing={4} sx={{ maxWidth: 1000 }}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3,
                p: 4,
                border: '1px solid #2A364F'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, p: 2, backgroundColor: '#0F172A', borderRadius: 2 }}>
                <Avatar sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700 }}>
                  {selectedTech?.avatar}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 700 }}>
                    {selectedTech?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {selectedTech?.specialty}
                  </Typography>
                </Box>
              </Box>

              {/* Date Selection */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                  Select an upcoming date
                </Typography>
                <Typography variant="caption" sx={{ color: '#00A8FF', fontWeight: 700 }}>
                  {dateOptions[0]?.monthName} {dateOptions[0]?.year}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 4, overflowX: 'auto', pb: 1 }}>
                {dateOptions.map((d) => {
                  const label = `${d.day} ${d.dateNum}`;
                  const selected = selectedDate === label;
                  return (
                    <Box
                      key={label}
                      onClick={() => setSelectedDate(label)}
                      sx={{
                        flex: 1,
                        minWidth: 55,
                        py: 1.2,
                        px: 1,
                        textAlign: 'center',
                        borderRadius: 2,
                        cursor: 'pointer',
                        backgroundColor: selected ? '#00A8FF' : '#0F172A',
                        color: selected ? '#0D1527' : '#FFF',
                        border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                        transition: 'all 0.2s',
                        '&:hover': { backgroundColor: selected ? '#00A8FF' : '#1E293B' }
                      }}
                    >
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                        {d.day}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {d.dateNum}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', opacity: 0.8 }}>
                        {d.monthName}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Time Slots: Dynamic Filtering for selectedTech + selectedDate ONLY */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
                Available time slots for {selectedTech?.name} — {getFormattedDateStr(selectedDate)}
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 4 }}>
                {timeSlots.map((slot) => {
                  const isBooked = activeBookedSlots.includes(slot);
                  const selected = selectedTimeSlot === slot;
                  return (
                    <Grid item xs={4} key={slot}>
                      <Button
                        fullWidth
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slot)}
                        sx={{
                          backgroundColor: isBooked ? '#1E293B' : selected ? '#00A8FF' : '#0F172A',
                          color: isBooked ? '#64748B' : selected ? '#0D1527' : '#94A3B8',
                          border: isBooked ? '1px dashed #334155' : selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                          py: 1,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textDecoration: isBooked ? 'line-through' : 'none',
                          '&:hover': { backgroundColor: isBooked ? '#1E293B' : selected ? '#00A8FF' : '#1E293B' }
                        }}
                      >
                        {slot} {isBooked ? '(Booked)' : ''}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Service Type */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
                Service type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
                {serviceTypes.map((st) => {
                  const selected = serviceType === st;
                  return (
                    <Button
                      key={st}
                      onClick={() => setServiceType(st)}
                      sx={{
                        backgroundColor: selected ? 'rgba(0, 168, 255, 0.15)' : '#0F172A',
                        color: selected ? '#00A8FF' : '#94A3B8',
                        border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        '&:hover': { backgroundColor: selected ? 'rgba(0, 168, 255, 0.25)' : '#1E293B' }
                      }}
                    >
                      {st}
                    </Button>
                  );
                })}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={() => setStep(1)} sx={{ color: '#94A3B8', border: '1px solid #2A364F' }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setOpenModal(true)}
                  disabled={activeBookedSlots.includes(selectedTimeSlot)}
                  sx={{
                    backgroundColor: '#00A8FF',
                    color: '#0D1527',
                    py: 1.2,
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#38BDF8' }
                  }}
                >
                  Review Booking
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Booking Summary Confirmation Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#172036',
            color: '#FFF',
            borderRadius: 3,
            border: '1px solid #2A364F',
            p: 2,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Confirm your booking
          </Typography>
        </DialogTitle>

        <DialogContent>
          {conflictError && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
              {conflictError}
            </Alert>
          )}

          {bookingSuccess ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircle2 size={56} color="#10B981" style={{ margin: '0 auto 12px auto', display: 'block' }} />
              <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 700, mb: 1 }}>
                Booking Successful!
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                Saved in Prisma database & email dispatched via EmailJS API.
              </Typography>
              <Box sx={{ backgroundColor: '#0F172A', p: 2, borderRadius: 2, textAlign: 'left', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>APPOINTMENT ID</Typography>
                <Typography variant="body2" sx={{ color: '#00A8FF', fontWeight: 700 }}>{bookingSuccess.id}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>DATE & TIME</Typography>
                <Typography variant="body2" sx={{ color: '#FFF' }}>{bookingSuccess.date} at {bookingSuccess.timeSlot}</Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>Technician</Typography>
                <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{selectedTech?.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>Date & time</Typography>
                <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{getFormattedDateStr(selectedDate)}, {selectedTimeSlot}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>Service type</Typography>
                <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{serviceType}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>Estimated cost</Typography>
                <Typography variant="body2" sx={{ color: '#00A8FF', fontWeight: 700 }}>৳800 - 1,500</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {bookingSuccess ? (
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setBookingSuccess(null);
                setOpenModal(false);
                setStep(1);
              }}
              sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700 }}
            >
              Done
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={handleConfirmBooking}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                backgroundColor: '#00A8FF',
                color: '#0D1527',
                py: 1.2,
                fontWeight: 700,
                '&:hover': { backgroundColor: '#38BDF8' }
              }}
            >
              {loading ? 'Booking...' : 'Confirm booking'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
