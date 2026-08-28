import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { ChevronDown, History, CheckCircle2, Clock, FileText } from 'lucide-react';
import { getResolutionHistory } from '../services/api';

const statusColor = {
  PENDING: '#F59E0B',
  ASSIGNED: '#3B82F6',
  ACCEPTED: '#3B82F6',
  IN_PROGRESS: '#00A8FF',
  ON_THE_WAY: '#00A8FF',
  COMPLETED: '#10B981'
};

export const IssueResolutionHistory = ({ currentUser }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const customerId = currentUser?.id || 'usr-1';
      const response = await getResolutionHistory(customerId);
      if (response.success) {
        setHistory(response.data);
      }
    } catch (err) {
      setError('Could not load your resolution history right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: '#00A8FF', fontWeight: 700, letterSpacing: 1 }}>
          MEMBER 1 • MODULE 3 (FEATURE 3.1)
        </Typography>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700, mt: 0.5 }}>
          Issue Resolution History
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Revisit past service requests, AI recommendations, and how each issue was resolved.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress sx={{ color: '#00A8FF' }} />
        </Box>
      ) : history.length === 0 ? (
        <Paper elevation={0} sx={{ backgroundColor: '#172036', borderRadius: 3, p: 5, border: '1px solid #2A364F', textAlign: 'center', maxWidth: 800 }}>
          <History size={32} color="#475569" />
          <Typography variant="body2" sx={{ color: '#64748B', mt: 2 }}>
            No service history yet. Once you submit and resolve requests, they'll appear here.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ maxWidth: 900 }}>
          {history.map((item) => (
            <Accordion
              key={item.id}
              elevation={0}
              sx={{
                backgroundColor: '#172036',
                border: '1px solid #2A364F',
                borderRadius: '12px !important',
                mb: 1.5,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ChevronDown color="#94A3B8" />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ color: '#FFF', fontWeight: 700 }}>
                      {item.title || item.deviceCategory}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {item.trackingId} • {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    icon={item.isResolved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    label={item.status.replace(/_/g, ' ')}
                    size="small"
                    sx={{ backgroundColor: `${statusColor[item.status]}22`, color: statusColor[item.status], fontWeight: 700 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: '1px solid #2A364F' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  ISSUE DESCRIPTION
                </Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 2 }}>
                  {item.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={`Urgency: ${item.urgency}`} size="small" sx={{ backgroundColor: '#0D1527', color: '#94A3B8' }} />
                  <Chip label={`Method: ${item.serviceMethod}`} size="small" sx={{ backgroundColor: '#0D1527', color: '#94A3B8' }} />
                  <Chip label={`Est. Cost: ${item.estimatedCost}`} size="small" sx={{ backgroundColor: '#0D1527', color: '#94A3B8' }} />
                  {item.attachments?.length > 0 && (
                    <Chip icon={<FileText size={14} />} label={`${item.attachments.length} attachment(s)`} size="small" sx={{ backgroundColor: '#0D1527', color: '#94A3B8' }} />
                  )}
                </Box>

                <Divider sx={{ borderColor: '#2A364F', mb: 2 }} />

                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  RESOLUTION TRAIL
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {item.resolutionTrail.map((log) => (
                    <Box key={log.id} sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusColor[log.status] || '#00A8FF', mt: 0.7, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                          {log.status.replace(/_/g, ' ')}
                        </Typography>
                        {log.note && (
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {log.note}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default IssueResolutionHistory;
