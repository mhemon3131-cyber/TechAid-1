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
import axios from 'axios';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [callModal, setCallModal] = useState({ open: false, roomName: '', callType: 'VIDEO' });

  // Currently logged in user (e.g. Mehedi Hasan)
  const currentUserId = 'usr-1';

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:5000/api/conversations', { headers: { 'user-id': currentUserId } })
      .then((res) => {
        setConversations(res.data);
        if (res.data.length > 0) {
          setSelectedConv(res.data[0]);
        }
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to list conversations'))
      .finally(() => setLoading(false));
  }, []);

  const filteredConversations = conversations.filter((c) => {
    const partnerName = c.technician?.name || c.customer?.name || '';
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
        // Fallback for dev testing
        const fallbackRoom = `techaid-${selectedConv.id}-${Date.now()}`;
        setCallModal({ open: true, roomName: fallbackRoom, callType: type });
      });
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          REAL TIME COMMUNICATION
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Communicate with technicians in real-time via text chat, voice call, or video session.
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
              ACTIVE CHATS ({filteredConversations.length})
            </Typography>

            <List sx={{ flex: 1, overflowY: 'auto' }} disablePadding>
              {filteredConversations.map((c) => {
                const partner = c.technician?.name || c.customer?.name || 'Technician';
                const isSelected = selectedConv?.id === c.id;
                const lastMsg = c.messages?.[0]?.content || 'Start conversation...';

                return (
                  <ListItemButton
                    key={c.id}
                    selected={isSelected}
                    onClick={() => setSelectedConv(c)}
                    sx={{ borderRadius: 2, mb: 1, p: 1.5 }}
                  >
                    <ListItemAvatar>
                      <Badge color="success" variant="dot" overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                        <Avatar sx={{ bgcolor: isSelected ? 'primary.main' : 'grey.400', fontWeight: 700 }}>
                          {partner.slice(0, 2).toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {partner}
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
                    {selectedConv.technician?.name || selectedConv.customer?.name || 'Rafiq Ahmed'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Request #{selectedConv.serviceRequest?.id || selectedConv.serviceRequestId} · {selectedConv.serviceRequest?.deviceCategory || 'Laptop'}
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

              <Box sx={{ flex: 1 }}>
                <ChatBox conversationId={selectedConv.id} currentUserId={currentUserId} />
              </Box>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center', height: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography color="text.secondary">Select a conversation to start chatting.</Typography>
            </Paper>
          )}
        </Grid>

        {/* Right Column: Technician Details Sidebar (Figma Page 2 Alignment) */}
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: 600 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Technician Details
            </Typography>

            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22, fontWeight: 700 }}>
                  RA
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Rafiq Ahmed
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Laptop & Desktop Specialist
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                    <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="caption" fontWeight={700}>
                      4.9 (124 reviews)
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>93</strong> Completed Jobs
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTimeIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>2 min</strong> Response Time
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                  SKILLS & EXPERTISE
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.8}>
                  <Chip label="Motherboard Repair" size="small" variant="outlined" />
                  <Chip label="OS Installation" size="small" variant="outlined" />
                  <Chip label="Hardware Upgrade" size="small" variant="outlined" />
                  <Chip label="Virus Removal" size="small" variant="outlined" />
                </Stack>
              </Box>
            </Stack>
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
