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
  MessageSquare,
  Activity
} from 'lucide-react';
import { getSocket } from '../socket/socket';
import axios from 'axios';

export function cleanName(nameVal, fallback = 'User') {
  if (!nameVal || typeof nameVal !== 'string') return fallback;
  const trimmed = nameVal.trim();
  if (trimmed.length > 20 && trimmed.includes('-') && /^[0-9a-fA-F-]+$/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

export default function NotificationBell({ currentUser }) {
  const isTechnician = currentUser?.role === 'TECHNICIAN';
  const userId = currentUser?.id || 'usr-1';
  const activeName = cleanName(currentUser?.name, isTechnician ? 'tech01' : 'cust01');

  const customerDefaultNotifs = [
    {
      id: 'notif-msg-1',
      title: 'New Message from tech01',
      message: '"heyyy"',
      type: 'NEW_CHAT_MESSAGE',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-app-1',
      title: 'Appointment Booked Successfully',
      message: 'Your appointment with tech01 is confirmed for Tue Jul 14, 2026 at 1:00 pm.',
      type: 'APPOINTMENT_BOOKED',
      isRead: false,
      createdAt: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'notif-app-2',
      title: 'Appointment Booked Successfully',
      message: 'Your appointment with tech01 is confirmed for Tue Jul 14, 2026 at 11:30 am.',
      type: 'APPOINTMENT_BOOKED',
      isRead: true,
      createdAt: new Date(Date.now() - 180000).toISOString()
    }
  ];

  const technicianDefaultNotifs = [
    {
      id: 'notif-tech-msg-1',
      title: 'New Message from cust01',
      message: '"Is the technician on the way?"',
      type: 'NEW_CHAT_MESSAGE',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-tech-1',
      title: 'New Appointment Booked',
      message: 'Customer cust01 booked Remote support for Tue Jul 14, 2026 at 1:00 pm.',
      type: 'APPOINTMENT_BOOKED',
      isRead: false,
      createdAt: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'notif-tech-2',
      title: 'Emergency Support Request Alert',
      message: 'New Critical emergency request submitted by customer.',
      type: 'EMERGENCY_ALERT',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const [notifications, setNotifications] = useState(
    isTechnician ? technicianDefaultNotifs : customerDefaultNotifs
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [toast, setToast] = useState({ open: false, title: '', message: '' });

  const fetchNotifications = () => {
    axios
      .get('http://localhost:5000/api/notifications', { headers: { 'user-id': userId } })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setNotifications((prev) => {
            const uniqueMap = {};
            [...res.data, ...prev].forEach((n) => {
              if (!uniqueMap[n.id]) uniqueMap[n.id] = n;
            });
            return Object.values(uniqueMap);
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();

    const handleNewNotif = (notif) => {
      if (!notif) return;
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notif.id || (n.title === notif.title && n.message === notif.message));
        if (exists) return prev;
        return [notif, ...prev];
      });
      setToast({ open: true, title: notif.title || 'Notification', message: notif.message || '' });
    };

    const handleReceiveMessageNotif = (msg) => {
      if (!msg) return;
      const senderIdStr = String(msg.senderId || msg.sender?.id || '');
      const userIdStr = String(userId);

      // Trigger notification if message is sent by the partner
      if (senderIdStr && senderIdStr !== userIdStr) {
        const rawSender = msg.sender?.name || (isTechnician ? 'cust01' : 'tech01');
        const senderName = cleanName(rawSender, isTechnician ? 'cust01' : 'tech01');
        const notifTitle = `New Message from ${senderName}`;
        const notifMsg = `"${msg.content.slice(0, 40)}${msg.content.length > 40 ? '...' : ''}"`;

        const newNotif = {
          id: `notif_msg_${Date.now()}`,
          title: notifTitle,
          message: notifMsg,
          type: 'NEW_CHAT_MESSAGE',
          isRead: false,
          createdAt: new Date().toISOString()
        };

        setNotifications((prev) => {
          const exists = prev.some((n) => n.message === notifMsg && Math.abs(new Date(n.createdAt) - new Date()) < 3000);
          if (exists) return prev;
          return [newNotif, ...prev];
        });
        setToast({ open: true, title: notifTitle, message: notifMsg });
      }
    };

    socket.on('new_notification', handleNewNotif);
    socket.on('receive_message', handleReceiveMessageNotif);

    return () => {
      socket.off('new_notification', handleNewNotif);
      socket.off('receive_message', handleReceiveMessageNotif);
    };
  }, [userId, activeName, isTechnician]);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'NEW_CHAT_MESSAGE':
        return <MessageSquare size={18} color="#00A8FF" />;
      case 'APPOINTMENT_BOOKED':
      case 'APPOINTMENT_REMINDER':
        return <Calendar size={18} color="#00A8FF" />;
      case 'STEP_COMPLETED':
      case 'REQUEST_ACCEPTED':
      case 'COMPLETED':
        return <CheckCircle size={18} color="#10B981" />;
      case 'EMERGENCY_ALERT':
        return <AlertCircle size={18} color="#EF4444" />;
      default:
        return <Activity size={18} color="#00A8FF" />;
    }
  };

  return (
    <>
      {/* Bell Icon with Red Badge Counter */}
      <IconButton
        onClick={handleOpen}
        sx={{
          color: '#94A3B8',
          p: 0.8,
          '&:hover': { color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.08)' }
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.7rem'
            }
          }}
        >
          <Bell size={20} />
        </Badge>
      </IconButton>

      {/* Notifications Popover matching User Screenshot */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 520,
            backgroundColor: '#131C31',
            color: '#FFFFFF',
            border: '1px solid #2A364F',
            borderRadius: 3.5,
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
            mt: 1.5,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, px: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#172036' }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Box
                sx={{
                  backgroundColor: '#EF4444',
                  color: '#FFF',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  px: 1,
                  py: 0.2,
                  borderRadius: '12px'
                }}
              >
                {unreadCount}
              </Box>
            )}
          </Stack>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={markAllRead}
              startIcon={<CheckCheck size={14} />}
              sx={{ color: '#00A8FF', fontSize: '0.78rem', fontWeight: 700, textTransform: 'none' }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider sx={{ borderColor: '#2A364F' }} />

        {/* List of Notifications */}
        <List sx={{ p: 0, overflowY: 'auto', maxHeight: 420 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="#94A3B8">
                No notifications right now.
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    backgroundColor: notif.isRead ? 'transparent' : 'rgba(0, 168, 255, 0.08)',
                    transition: 'background-color 0.2s',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
                    py: 1.8,
                    px: 2.5
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, mt: 0.4 }}>
                    {getNotifIcon(notif.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={notif.isRead ? 600 : 800} color="#F8FAFC" sx={{ fontSize: '0.92rem' }}>
                        {notif.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="caption" color="#94A3B8" display="block" sx={{ mt: 0.5, lineHeight: 1.5, fontSize: '0.82rem' }}>
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="#64748B" sx={{ fontSize: '0.72rem', mt: 0.6, display: 'block', fontWeight: 600 }}>
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider sx={{ borderColor: '#2A364F' }} />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>

      {/* Toast Alert Banner */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity="info"
          icon={<MessageSquare size={20} color="#00A8FF" />}
          sx={{
            width: '100%',
            backgroundColor: '#172036',
            color: '#FFFFFF',
            border: '1px solid #00A8FF',
            borderRadius: 2.5,
            boxShadow: '0 8px 24px rgba(0,168,255,0.3)'
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {toast.title}
          </Typography>
          <Typography variant="caption" color="#94A3B8" display="block">
            {toast.message}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}
