import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Badge,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Divider,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatBox from '../components/ChatBox';
import JitsiCallModal from '../components/JitsiCallModal';
import { getSocket } from '../socket/socket';
import axios from 'axios';

export function cleanName(nameVal, fallback = 'User') {
  if (!nameVal || typeof nameVal !== 'string') return fallback;
  const trimmed = nameVal.trim();
  if (trimmed.length > 20 && trimmed.includes('-') && /^[0-9a-fA-F-]+$/.test(trimmed)) {
    return fallback;
  }
  if (trimmed === 'Customer' || trimmed === 'Technician') {
    return fallback;
  }
  return trimmed;
}

const TECHNICIAN_PROFILES = {
  'usr-4': {
    name: 'TechAlex',
    specialty: 'Network & Printer Specialist',
    rating: 4.8,
    reviews: 105,
    completedJobs: 82,
    responseTime: '1 min',
    avatar: 'TA',
    skills: ['Wi-Fi Setup', 'Router Config', 'Printer Maintenance', 'Network Security'],
  },
};

export default function ChatPage({ currentUser, initialConvId }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [callModal, setCallModal] = useState({ open: false, roomName: '', callType: 'VIDEO' });

  const activeUser = currentUser || { id: 'usr-1', name: 'cust01', role: 'CUSTOMER' };
  const isTechnician = activeUser.role === 'TECHNICIAN';

  const fetchConversations = (preferredConvId = null) => {
    axios
      .get('http://localhost:5000/api/conversations', {
        headers: {
          'user-id': activeUser.id,
          'user-role': activeUser.role,
          'user-name': activeUser.name || 'User',
        },
      })
      .then((res) => {
        let list = res.data || [];
        const activeId = preferredConvId || initialConvId;

        // Fallback creation if requested activeId is not yet in conversation list
        if (activeId && !list.some((c) => c.id === activeId)) {
          const parts = activeId.split('_');
          const rawTarget = isTechnician ? (parts[1] || 'cust01') : (parts[2] || 'tech01');
          const targetName = cleanName(rawTarget, isTechnician ? 'cust01' : 'tech01');

          const fallbackConv = {
            id: activeId,
            customerId: isTechnician ? (parts[1] || 'usr-1') : activeUser.id,
            technicianId: isTechnician ? activeUser.id : (parts[2] || 'usr-4'),
            customer: { id: parts[1] || 'usr-1', name: isTechnician ? targetName : cleanName(activeUser.name, 'cust01'), email: 'customer@techaid.com' },
            technician: { id: parts[2] || 'usr-4', name: isTechnician ? cleanName(activeUser.name, 'tech01') : targetName, email: 'tech@techaid.com' },
            serviceRequest: { title: 'Technical Troubleshooting & Repair', deviceCategory: 'Laptop' },
            messages: []
          };
          list = [fallbackConv, ...list];
        }

        setConversations(list);
        setSelectedConv((prevSelected) => {
          const targetId = activeId || prevSelected?.id;
          if (targetId) {
            const match = list.find((c) => c.id === targetId);
            return match || list[0] || null;
          }
          return list[0] || null;
        });
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to list conversations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConversations();

    const socket = getSocket();
    const handleNewMsgEvent = () => {
      fetchConversations();
    };

    socket.on('new_conversation_message', handleNewMsgEvent);
    socket.on('receive_message', handleNewMsgEvent);

    return () => {
      socket.off('new_conversation_message', handleNewMsgEvent);
      socket.off('receive_message', handleNewMsgEvent);
    };
  }, [activeUser.id, activeUser.role]);

  const handleSelectConv = (c) => {
    setSelectedConv(c);
    setConversations((prev) => {
      const filtered = prev.filter((item) => item.id !== c.id);
      return [c, ...filtered];
    });
  };

  const handleMoveToTop = (convId) => {
    setConversations((prev) => {
      const match = prev.find((item) => item.id === convId);
      if (!match) return prev;
      const filtered = prev.filter((item) => item.id !== convId);
      return [match, ...filtered];
    });
  };

  const filteredConversations = conversations.filter((c) => {
    const rawPartnerName = isTechnician ? (c.customer?.name || 'cust01') : (c.technician?.name || 'tech01');
    const partnerName = cleanName(rawPartnerName, isTechnician ? 'cust01' : 'tech01');
    const reqTitle = c.serviceRequest?.title || '';
    const q = search.toLowerCase();
    return partnerName.toLowerCase().includes(q) || reqTitle.toLowerCase().includes(q);
  });

  const handleStartCall = (type) => {
    if (!selectedConv) return;
    axios
      .post(`http://localhost:5000/api/conversations/${selectedConv.id}/calls`, { callType: type })
      .then((res) => {
        setCallModal({ open: true, roomName: res.data.roomName, callType: type });
      })
      .catch(() => {
        const fallbackRoom = `techaid-${selectedConv.id}-${Date.now()}`;
        setCallModal({ open: true, roomName: fallbackRoom, callType: type });
      });
  };

  const rawPartnerName = selectedConv
    ? isTechnician
      ? selectedConv.customer?.name || 'cust01'
      : selectedConv.technician?.name || 'tech01'
    : 'Conversation Partner';

  const partnerName = cleanName(rawPartnerName, isTechnician ? 'cust01' : 'tech01');

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          REAL TIME COMMUNICATION
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isTechnician
            ? 'Technician Console — Communicate with assigned customers in real-time.'
            : 'Customer Portal — Communicate with assigned technicians in real-time.'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Left Column: Conversations List */}
        <Grid item xs={12} md={3.5}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: 600, display: 'flex', flexDirection: 'column' }}>
            <TextField
              size="small"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, px: 1 }}>
              {isTechnician ? 'CUSTOMER CHATS' : 'TECHNICIAN CHATS'} ({filteredConversations.length})
            </Typography>

            <List sx={{ flex: 1, overflowY: 'auto' }} disablePadding>
              {filteredConversations.map((c) => {
                const rawName = isTechnician ? (c.customer?.name || 'cust01') : (c.technician?.name || 'tech01');
                const name = cleanName(rawName, isTechnician ? 'cust01' : 'tech01');
                const isSelected = selectedConv?.id === c.id;
                const lastMsg = c.messages?.[c.messages.length - 1]?.content || 'Start conversation...';
                const avatarText = name.slice(0, 2).toUpperCase();

                return (
                  <ListItemButton
                    key={c.id}
                    selected={isSelected}
                    onClick={() => handleSelectConv(c)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      p: 1.5,
                      borderLeft: isSelected ? '4px solid #00A8FF' : '4px solid transparent',
                      bgcolor: isSelected ? 'rgba(0, 168, 255, 0.15) !important' : 'transparent',
                    }}
                  >
                    <ListItemAvatar>
                      <Badge color="success" variant="dot" overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                        <Avatar sx={{ bgcolor: isSelected ? 'primary.main' : 'grey.600', fontWeight: 700 }}>
                          {avatarText}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: isSelected ? '#00A8FF' : 'text.primary' }} noWrap>
                          {name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {c.serviceRequest?.title || lastMsg}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Center Column: Live Chat Box */}
        <Grid item xs={12} md={5.5}>
          {selectedConv ? (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: 600, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {partnerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Request #{selectedConv.serviceRequest?.id || selectedConv.serviceRequestId || '101'} · {selectedConv.serviceRequest?.deviceCategory || 'Device'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" startIcon={<CallIcon />} onClick={() => handleStartCall('VOICE')}>
                    Voice Call
                  </Button>
                  <Button variant="contained" size="small" startIcon={<VideocamIcon />} onClick={() => handleStartCall('VIDEO')}>
                    Video Call
                  </Button>
                </Stack>
              </Stack>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ChatBox
                  conversationId={selectedConv.id}
                  currentUser={activeUser}
                  partnerName={partnerName}
                  onMessageSent={(convId) => handleMoveToTop(convId)}
                />
              </Box>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center', height: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography color="text.secondary">Select a conversation to start chatting.</Typography>
            </Paper>
          )}
        </Grid>

        {/* Right Column: Profile Details Panel */}
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: 600, overflowY: 'auto', overflowX: 'hidden' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              {isTechnician ? 'Customer Details' : 'Technician Details'}
            </Typography>

            {isTechnician ? (
              // Customer Details view for Technician
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                    {cleanName(selectedConv?.customer?.name, 'cust01').slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {cleanName(selectedConv?.customer?.name, 'cust01')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ wordBreak: 'break-all' }}>
                      {selectedConv?.customer?.email || 'customer@techaid.com'}
                    </Typography>
                    <Chip label="Verified Customer" size="small" color="success" variant="outlined" sx={{ mt: 0.5, fontWeight: 700 }} />
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    SERVICE REQUEST ISSUE
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0D1527' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ wordBreak: 'break-word' }}>
                      {selectedConv?.serviceRequest?.title || 'Technical Troubleshooting & Repair'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {selectedConv?.serviceRequest?.description || 'Customer reported device issue requiring assistance.'}
                    </Typography>
                  </Paper>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`Urgency: ${selectedConv?.serviceRequest?.urgency || 'Critical'}`} size="small" color="error" />
                    <Chip label={`Category: ${selectedConv?.serviceRequest?.deviceCategory || 'Laptop'}`} size="small" variant="outlined" />
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              // Technician Details view for Customer
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                    {cleanName(selectedConv?.technician?.name, 'tech01').slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {cleanName(selectedConv?.technician?.name, 'tech01')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                      {selectedConv?.technician?.specialty || 'IT Support Specialist'}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                      <StarIcon color="warning" sx={{ fontSize: 16 }} />
                      <Typography variant="caption" fontWeight={700}>
                        4.9 (105 reviews)
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      <strong>82</strong> Completed Jobs
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon color="action" sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      <strong>1 min</strong> Response Time
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 1 }}>
                    SKILLS & EXPERTISE
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {['Hardware Repair', 'Router Config', 'Software Recovery', 'Network Security'].map((skill) => (
                      <Chip key={skill} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Jitsi Video/Voice Call Modal */}
      <JitsiCallModal
        open={callModal.open}
        roomName={callModal.roomName}
        callType={callModal.callType}
        currentUser={activeUser}
        partnerName={partnerName}
        onClose={() => setCallModal({ ...callModal, open: false })}
      />
    </Box>
  );
}
