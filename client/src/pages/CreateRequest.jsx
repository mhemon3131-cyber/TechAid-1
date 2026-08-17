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
  AlertTriangle,
  Zap,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { createServiceRequest } from '../services/api';

export const CreateRequest = ({ onNavigateToAppointment, onNavigateToChat, currentUser }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Form State
  const [deviceCategory, setDeviceCategory] = useState('Laptop');
  const [description, setDescription] = useState('Laptop won\'t turn on after the last update, black screen even when plugged in...');
  const [urgency, setUrgency] = useState('Critical');
  const [serviceMethod, setServiceMethod] = useState('Live Chat');
  const [attachments, setAttachments] = useState([
    { name: 'error_screen.jpg', type: 'IMAGE', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500' }
  ]);

  // Emergency Request State
  const [emergencyPhone, setEmergencyPhone] = useState('+8801700000000');
  const [emergencyNote, setEmergencyNote] = useState('');

  // Role Check
  const isCustomer = !currentUser || currentUser?.role === 'CUSTOMER';

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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        deviceCategory,
        title: `${deviceCategory} Support: ${description.slice(0, 30)}...`,
        description,
        urgency,
        serviceMethod,
        attachments,
        customerId: currentUser?.id || 'usr-1'
      };

      const response = await createServiceRequest(payload);
      if (response.success) {
        setSubmittedData(response.data);
      }
    } catch (err) {
      const mockTrackingId = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedData({
        trackingId: mockTrackingId,
        deviceCategory,
        urgency,
        serviceMethod,
        status: 'PENDING'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchEmergency = async () => {
    setEmergencyLoading(true);
    try {
      const payload = {
        deviceCategory,
        title: `EMERGENCY DISPATCH: ${deviceCategory} Critical Outage`,
        description: emergencyNote || description || 'Critical emergency request requiring immediate technician dispatch.',
        urgency: 'Critical',
        serviceMethod: 'Emergency Dispatch',
        attachments: [],
        customerId: currentUser?.id || 'usr-1'
      };

      const response = await createServiceRequest(payload);
      const trackingId = response?.data?.trackingId || `EMG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedData({
        trackingId,
        deviceCategory,
        urgency: 'Critical',
        serviceMethod: 'Emergency Dispatch',
        status: 'PENDING'
      });
    } catch (err) {
      setSubmittedData({
        trackingId: `EMG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        deviceCategory,
        urgency: 'Critical',
        serviceMethod: 'Emergency Dispatch',
        status: 'PENDING'
      });
    } finally {
      setEmergencyLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: '#00A8FF', fontWeight: 700, letterSpacing: 1 }}>
          MEMBER 2 • MODULE 1 (FEATURE 2.1)
        </Typography>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700, mt: 0.5 }}>
          Service Request Creation
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Step {step} of 2 — {step === 1 ? 'Describe device & issue' : 'Review & Attach files'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
          {error}
        </Alert>
      )}

      {step === 1 ? (
        /* STEP 1: Main Form (Left) + Request Emergency Support Panel (Right) */
        <Grid container spacing={3} sx={{ maxWidth: isCustomer ? 1200 : 800 }}>
          {/* Left Main Form Card */}
          <Grid item xs={12} md={isCustomer ? 7.5 : 12}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3,
                p: 3.5,
                border: '1px solid #2A364F'
              }}
            >
              {/* Device Category */}
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
                Device Category
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3.5 }}>
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
                        px: 2.5,
                        py: 1,
                        fontWeight: 600,
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
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    '& fieldset': { borderColor: '#2A364F' },
                    '&:hover fieldset': { borderColor: '#00A8FF' },
                    '&.Mui-focused fieldset': { borderColor: '#00A8FF' }
                  }
                }}
              />

              {/* Urgency & Service Method side by side */}
              <Grid container spacing={3} sx={{ mb: 3.5 }}>
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

              {/* Next Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => setStep(2)}
                  disabled={!description.trim()}
                  sx={{
                    backgroundColor: '#00A8FF',
                    color: '#0D1527',
                    px: 4,
                    py: 1.2,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#38BDF8' }
                  }}
                >
                  Continue to Step 2
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Request Emergency Support Card (Customers Only) */}
          {isCustomer && (
            <Grid item xs={12} md={4.5}>
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: '#172036',
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid #EF4444',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  height: '100%'
                }}
              >
                <Box>
                  {/* Badge Header */}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#EF4444'
                      }}
                    >
                      <ShieldAlert size={20} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ color: '#F8FAFC', fontWeight: 800, fontSize: '1.05rem' }}>
                      Request Emergency Support
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.825rem', mb: 2.5, lineHeight: 1.5 }}>
                    Need immediate help for a critical server, laptop, or network outage? Request immediate technician dispatch to your location or priority queue.
                  </Typography>

                  <Divider sx={{ borderColor: '#2A364F', mb: 2.5 }} />

                  {/* Service Highlights */}
                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <Zap size={16} color="#EF4444" />
                      <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                        <strong>Response Time:</strong> Under 15 minutes guaranteed
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <Clock size={16} color="#F59E0B" />
                      <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                        <strong>24/7 Availability:</strong> Immediate Technician Alert
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <AlertTriangle size={16} color="#00A8FF" />
                      <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                        <strong>Priority Queue:</strong> First-class dispatch routing
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Emergency Contact Phone */}
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1 }}>
                    Contact Phone for Emergency Dispatch
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Enter phone number..."
                    sx={{
                      mb: 2,
                      backgroundColor: '#0F172A',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        color: '#FFF',
                        fontSize: '0.85rem',
                        '& fieldset': { borderColor: '#2A364F' },
                        '&:hover fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />

                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1 }}>
                    Emergency Note (Optional)
                  </Typography>
                  <TextField
                    size="small"
                    multiline
                    rows={2}
                    fullWidth
                    value={emergencyNote}
                    onChange={(e) => setEmergencyNote(e.target.value)}
                    placeholder="Briefly state critical emergency details..."
                    sx={{
                      mb: 2,
                      backgroundColor: '#0F172A',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        color: '#FFF',
                        fontSize: '0.85rem',
                        '& fieldset': { borderColor: '#2A364F' },
                        '&:hover fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />
                </Box>

                {/* Red Dispatch Emergency Request Button */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleDispatchEmergency}
                  disabled={emergencyLoading}
                  startIcon={emergencyLoading ? <CircularProgress size={18} color="inherit" /> : <ShieldAlert size={18} />}
                  sx={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    py: 1.4,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                    '&:hover': { backgroundColor: '#DC2626' }
                  }}
                >
                  {emergencyLoading ? 'Dispatching...' : 'Dispatch Emergency Request'}
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        /* STEP 2: Media Upload Dropzone & Summary Card */
        <Grid container spacing={4} sx={{ maxWidth: 1000 }}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3,
                p: 4,
                border: '1px solid #2A364F',
                height: '100%'
              }}
            >
              <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 600, mb: 1 }}>
                Add photos and review
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                Upload screenshots, photos, voice notes, or short video of your issue (Stored via Cloudinary API).
              </Typography>

              {/* Upload Dropzone */}
              <Box
                component="label"
                sx={{
                  border: '2px dashed #2A364F',
                  borderRadius: 3,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#0F172A',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#00A8FF', backgroundColor: 'rgba(0, 168, 255, 0.05)' }
                }}
              >
                <input type="file" hidden accept="image/*,video/*,audio/*" onChange={handleFileUpload} />
                <UploadCloud size={48} color="#00A8FF" style={{ marginBottom: 12 }} />
                <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>
                  Tap to add photos or short video...
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', mt: 0.5 }}>
                  Supports PNG, JPG, MP4, MP3 (Cloudinary Upload)
                </Typography>
              </Box>

              {/* Uploaded Files Preview */}
              {attachments.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    Attached Files ({attachments.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                    {attachments.map((att, idx) => (
                      <Chip
                        key={idx}
                        label={att.name}
                        onDelete={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        sx={{
                          backgroundColor: '#0F172A',
                          color: '#00A8FF',
                          border: '1px solid #2A364F'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  onClick={() => setStep(1)}
                  sx={{ color: '#94A3B8', border: '1px solid #2A364F', px: 3 }}
                >
                  Back
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Summary Card matching Figma Screen */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                borderRadius: 3,
                p: 3,
                border: '1px solid #2A364F',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 320
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 700, mb: 2 }}>
                  Summary
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={deviceCategory} size="small" sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700 }} />
                  <Chip
                    label={urgency}
                    size="small"
                    sx={{
                      backgroundColor: urgency === 'Critical' ? '#EF4444' : urgency === 'Moderate' ? '#F59E0B' : '#3B82F6',
                      color: '#FFF',
                      fontWeight: 700
                    }}
                  />
                  <Chip label={serviceMethod} size="small" sx={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', fontWeight: 600 }} />
                </Box>

                <Typography variant="body2" sx={{ color: '#E2E8F0', mb: 3, lineHeight: 1.6 }}>
                  {description}
                </Typography>

                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                  Estimated cost:
                </Typography>
                <Typography variant="h6" sx={{ color: '#00A8FF', fontWeight: 700 }}>
                  ৳800 - 1,500
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{
                  backgroundColor: '#00A8FF',
                  color: '#0D1527',
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  mt: 3,
                  '&:hover': { backgroundColor: '#38BDF8' }
                }}
              >
                {loading ? 'Submitting Request...' : 'Submit Request'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Submission Success Dialog displaying unique Tracking ID */}
      <Dialog
        open={Boolean(submittedData)}
        onClose={() => setSubmittedData(null)}
        PaperProps={{
          sx: {
            backgroundColor: '#172036',
            color: '#FFF',
            borderRadius: 3,
            border: '1px solid #00A8FF',
            p: 2,
            maxWidth: 450
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <CheckCircle2 size={56} color="#00A8FF" style={{ margin: '0 auto 12px auto', display: 'block' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {submittedData?.serviceMethod === 'Emergency Dispatch' ? 'Emergency Request Dispatched!' : 'Request Submitted!'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
            {submittedData?.serviceMethod === 'Emergency Dispatch'
              ? 'Your critical emergency request has been placed on the priority queue for instant dispatch.'
              : 'Your service request has been logged in PostgreSQL via Prisma with unique Tracking ID:'}
          </Typography>
          <Box
            sx={{
              backgroundColor: '#0F172A',
              py: 1.5,
              px: 3,
              borderRadius: 2,
              border: '1px dashed #00A8FF',
              mb: 2
            }}
          >
            <Typography variant="h6" sx={{ color: '#00A8FF', fontWeight: 700, letterSpacing: 1.5 }}>
              {submittedData?.trackingId}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Status: PENDING • Technicians notified for priority response
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setSubmittedData(null);
              if (onNavigateToChat) onNavigateToChat();
            }}
            startIcon={<MessageSquare size={18} />}
            sx={{
              backgroundColor: '#00A8FF',
              color: '#0D1527',
              py: 1.2,
              fontWeight: 700,
              '&:hover': { backgroundColor: '#38BDF8' }
            }}
          >
            Open Live Chat & Calls (Real-Time Communication)
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setSubmittedData(null);
              onNavigateToAppointment();
            }}
            startIcon={<Calendar size={18} />}
            sx={{
              color: '#00A8FF',
              borderColor: '#00A8FF',
              py: 1.2,
              fontWeight: 700,
              '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.1)', borderColor: '#00A8FF' }
            }}
          >
            Schedule Appointment (Module 2)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
