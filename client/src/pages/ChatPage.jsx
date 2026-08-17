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
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatBox from '../components/ChatBox';
import JitsiCallModal from '../components/JitsiCallModal';
import { getSocket } from '../socket/socket';
import axios from 'axios';

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

  const activeUser = currentUser || { id: 'usr-1', name: 'Claire', role: 'CUSTOMER' };
  const isTechnician = activeUser.role === 'TECHNICIAN';

  const fetchConversations = (preferredConvId = null) => {
    axios
      .get('http://localhost:1257/api/conversations', {
        headers: {
          'user-id': activeUser.id,
          'user-role': activeUser.role,
          'user-name': activeUser.name || 'User',
        },
      })
      .then((res) => {
        const list = res.data || [];
        setConversations(list);
        setSelectedConv((prevSelected) => {
          const activeId = preferredConvId || initialConvId || prevSelected?.id;
          if (activeId) {
            const match = list.find((c) => c.id === activeId);
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
    // Move selected conversation to position #1 at top of active list
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
    const partnerName = isTechnician ? (c.customer?.name || 'Customer') : (c.technician?.name || 'Technician');
    const reqTitle = c.serviceRequest?.title || '';
    const q = search.toLowerCase();
    return partnerName.toLowerCase().includes(q) || reqTitle.toLowerCase().includes(q);
  });

  const handleStartCall = (type) => {
    if (!selectedConv) return;
    axios
      .post(`http://localhost:1257/api/conversations/${selectedConv.id}/calls`, { callType: type })
      .then((res) => {
        setCallModal({ open: true, roomName: res.data.roomName, callType: type });
      })
      .catch(() => {
        const fallbackRoom = `techaid-${selectedConv.id}-${Date.now()}`;
        setCallModal({ open: true, roomName: fallbackRoom, callType: type });
      });
  };

  // Helper to simulate partner message live for demonstration
  const handleSimulatePartnerReply = () => {
    if (!selectedConv) return;
    
    const senderId = isTechnician ? (selectedConv.customerId || 'usr-1') : (selectedConv.technicianId || 'usr-2');
    const partnerName = isTechnician ? (selectedConv.customer?.name || 'Customer') : (selectedConv.technician?.name || 'Technician');

    const customerReplies = [
      `Thanks for checking! The power LED lights up, but screen stays black.`,
      `Yes, holding the power button for 10 seconds resolved the display delay!`,
      `Could you let me know when you will be available for home visit?`,
    ];
    const techReplies = [
      `I am reviewing your diagnostics now. Please keep your device connected.`,
      `Got your message! I will send you the resolution steps right away.`,
      `Thank you for providing the details! I am initiating remote support.`,
    ];

    const replies = isTechnician ? customerReplies : techReplies;
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    const socket = getSocket();
    socket.emit('send_message', {
      conversationId: selectedConv.id,
      content: replyText,
      senderId,
      senderName: partnerName,
    });
  };

  const partnerName = selectedConv
    ? isTechnician
      ? selectedConv.customer?.name || 'Customer'
      : selectedConv.technician?.name || 'Technician'
    : 'Conversation Partner';

  const selectedTechProfile = (selectedConv && TECHNICIAN_PROFILES[selectedConv.technicianId]) || TECHNICIAN_PROFILES['usr-4'] || {
    name: selectedConv?.technician?.name || 'TechAlex',
    specialty: selectedConv?.technician?.specialty || 'IT Support Specialist',
    rating: 4.9,
    reviews: 105,
    completedJobs: 82,
    responseTime: '1 min',
    avatar: 'TA',
    skills: ['Wi-Fi Setup', 'Router Config', 'Printer Maintenance', 'Network Security'],
  };

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
                const name = isTechnician ? (c.customer?.name || 'Customer') : (c.technician?.name || 'Technician');
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

        {/* Center Column: Live Chat Box (Figma Page 2) */}
        <Grid item xs={12} md={5.5}>
          {selectedConv ? (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: 600, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {partnerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Request #{selectedConv.serviceRequest?.id || selectedConv.serviceRequestId} · {selectedConv.serviceRequest?.deviceCategory || 'Device'}
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

        {/* Right Column: Dynamic Profile Details Panel (Figma Page 2 Alignment) */}
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
                    {(selectedConv?.customer?.name || 'Customer').slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {selectedConv?.customer?.name || 'Customer'}
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
                      {selectedConv?.serviceRequest?.title || 'Device Technical Issue'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', wordBreak: 'break-word' }}>
                      {selectedConv?.serviceRequest?.description || 'Customer reported device issue requiring assistance.'}
                    </Typography>
                  </Paper>
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                    <Chip label={`Urgency: ${selectedConv?.serviceRequest?.urgency || 'Critical'}`} size="small" color="error" sx={{ maxWidth: '100%' }} />
                    <Chip label={`Category: ${selectedConv?.serviceRequest?.deviceCategory || 'Laptop'}`} size="small" variant="outlined" sx={{ maxWidth: '100%' }} />
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              // Technician Details view for Customer
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                    {selectedTechProfile.avatar}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {selectedTechProfile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ wordBreak: 'break-word' }}>
                      {selectedTechProfile.specialty}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="caption" fontWeight={700}>
                        {selectedTechProfile.rating} ({selectedTechProfile.reviews} reviews)
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>{selectedTechProfile.completedJobs}</strong> Completed Jobs
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTimeIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>{selectedTechProfile.responseTime}</strong> Response Time
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                    SKILLS & EXPERTISE
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.8}>
                    {selectedTechProfile.skills.map((s, i) => (
                      <Chip key={i} label={s} size="small" variant="outlined" sx={{ maxWidth: '100%' }} />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Jitsi Call Modal */}
      <JitsiCallModal
        open={callModal.open}
        onClose={() => setCallModal({ ...callModal, open: false })}
        roomName={callModal.roomName}
        callType={callModal.callType}
      />
    </Box>
  );
}
