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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EmergencyQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchEmergencyQueue = () => {
    setLoading(true);
    axios
      .get('http://localhost:5000/api/requests/emergency/queue')
      .then((res) => {
        setRequests(res.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load emergency queue'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmergencyQueue();
  }, []);

  const handleAcceptRequest = (requestId) => {
    axios
      .put(`http://localhost:5000/api/requests/${requestId}/status`, {
        status: 'ACCEPTED',
        technicianId: 'usr-2',
        note: 'Technician accepted emergency request.',
      })
      .then(() => {
        navigate('/chat');
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to accept request');
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
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">No pending emergency requests in the queue.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {requests.map((r) => (
            <Grid item xs={12} key={r.id}>
              <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '6px solid', borderColor: 'error.main' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip label="EMERGENCY" color="error" size="small" sx={{ fontWeight: 800 }} />
                        <Chip label={r.deviceCategory} variant="outlined" size="small" />
                        <Typography variant="caption" color="text.secondary">
                          #{r.trackingId || r.id}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700}>
                        {r.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {r.description}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Customer:</strong> {r.customer?.name || 'Mehedi Hasan'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Service Method:</strong> {r.serviceMethod}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ textAlign: { sm: 'right' }, minWidth: 160 }}>
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleAcceptRequest(r.id)}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
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
