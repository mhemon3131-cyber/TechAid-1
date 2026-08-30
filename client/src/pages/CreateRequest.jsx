import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import {
  Laptop,
  Monitor,
  Smartphone,
  Printer,
  Wifi,
  MessageSquare,
  Video,
  Home,
  UploadCloud,
  CheckCircle2,
  Calendar,
  AlertOctagon,
  Zap,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Phone
} from 'lucide-react';
import { createServiceRequest } from '../services/api';

export const CreateRequest = ({ currentUser, onNavigateToAppointment, onNavigateToChat }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Form State
  const [deviceCategory, setDeviceCategory] = useState('Laptop');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Moderate');
  const [serviceMethod, setServiceMethod] = useState('Home Visit');
  const [attachments, setAttachments] = useState([]);

  // Dedicated Emergency Form State
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.phone || '+8801700000000');
  const [emergencyNote, setEmergencyNote] = useState('');

  const categories = [
    { label: 'Laptop', icon: <Laptop size={20} /> },
    { label: 'Desktop', icon: <Monitor size={20} /> },
    { label: 'Phone', icon: <Smartphone size={20} /> },
    { label: 'Printer', icon: <Printer size={20} /> },
    { label: 'Internet', icon: <Wifi size={20} /> }
  ];

  const urgencyLevels = [
    { label: 'Low', color: '#3B82F6' },
    { label: 'Moderate', color: '#F59E0B' },
    { label: 'Critical', color: '#EF4444' }
  ];

  const serviceMethods = [
    { label: 'Live Chat', icon: <MessageSquare size={18} /> },
    { label: 'Video Call', icon: <Video size={18} /> },
    { label: 'Home Visit', icon: <Home size={18} /> }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setAttachments([
        ...attachments,
        { name: file.name, type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE', url: fileUrl }
      ]);
    }
  };

  const handleDispatchEmergency = async () => {
    setEmergencyLoading(true);
    setError('');
    try {
      const emgDesc = emergencyNote.trim() || description.trim() || 'CRITICAL EMERGENCY: Immediate technical dispatch requested for server/laptop/network outage.';
      const payload = {
        customerId: currentUser?.id || 'usr-1',
        deviceCategory,
        title: `CRITICAL EMERGENCY: ${deviceCategory} Outage`,
        description: `${emgDesc} (Contact Phone: ${emergencyPhone})`,
        urgency: 'Critical',
        serviceMethod: 'Emergency Dispatch',
        attachments
      };

      const response = await createServiceRequest(payload);
      if (response.success) {
        setSubmittedData(response.data);
        localStorage.setItem('techaid_active_request', JSON.stringify(response.data));
        localStorage.setItem('techaid_active_tracking_id', response.data.trackingId);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to dispatch emergency request.';
      setError(errMsg);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe your technical issue before submitting.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        customerId: currentUser?.id || 'usr-1',
        customerName: currentUser?.name || 'Customer',
        deviceCategory,
        title: `${deviceCategory} Issue: ${description.slice(0, 35)}...`,
        description: description.trim(),
        urgency,
        serviceMethod,
        attachments
      };

      const response = await createServiceRequest(payload);
      if (response.success) {
        setSubmittedData(response.data);
        localStorage.setItem('techaid_active_request', JSON.stringify(response.data));
        localStorage.setItem('techaid_active_tracking_id', response.data.trackingId);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to submit service request.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: '#00A8FF', fontWeight: 700, letterSpacing: 1 }}>
          MEMBER 2 • MODULE 1 (FEATURE 2.1)
        </Typography>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 800, mt: 0.5 }}>
          Service Request Creation
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Step {step} of 2 — {step === 1 ? 'Describe device & issue' : 'Review & Attach files'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {step === 1 ? (
        /* STEP 1: Two Column Layout matching User Screenshot */
        <Grid container spacing={3}>
          {/* Left Column: Standard Request Form */}
          <Grid item xs={12} lg={currentUser?.role === 'TECHNICIAN' ? 12 : 7}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3.5,
                p: { xs: 2.5, md: 4 },
                border: '1px solid #2A364F'
              }}
            >
              {/* Device Category */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
                Device Category
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', mb: 3.5 }}>
                {categories.map((cat) => {
                  const selected = deviceCategory === cat.label;
                  return (
                    <Button
                      key={cat.label}
                      onClick={() => setDeviceCategory(cat.label)}
                      startIcon={cat.icon}
                      sx={{
                        backgroundColor: selected ? '#00A8FF' : '#0F172A',
                        color: selected ? '#0D1527' : '#94A3B8',
                        border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                        px: 2.2,
                        py: 1,
                        fontWeight: 700,
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: selected ? '#00A8FF' : '#1E293B'
                        }
                      }}
                    >
                      {cat.label}
                    </Button>
                  );
                })}
              </Box>

              {/* Describe Issue */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
                Describe the issue
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what problem you are facing..."
                sx={{
                  mb: 3.5,
                  backgroundColor: '#0F172A',
                  borderRadius: 2.5,
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    '& fieldset': { borderColor: '#2A364F' },
                    '&:hover fieldset': { borderColor: '#00A8FF' },
                    '&.Mui-focused fieldset': { borderColor: '#00A8FF' }
                  }
                }}
              />

              {/* Urgency & Service Method */}
              <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
                    Urgency
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {urgencyLevels.map((lvl) => {
                      const selected = urgency === lvl.label;
                      return (
                        <Button
                          key={lvl.label}
                          fullWidth
                          onClick={() => setUrgency(lvl.label)}
                          sx={{
                            backgroundColor: selected ? lvl.color : '#0F172A',
                            color: selected ? '#FFFFFF' : '#94A3B8',
                            border: selected ? `1px solid ${lvl.color}` : '1px solid #2A364F',
                            py: 1,
                            fontWeight: 700,
                            borderRadius: '8px',
                            '&:hover': { backgroundColor: selected ? lvl.color : '#1E293B' }
                          }}
                        >
                          {lvl.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
                    Service method
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {serviceMethods.map((sm) => {
                      const selected = serviceMethod === sm.label;
                      return (
                        <Button
                          key={sm.label}
                          onClick={() => setServiceMethod(sm.label)}
                          startIcon={sm.icon}
                          sx={{
                            justifyContent: 'flex-start',
                            backgroundColor: selected ? 'rgba(0, 168, 255, 0.15)' : '#0F172A',
                            color: selected ? '#00A8FF' : '#94A3B8',
                            border: selected ? '1px solid #00A8FF' : '1px solid #2A364F',
                            px: 2,
                            py: 1,
                            borderRadius: '8px',
                            '&:hover': { backgroundColor: selected ? 'rgba(0, 168, 255, 0.25)' : '#1E293B' }
                          }}
                        >
                          {sm.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => setStep(2)}
                  disabled={!description.trim()}
                  sx={{
                    backgroundColor: '#00A8FF',
                    color: '#0D1527',
                    fontWeight: 700,
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#0082C8' }
                  }}
                >
                  Next Step (Attachments)
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Dedicated "Request Emergency Support" Card (Customers Only) */}
          {currentUser?.role !== 'TECHNICIAN' && (
            <Grid item xs={12} lg={5}>
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: '#131C31',
                  borderRadius: 4,
                  p: { xs: 2.5, md: 3.5 },
                  border: '1px solid #EF4444',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5
                }}
              >
                {/* Card Title Header */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                      border: '1px solid rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <AlertOctagon size={24} />
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: '#FFFFFF', fontSize: '1.25rem' }}>
                    Request Emergency Support
                  </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                  Need immediate help for a critical server, laptop, or network outage? Request immediate technician dispatch to your location or priority queue.
                </Typography>

                <Divider sx={{ borderColor: '#2A364F' }} />

                {/* Feature Highlights matching screenshot */}
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.8} alignItems="flex-start">
                    <Box sx={{ color: '#EF4444', mt: 0.3 }}>
                      <Zap size={18} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      Response Time: <span style={{ fontWeight: 400, color: '#94A3B8' }}>Under 15 minutes guaranteed</span>
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.8} alignItems="flex-start">
                    <Box sx={{ color: '#F59E0B', mt: 0.3 }}>
                      <Clock size={18} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      24/7 Availability: <span style={{ fontWeight: 400, color: '#94A3B8' }}>Immediate Technician Alert</span>
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.8} alignItems="flex-start">
                    <Box sx={{ color: '#00A8FF', mt: 0.3 }}>
                      <AlertTriangle size={18} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      Priority Queue: <span style={{ fontWeight: 400, color: '#94A3B8' }}>First-class dispatch routing</span>
                    </Typography>
                  </Stack>
                </Stack>

                {/* Contact Phone Input */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1 }}>
                    Contact Phone for Emergency Dispatch
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+8801700000000"
                    sx={{
                      backgroundColor: '#0F172A',
                      borderRadius: 2.5,
                      '& .MuiOutlinedInput-root': {
                        color: '#FFF',
                        fontWeight: 600,
                        '& fieldset': { borderColor: '#2A364F' },
                        '&:hover fieldset': { borderColor: '#EF4444' },
                        '&.Mui-focused fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />
                </Box>

                {/* Emergency Note Input */}
                <Box>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1 }}>
                    Emergency Note (Optional)
                  </Typography>
                  <TextField
                    multiline
                    rows={2}
                    fullWidth
                    value={emergencyNote}
                    onChange={(e) => setEmergencyNote(e.target.value)}
                    placeholder="Briefly state critical emergency details..."
                    sx={{
                      backgroundColor: '#0F172A',
                      borderRadius: 2.5,
                      '& .MuiOutlinedInput-root': {
                        color: '#FFF',
                        '& fieldset': { borderColor: '#2A364F' },
                        '&:hover fieldset': { borderColor: '#EF4444' },
                        '&.Mui-focused fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />
                </Box>

                {/* Red Dispatch Button matching screenshot */}
                <Button
                  fullWidth
                  size="large"
                  onClick={handleDispatchEmergency}
                  disabled={emergencyLoading}
                  startIcon={emergencyLoading ? <CircularProgress size={20} color="inherit" /> : <ShieldAlert size={20} />}
                  sx={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '1rem',
                    py: 1.6,
                    mt: 1,
                    borderRadius: '30px',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                    '&:hover': {
                      backgroundColor: '#DC2626',
                      boxShadow: '0 6px 25px rgba(239, 68, 68, 0.6)'
                    }
                  }}
                >
                  {emergencyLoading ? 'Dispatching...' : 'Dispatch Emergency Request'}
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        /* STEP 2: Attachments & Review */
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#172036',
            borderRadius: 3,
            p: 4,
            border: '1px solid #2A364F',
            maxWidth: 800
          }}
        >
          <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 700, mb: 2 }}>
            Attach Screenshots or Voice Clips
          </Typography>

          <Box
            sx={{
              border: '2px dashed #2A364F',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              backgroundColor: '#0F172A',
              mb: 3
            }}
          >
            <UploadCloud size={40} color="#00A8FF" style={{ marginBottom: 12 }} />
            <Typography variant="body1" sx={{ color: '#FFF', fontWeight: 600, mb: 0.5 }}>
              Drag & Drop files here or click to upload
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
              Supports Images, Voice Recordings, or PDF Diagnostics
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ borderColor: '#00A8FF', color: '#00A8FF', fontWeight: 600 }}
            >
              Select File
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
          </Box>

          {/* Uploaded Files List */}
          {attachments.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1 }}>
                ATTACHED FILES ({attachments.length})
              </Typography>
              <Stack spacing={1}>
                {attachments.map((file, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, backgroundColor: '#0F172A', border: '1px solid #2A364F', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#FFF' }}>
                      {file.name}
                    </Typography>
                    <Chip label={file.type} size="small" color="primary" variant="outlined" />
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setStep(1)}
              sx={{ color: '#94A3B8', borderColor: '#2A364F' }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                backgroundColor: '#00A8FF',
                color: '#0D1527',
                fontWeight: 700,
                px: 4,
                py: 1.2,
                borderRadius: 2,
                '&:hover': { backgroundColor: '#0082C8' }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Service Request'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Success Modal */}
      <Dialog
        open={Boolean(submittedData)}
        onClose={() => setSubmittedData(null)}
        PaperProps={{
          sx: { backgroundColor: '#172036', color: '#FFF', borderRadius: 3, border: '1px solid #2A364F', p: 2, minWidth: 400 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 8px auto', display: 'block' }} />
          <Typography variant="h6" fontWeight={700}>
            Service Request Created!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', mb: 2 }}>
            Your request has been registered in the system.
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#0F172A', borderColor: '#2A364F', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
              TRACKING ID
            </Typography>
            <Typography variant="h6" sx={{ color: '#00A8FF', fontWeight: 800 }}>
              {submittedData?.trackingId}
            </Typography>

            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1.5 }}>
              SERVICE METHOD
            </Typography>
            <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 700 }}>
              {submittedData?.serviceMethod}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
          {onNavigateToAppointment && (
            <Button
              variant="outlined"
              startIcon={<Calendar size={16} />}
              onClick={() => {
                setSubmittedData(null);
                onNavigateToAppointment();
              }}
              sx={{ color: '#00A8FF', borderColor: '#00A8FF' }}
            >
              Book Appointment
            </Button>
          )}
          {onNavigateToChat && (
            <Button
              variant="contained"
              startIcon={<MessageSquare size={16} />}
              onClick={() => {
                setSubmittedData(null);
                onNavigateToChat();
              }}
              sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700 }}
            >
              Open Live Chat
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateRequest;
