import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Laptop,
  Monitor,
  Smartphone,
  Printer,
  Wifi,
  Sparkles,
  MessageSquare,
  Video,
  Home,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { classifyIssueWithAI, createServiceRequest } from '../services/api';

const categories = [
  { label: 'Laptop', icon: <Laptop size={18} /> },
  { label: 'Desktop', icon: <Monitor size={18} /> },
  { label: 'Phone', icon: <Smartphone size={18} /> },
  { label: 'Printer', icon: <Printer size={18} /> },
  { label: 'Internet', icon: <Wifi size={18} /> }
];

const severityColor = { Low: '#3B82F6', Moderate: '#F59E0B', Critical: '#EF4444' };
const methodIcon = { 'Live Chat': <MessageSquare size={16} />, 'Video Call': <Video size={16} />, 'Home Visit': <Home size={16} /> };

export const AIIssueClassifier = ({ currentUser, onNavigateToAppointment }) => {
  const [deviceCategory, setDeviceCategory] = useState('Laptop');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [aiEngine, setAiEngine] = useState('');
  const [created, setCreated] = useState(null);

  const handleAnalyze = async () => {
    if (!description || description.trim().length < 5) {
      setError('Please describe the issue in a bit more detail (at least 5 characters).');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setCreated(null);
    try {
      const response = await classifyIssueWithAI({ description, deviceCategory });
      if (response.success) {
        setResult(response.data);
        setAiEngine(response.aiEngine);
        if (response.data.deviceCategory) setDeviceCategory(response.data.deviceCategory);
      }
    } catch (err) {
      setError('Could not reach the AI classification service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!result) return;
    setCreating(true);
    try {
      const payload = {
        deviceCategory: result.deviceCategory || deviceCategory,
        title: `${result.deviceCategory || deviceCategory} Support: ${description.slice(0, 30)}...`,
        description,
        urgency: result.severity,
        serviceMethod: result.recommendedMethod,
        attachments: [],
        customerId: currentUser?.id
      };
      const response = await createServiceRequest(payload);
      if (response.success) {
        setCreated(response.data);
      }
    } catch (err) {
      setError('Analysis succeeded, but creating the service request failed. Please try again from New Request.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: '#00A8FF', fontWeight: 700, letterSpacing: 1 }}>
          MEMBER 1 • MODULE 1 (FEATURE 1.1)
        </Typography>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700, mt: 0.5 }}>
          AI-Powered Issue Classification
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Describe your problem and let AI identify the device category, severity, and best support method.
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
              Device Category (optional — AI can detect it)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
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
                      fontWeight: 600,
                      px: 1
                    }}
                  />
                );
              })}
            </Box>

            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
              Describe the Issue
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={5}
              placeholder="e.g. My laptop screen goes black randomly and it gets very hot after 20 minutes of use..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0D1527',
                  color: '#FFF',
                  '& fieldset': { borderColor: '#2A364F' },
                  '&:hover fieldset': { borderColor: '#00A8FF' }
                }
              }}
            />

            <Button
              fullWidth
              onClick={handleAnalyze}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: '#0D1527' }} /> : <Sparkles size={18} />}
              sx={{
                backgroundColor: '#00A8FF',
                color: '#0D1527',
                fontWeight: 700,
                py: 1.3,
                '&:hover': { backgroundColor: '#0090DD' }
              }}
            >
              {loading ? 'Analyzing with AI...' : 'Analyze with AI'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ backgroundColor: '#172036', borderRadius: 3, p: 4, border: '1px solid #2A364F', minHeight: 300 }}>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 2 }}>
              AI Analysis Result
            </Typography>

            {!result && !loading && (
              <Typography variant="body2" sx={{ color: '#475569', mt: 4, textAlign: 'center' }}>
                Submit an issue description to see the AI's classification here.
              </Typography>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress sx={{ color: '#00A8FF' }} />
              </Box>
            )}

            {result && (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={`Device: ${result.deviceCategory}`} sx={{ backgroundColor: '#0D1527', color: '#00A8FF', fontWeight: 700 }} />
                  <Chip
                    label={`Severity: ${result.severity}`}
                    sx={{ backgroundColor: `${severityColor[result.severity]}22`, color: severityColor[result.severity], fontWeight: 700 }}
                  />
                  <Chip label={`Complexity: ${result.complexity}`} sx={{ backgroundColor: '#0D1527', color: '#94A3B8', fontWeight: 700 }} />
                </Box>

                <Divider sx={{ borderColor: '#2A364F', my: 2 }} />

                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  RECOMMENDED SUPPORT METHOD
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
                  {methodIcon[result.recommendedMethod]}
                  <Typography variant="body1" sx={{ color: '#FFF', fontWeight: 700 }}>
                    {result.recommendedMethod}
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  AI REASONING
                </Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 0.5, mb: 3 }}>
                  {result.reasoning}
                </Typography>

                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 2 }}>
                  Powered by {aiEngine}
                </Typography>

                {!created ? (
                  <Button
                    fullWidth
                    onClick={handleCreateRequest}
                    disabled={creating}
                    endIcon={creating ? <CircularProgress size={16} sx={{ color: '#0D1527' }} /> : <ArrowRight size={16} />}
                    sx={{
                      backgroundColor: '#10B981',
                      color: '#0D1527',
                      fontWeight: 700,
                      py: 1.2,
                      '&:hover': { backgroundColor: '#0EA271' }
                    }}
                  >
                    {creating ? 'Creating Request...' : 'Create Service Request with This Analysis'}
                  </Button>
                ) : (
                  <Alert
                    icon={<CheckCircle2 size={18} />}
                    sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}
                  >
                    Request created! Tracking ID: <strong>{created.trackingId}</strong>
                    {onNavigateToAppointment && (
                      <Button size="small" onClick={onNavigateToAppointment} sx={{ color: '#10B981', ml: 1, fontWeight: 700 }}>
                        Book Appointment →
                      </Button>
                    )}
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
