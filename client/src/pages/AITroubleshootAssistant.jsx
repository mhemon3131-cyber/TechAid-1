import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Avatar,
  IconButton
} from '@mui/material';
import { Bot, User, Send, Laptop, Monitor, Smartphone, Printer, Wifi, PhoneCall, CheckCircle2 } from 'lucide-react';
import { sendTroubleshootMessage } from '../services/api';

const categories = [
  { label: 'Laptop', icon: <Laptop size={16} /> },
  { label: 'Desktop', icon: <Monitor size={16} /> },
  { label: 'Phone', icon: <Smartphone size={16} /> },
  { label: 'Printer', icon: <Printer size={16} /> },
  { label: 'Internet', icon: <Wifi size={16} /> }
];

export const AITroubleshootAssistant = ({ currentUser, onNavigateToAppointment }) => {
  const [deviceCategory, setDeviceCategory] = useState('Laptop');
  const [description, setDescription] = useState('');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startSession = () => {
    if (!description || description.trim().length < 5) return;
    const firstMsg = { role: 'user', content: description };
    setMessages([firstMsg]);
    setStarted(true);
    setResolved(false);
    fetchAssistantReply([firstMsg]);
  };

  const fetchAssistantReply = async (history) => {
    setLoading(true);
    try {
      const response = await sendTroubleshootMessage({ deviceCategory, description, messages: history });
      if (response.success) {
        const { reply, resolved: isResolved } = response.data;
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        if (isResolved) setResolved(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble reaching the AI service right now. Please try again, or connect with a technician directly." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const newHistory = [...messages, { role: 'user', content: input }];
    setMessages(newHistory);
    setInput('');
    fetchAssistantReply(newHistory);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#0D1527', minHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: '#00A8FF', fontWeight: 700, letterSpacing: 1 }}>
          MEMBER 1 • MODULE 2 (FEATURE 2.1)
        </Typography>
        <Typography variant="h5" sx={{ color: '#FFF', fontWeight: 700, mt: 0.5 }}>
          Interactive AI Troubleshooting Assistant
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Try resolving your issue with step-by-step AI guidance before booking a technician.
        </Typography>
      </Box>

      {!started ? (
        <Paper elevation={0} sx={{ backgroundColor: '#172036', borderRadius: 3, p: 4, border: '1px solid #2A364F', maxWidth: 800 }}>
          <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
            Device Category
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
                    fontWeight: 600
                  }}
                />
              );
            })}
          </Box>

          <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1.5 }}>
            What's going wrong?
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="e.g. My WiFi keeps disconnecting every few minutes..."
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
            onClick={startSession}
            startIcon={<Bot size={18} />}
            sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700, py: 1.2, px: 3, '&:hover': { backgroundColor: '#0090DD' } }}
          >
            Start AI Troubleshooting
          </Button>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#172036',
            borderRadius: 3,
            border: '1px solid #2A364F',
            maxWidth: 800,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minHeight: 480
          }}
        >
          <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((m, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', maxWidth: '80%' }}>
                <Avatar sx={{ width: 30, height: 30, backgroundColor: m.role === 'user' ? '#00A8FF' : '#10B981' }}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </Avatar>
                <Box
                  sx={{
                    backgroundColor: m.role === 'user' ? 'rgba(0, 168, 255, 0.15)' : '#0D1527',
                    border: '1px solid #2A364F',
                    borderRadius: 2,
                    p: 1.5,
                    color: '#E2E8F0'
                  }}
                >
                  <Typography variant="body2">{m.content}</Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ width: 30, height: 30, backgroundColor: '#10B981' }}>
                  <Bot size={16} />
                </Avatar>
                <CircularProgress size={16} sx={{ color: '#00A8FF' }} />
              </Box>
            )}
            <div ref={endRef} />
          </Box>

          {resolved && (
            <Box sx={{ px: 3, pb: 1 }}>
              <Chip
                icon={<CheckCircle2 size={16} />}
                label="Looks resolved! You can still connect with a technician if it happens again."
                sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 600, width: '100%', py: 2 }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, p: 2, borderTop: '1px solid #2A364F' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type your response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0D1527',
                  color: '#FFF',
                  '& fieldset': { borderColor: '#2A364F' }
                }
              }}
            />
            <IconButton onClick={handleSend} disabled={loading || !input.trim()} sx={{ backgroundColor: '#00A8FF', color: '#0D1527', '&:hover': { backgroundColor: '#0090DD' } }}>
              <Send size={18} />
            </IconButton>
            {onNavigateToAppointment && (
              <Button
                onClick={onNavigateToAppointment}
                startIcon={<PhoneCall size={16} />}
                sx={{ color: '#94A3B8', border: '1px solid #2A364F', fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                Talk to Technician
              </Button>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};
