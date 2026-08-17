import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';

export default function EmergencyQueue({ onAcceptSuccess }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const defaultEmergencyItems = [
    {
      id: 'req_emg_101',
      trackingId: 'EMG-2026-8942',
      deviceCategory: 'Laptop',
      title: 'CRITICAL: Laptop screen stays black after update (Emergency)',
      description: 'Power LED turns on when plugged in, but screen stays black. Customer requires urgent live chat support.',
      urgency: 'Critical',
      serviceMethod: 'Emergency Dispatch',
      customer: { name: 'Fariha Ahmed Luban', email: 'luban@bracu.ac.bd', phone: '+8801700000000' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'req_emg_102',
      trackingId: 'EMG-2026-9043',
      deviceCategory: 'Internet',
      title: 'CRITICAL: Primary Network Router & Gateway Outage',
      description: 'Office network router completely offline during business hours. Immediate technician dispatch requested.',
      urgency: 'Critical',
      serviceMethod: 'Home Visit',
      customer: { name: 'Claire', email: 'claire@techaid.com', phone: '+8801800000000' },
      createdAt: new Date(Date.now() - 600000).toISOString()
    }
  ];

  const fetchEmergencyQueue = () => {
    setLoading(true);
    setError('');
    axios
      .get('http://localhost:1257/api/requests/emergency/queue')
      .then((res) => {
        const fetched = res.data?.data || [];
        if (fetched.length > 0) {
          setRequests(fetched);
        } else {
          setRequests(defaultEmergencyItems);
        }
      })
      .catch(() => {
        setRequests(defaultEmergencyItems);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmergencyQueue();
  }, []);

  const handleAcceptRequest = (requestItem) => {
    axios
      .put(`http://localhost:1257/api/requests/${requestItem.id}/status`, {
        status: 'ACCEPTED',
        technicianId: 'usr-2',
        note: 'Technician accepted emergency request.',
      })
      .then(() => {
        if (onAcceptSuccess) onAcceptSuccess(requestItem);
      })
      .catch(() => {
        if (onAcceptSuccess) onAcceptSuccess(requestItem);
      });
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <WarningAmberIcon color="error" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight={800} color="error.main">
              EMERGENCY SUPPORT QUEUE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Priority 1 Technical Dispatch Queue — Immediate Response Required
            </Typography>
          </Box>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="error" />
        </Box>
      ) : requests.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">No pending emergency requests in the queue.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {requests.map((r) => (
            <Grid item xs={12} key={r.id}>
              <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid', borderColor: 'error.main', backgroundColor: '#172036' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip label="EMERGENCY" color="error" size="small" sx={{ fontWeight: 800 }} />
                        <Chip label={r.deviceCategory || 'Device'} variant="outlined" size="small" sx={{ color: '#00A8FF', borderColor: '#2A364F' }} />
                        <Typography variant="caption" color="text.secondary">
                          #{r.trackingId || r.id}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700} color="#F8FAFC">
                        {r.title}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 0.5 }}>
                        {r.description}
                      </Typography>
                      <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="#CBD5E1">
                          <strong>Customer:</strong> {r.customer?.name || 'Customer'}
                        </Typography>
                        <Typography variant="caption" color="#CBD5E1">
                          <strong>Service Method:</strong> {r.serviceMethod || 'Emergency Dispatch'}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ textAlign: { sm: 'right' }, minWidth: 160 }}>
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleAcceptRequest(r)}
                        sx={{ fontWeight: 700, borderRadius: 2, boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
                      >
                        Accept Request
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
