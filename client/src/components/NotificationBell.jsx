import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { getSocket } from '../socket/socket';
import axios from 'axios';

export default function NotificationBell({ currentUser }) {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Service Request Accepted',
      message: 'Technician Rafiq Ahmed accepted request #REQ-2026-8942.',
      type: 'REQUEST_ACCEPTED',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-2',
      title: 'Upcoming Appointment Reminder',
      message: 'Reminder: Home Visit appointment scheduled for Mon Jul 13 at 10:00 AM.',
      type: 'APPOINTMENT_REMINDER',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [toast, setToast] = useState({ open: false, title: '', message: '' });

  const userId = currentUser?.id || 'usr-1';

  const fetchNotifications = () => {
    axios
      .get('http://localhost:5000/api/notifications', { headers: { 'user-id': userId } })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setNotifications(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    const handleNewNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setToast({ open: true, title: notif.title, message: notif.message });
    };

    socket.on('new_notification', handleNewNotif);

    return () => {
      socket.off('new_notification', handleNewNotif);
    };
  }, [userId]);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: '#94A3B8',
          '&:hover': { color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.05)' }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Bell size={20} />
        </Badge>
      </IconButton>

      {/* Floating Real-time Toast Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity="info"
          icon={<Bell size={18} color="#00A8FF" />}
          sx={{ bgcolor: '#0F172A', color: '#FFF', border: '1px solid #00A8FF', borderRadius: 2 }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {toast.title}
          </Typography>
          <Typography variant="caption" color="#94A3B8">
            {toast.message}
          </Typography>
        </Alert>
      </Snackbar>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 3,
            bgcolor: '#1E293B',
            color: '#FFFFFF',
            border: '1px solid #334155',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            p: 0
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Bell size={18} color="#00A8FF" />
            <Typography variant="subtitle1" fontWeight={700}>
              Notifications & Reminders
            </Typography>
          </Stack>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<CheckCheck size={14} />}
              onClick={markAllRead}
              sx={{ color: '#00A8FF', fontSize: '0.75rem', textTransform: 'none' }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider sx={{ borderColor: '#334155' }} />

        <List sx={{ p: 0, maxHeight: 380, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="#94A3B8">
                No notifications right now.
              </Typography>
            </Box>
          ) : (
            notifications.map((n) => (
              <ListItem
                key={n.id}
                sx={{
                  borderBottom: '1px solid #334155',
                  bgcolor: n.isRead ? 'transparent' : 'rgba(0, 168, 255, 0.08)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {n.type === 'APPOINTMENT_REMINDER' ? (
                    <Calendar size={18} color="#F59E0B" />
                  ) : n.type === 'EMERGENCY_ALERT' ? (
                    <AlertCircle size={18} color="#EF4444" />
                  ) : n.type === 'NEW_CHAT_MESSAGE' ? (
                    <MessageSquare size={18} color="#00A8FF" />
                  ) : (
                    <CheckCircle size={18} color="#10B981" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#F8FAFC', fontSize: '0.85rem' }}>
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.3 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', lineHeight: 1.3 }}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Popover>
    </>
  );
}
