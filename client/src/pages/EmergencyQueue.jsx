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

export default function EmergencyQueue({ currentUser, onAcceptSuccess }) {
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
      customer: { id: 'usr-1', name: 'Fariha Ahmed Luban', email: 'luban@bracu.ac.bd', phone: '+8801700000000' },
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
      customer: { id: 'usr-claire', name: 'Claire', email: 'claire@techaid.com', phone: '+8801800000000' },
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
    const techId = currentUser?.id || 'usr-4';
    const techName = currentUser?.name || 'Technician';

    axios
      .put(`http://localhost:1257/api/requests/${requestItem.id}/status`, {
        status: 'ACCEPTED',
        technicianId: techId,
        technicianName: techName,
        note: `Technician ${techName} accepted emergency request.`,
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
      ) : (
        <Grid container spacing={2.5}>
          {requests.map((req) => (
            <Grid item xs={12} key={req.id}>
              <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid #EF4444' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={`Tracking: ${req.trackingId || req.id}`} size="small" color="error" />
                      <Chip label={`Device: ${req.deviceCategory}`} size="small" variant="outlined" />
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Submitted: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {req.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {req.description}
                  </Typography>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#0F172A', mb: 2.5 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          CUSTOMER NAME
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {req.customer?.name || 'Customer'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          CONTACT EMAIL
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {req.customer?.email || 'customer@techaid.com'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          SERVICE TYPE
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700} color="error.main">
                          {req.serviceMethod || 'Emergency Dispatch'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Stack direction="row" justifyContent="flex-end" spacing={2}>
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleAcceptRequest(req)}
                      sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
                    >
                      Accept & Open Customer Live Chat
                    </Button>
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
