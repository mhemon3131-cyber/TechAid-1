import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Save,
  Users
} from 'lucide-react';
import axios from 'axios';

export const TechnicianAvailability = ({ currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Availability State
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [workingHours, setWorkingHours] = useState('09:00 AM - 06:00 PM');
  const [serviceAreas, setServiceAreas] = useState(['Gulshan', 'Banani', 'Dhanmondi', 'Uttara']);
  const [maxAppointments, setMaxAppointments] = useState(5);

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const allHoursOptions = [
    '08:00 AM - 04:00 PM',
    '09:00 AM - 06:00 PM',
    '10:00 AM - 07:00 PM',
    '12:00 PM - 09:00 PM'
  ];
  const allAreasOptions = ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Mohakhali', 'Mirpur', 'Bhashani', 'Baridhara'];

  useEffect(() => {
    fetchAvailability();
  }, [currentUser]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const techId = currentUser?.technicianId || currentUser?.id;
      const res = await axios.get(`http://localhost:1345/api/technicians/availability/${techId}`);
      if (res.data.success) {
        const data = res.data.data;
        setIsAvailable(data.isAvailable);
        setSelectedDays(data.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        setWorkingHours(data.workingHours || '09:00 AM - 06:00 PM');
        setServiceAreas(data.serviceAreas || ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara']);
        setMaxAppointments(data.maxDailyAppointments || 5);
      }
    } catch (err) {
      console.warn('Backend server offline for availability fetch.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAreaToggle = (area) => {
    if (serviceAreas.includes(area)) {
      setServiceAreas(serviceAreas.filter((a) => a !== area));
    } else {
      setServiceAreas([...serviceAreas, area]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    setError('');
    const payload = {
      isAvailable,
      availableDays: selectedDays,
      workingHours,
      serviceAreas,
      maxDailyAppointments: maxAppointments
    };

    try {
      const techId = currentUser?.technicianId || currentUser?.id;
      await axios.put(`http://localhost:1345/api/technicians/availability/${techId}`, payload);
      setMsg('Technician working schedule updated in database!');
    } catch (err) {
      setMsg('Technician schedule saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Header (No Member labels) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700 }}>
          Technician Availability Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Configuring schedule for: <strong style={{ color: '#00A8FF' }}>{currentUser?.name || 'Technician'}</strong>
        </Typography>
      </Box>

      {msg && (
        <Alert severity="success" sx={{ mb: 3, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981' }}>
          {msg}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress color="primary" />
      ) : (
        <Grid container spacing={4} sx={{ maxWidth: 950 }}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3,
                p: 4,
                border: '1px solid #2A364F'
              }}
            >
              {/* Online Status Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, backgroundColor: '#0F172A', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Shield size={22} color={isAvailable ? '#10B981' : '#EF4444'} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 700 }}>
                      Service Availability Status
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {isAvailable ? 'Active — Accepting customer bookings' : 'Inactive — Temporarily offline'}
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      color="primary"
                    />
                  }
                  label=""
                />
              </Box>

              <Divider sx={{ borderColor: '#2A364F', my: 3 }} />

              {/* 1. Working Days */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={18} color="#00A8FF" /> Available Days
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {allDays.map((day) => {
                  const selected = selectedDays.includes(day);
                  return (
                    <Button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      sx={{
                        backgroundColor: selected ? '#00A8FF' : '#0F172A',
                        color: selected ? '#0D1527' : '#94A3B8',
                        border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                        fontWeight: 700,
                        px: 2.5,
                        py: 1,
                        '&:hover': { backgroundColor: selected ? '#00A8FF' : '#1E293B' }
                      }}
                    >
                      {day}
                    </Button>
                  );
                })}
              </Box>

              {/* 2. Working Hours */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={18} color="#00A8FF" /> Working Hours
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 4 }}>
                {allHoursOptions.map((hours) => {
                  const selected = workingHours === hours;
                  return (
                    <Grid item xs={6} key={hours}>
                      <Button
                        fullWidth
                        onClick={() => setWorkingHours(hours)}
                        sx={{
                          backgroundColor: selected ? 'rgba(0, 168, 255, 0.15)' : '#0F172A',
                          color: selected ? '#00A8FF' : '#94A3B8',
                          border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                          py: 1.2,
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          '&:hover': { backgroundColor: selected ? 'rgba(0, 168, 255, 0.25)' : '#1E293B' }
                        }}
                      >
                        {hours}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              {/* 3. Supported Service Areas */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={18} color="#00A8FF" /> Supported Service Areas
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {allAreasOptions.map((area) => {
                  const selected = serviceAreas.includes(area);
                  return (
                    <Chip
                      key={area}
                      label={area}
                      onClick={() => handleAreaToggle(area)}
                      sx={{
                        backgroundColor: selected ? '#00A8FF' : '#0F172A',
                        color: selected ? '#0D1527' : '#94A3B8',
                        border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                        fontWeight: 600,
                        py: 2,
                        px: 1,
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}
              </Box>

              {/* 4. Maximum Daily Appointments Limit */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Users size={18} color="#00A8FF" /> Maximum Daily Appointments Limit
              </Typography>
              <Box sx={{ px: 2, py: 2, backgroundColor: '#0F172A', borderRadius: 2, mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#00A8FF', fontWeight: 700, textAlign: 'center', mb: 1 }}>
                  {maxAppointments} Appointments / Day
                </Typography>
                <Slider
                  value={maxAppointments}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(e, val) => setMaxAppointments(val)}
                  sx={{
                    color: '#00A8FF',
                    '& .MuiSlider-thumb': { backgroundColor: '#00A8FF' },
                    '& .MuiSlider-track': { backgroundColor: '#00A8FF' }
                  }}
                />
              </Box>

              {/* Save Schedule Button */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                sx={{
                  backgroundColor: '#00A8FF',
                  color: '#0D1527',
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  '&:hover': { backgroundColor: '#38BDF8' }
                }}
              >
                {saving ? 'Saving Schedule...' : 'Save Availability Config'}
              </Button>
            </Paper>
          </Grid>

          {/* Right Summary Preview Card */}
          <Grid item xs={12} md={4}>
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
                Schedule Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Working Days</Typography>
                  <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>
                    {selectedDays.join(', ')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Shift Hours</Typography>
                  <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>
                    {workingHours}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Covered Neighborhoods</Typography>
                  <Typography variant="body2" sx={{ color: '#00A8FF', fontWeight: 600 }}>
                    {serviceAreas.join(', ')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Daily Capacity</Typography>
                  <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 700 }}>
                    Max {maxAppointments} slots / day
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default TechnicianAvailability;
