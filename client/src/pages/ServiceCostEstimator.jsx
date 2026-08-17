import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  MenuItem,
  Select
} from '@mui/material';
import { Laptop, Monitor, Smartphone, Printer, Wifi, Calculator, MessageSquare, Video, Home } from 'lucide-react';
import { estimateServiceCost, getTechnicians } from '../services/api';

const categories = [
  { label: 'Laptop', icon: <Laptop size={16} /> },
  { label: 'Desktop', icon: <Monitor size={16} /> },
  { label: 'Phone', icon: <Smartphone size={16} /> },
  { label: 'Printer', icon: <Printer size={16} /> },
  { label: 'Internet', icon: <Wifi size={16} /> }
];

const severities = [
  { label: 'Low', color: '#3B82F6' },
  { label: 'Moderate', color: '#F59E0B' },
  { label: 'Critical', color: '#EF4444' }
];

const serviceTypes = [
  { label: 'Live Chat', icon: <MessageSquare size={16} /> },
  { label: 'Video Call', icon: <Video size={16} /> },
  { label: 'Home Visit', icon: <Home size={16} /> }
];

export const ServiceCostEstimator = () => {
  const [deviceCategory, setDeviceCategory] = useState('Laptop');
  const [severity, setSeverity] = useState('Moderate');
  const [serviceType, setServiceType] = useState('Live Chat');
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTechnicians();
        if (res.success) {
          setTechnicians(res.data);
          if (res.data.length > 0) setTechnicianId(res.data[0].id);
        }
      } catch (err) {
        // Technician list is optional context for the estimate; ignore failures silently.
      }
    })();
  }, []);

  const handleEstimate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await estimateServiceCost({ deviceCategory, severity, serviceType, technicianId });
      if (response.success) setResult(response.data);
    } catch (err) {
      setError('Could not calculate an estimate right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: '#00A8FF', fontWeight: 700, letterSpacing: 1 }}>
          MEMBER 1 • MODULE 3 (FEATURE 3.2)
        </Typography>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700, mt: 0.5 }}>
          Service Cost Estimation System
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Compare expected repair cost before confirming a booking.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ backgroundColor: '#172036', borderRadius: 3, p: 4, border: '1px solid #2A364F' }}>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
              Device Category
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
              {categories.map((cat) => {
                const selected = deviceCategory === cat.label;
                return (
                  <Chip
                    key={cat.label}
                    icon={cat.icon}
                    label={cat.label}
                    onClick={() => setDeviceCategory(cat.label)}
                    sx={{
                      backgroundColor: selected ? 'rgba(0, 168, 255, 0.15)' : '#0D1527',
                      color: selected ? '#00A8FF' : '#94A3B8',
                      border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                      fontWeight: 600
                    }}
                  />
                );
              })}
            </Box>

            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
              Issue Severity
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
              {severities.map((s) => {
                const selected = severity === s.label;
                return (
                  <Chip
                    key={s.label}
                    label={s.label}
                    onClick={() => setSeverity(s.label)}
                    sx={{
                      backgroundColor: selected ? `${s.color}22` : '#0D1527',
                      color: selected ? s.color : '#94A3B8',
                      border: selected ? `1px solid ${s.color}` : '1px solid #2A364F',
                      fontWeight: 700
                    }}
                  />
                );
              })}
            </Box>

            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
              Preferred Service Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
              {serviceTypes.map((s) => {
                const selected = serviceType === s.label;
                return (
                  <Chip
                    key={s.label}
                    icon={s.icon}
                    label={s.label}
                    onClick={() => setServiceType(s.label)}
                    sx={{
                      backgroundColor: selected ? 'rgba(0, 168, 255, 0.15)' : '#0D1527',
                      color: selected ? '#00A8FF' : '#94A3B8',
                      border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                      fontWeight: 600
                    }}
                  />
                );
              })}
            </Box>

            {technicians.length > 0 && (
              <>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
                  Technician (affects travel distance & rating premium)
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                  sx={{
                    mb: 3,
                    backgroundColor: '#0D1527',
                    color: '#FFF',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A364F' }
                  }}
                >
                  {technicians.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name} — {t.specialty} ({t.distanceKm} km, ★{t.rating})
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}

            <Button
              fullWidth
              onClick={handleEstimate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: '#0D1527' }} /> : <Calculator size={18} />}
              sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700, py: 1.3, '&:hover': { backgroundColor: '#0090DD' } }}
            >
              {loading ? 'Calculating...' : 'Estimate Cost'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ backgroundColor: '#172036', borderRadius: 3, p: 4, border: '1px solid #2A364F', minHeight: 300 }}>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 2 }}>
              Estimated Cost
            </Typography>

            {!result ? (
              <Typography variant="body2" sx={{ color: '#475569', mt: 4, textAlign: 'center' }}>
                Fill in the details and click "Estimate Cost" to see a breakdown here.
              </Typography>
            ) : (
              <Box>
                <Typography variant="h3" sx={{ color: '#00A8FF', fontWeight: 800, mb: 0.5 }}>
                  {result.estimatedRange}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Approximate range for {result.deviceCategory} • {result.severity} • {result.serviceType}
                </Typography>

                <Divider sx={{ borderColor: '#2A364F', my: 2 }} />

                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  BREAKDOWN
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {[
                    ['Base diagnostic rate', `৳${result.breakdown.baseRate}`],
                    ['Severity multiplier', `× ${result.breakdown.severityMultiplier}`],
                    ['Technician rating factor', `× ${result.breakdown.ratingFactor}`],
                    ['Service type fee', `৳${result.breakdown.serviceTypeFee}`],
                    ['Travel fee (Home Visit only)', `৳${result.breakdown.travelFee}`]
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6 }}>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>{label}</Typography>
                      <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>

                {result.technician && (
                  <>
                    <Divider sx={{ borderColor: '#2A364F', my: 2 }} />
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Based on {result.technician.name} — {result.technician.distanceKm} km away, ★{result.technician.rating}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
