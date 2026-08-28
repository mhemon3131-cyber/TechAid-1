import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar
} from '@mui/material';
import {
  PlusCircle,
  Calendar,
  ClipboardList,
  Shield,
  UserCheck,
  Activity,
  Sliders,
  LogOut,
  User,
  Mail,
  Phone,
  Info,
  MessageSquare
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export const Sidebar = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const isCustomer = currentUser?.role === 'CUSTOMER';
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Box
      sx={{
        width: 250,
        backgroundColor: '#0D1527',
        borderRight: '1px solid #1E293B',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        boxSizing: 'border-box'
      }}
    >
      {/* Brand Header & Notification Bell matching user screenshot */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: '#00A8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0D1527',
              boxShadow: '0 0 15px rgba(0, 168, 255, 0.4)'
            }}
          >
            <Shield size={24} strokeWidth={2.5} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.25rem' }}>
              Tech<span style={{ color: '#00A8FF' }}>Aid</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>
              IT Support Platform
            </Typography>
          </Box>
        </Box>

        {/* Real-Time Notification Bell Component (Customer & Technician) */}
        <NotificationBell currentUser={currentUser} />
      </Box>

      {/* Current Active Account Card with Clickable Profile Details */}
      <Box
        sx={{
          backgroundColor: '#172036',
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          mb: 3,
          border: '1px solid #2A364F'
        }}
      >
        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
          LOGGED IN AS
        </Typography>
        <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 700, mt: 0.2 }}>
          {currentUser?.name || 'User'}
        </Typography>
        
        {/* Email & Phone Details preview */}
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {currentUser?.email || ''}
        </Typography>
        {currentUser?.phone && (
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
            {currentUser?.phone}
          </Typography>
        )}

        <Button
          size="small"
          onClick={() => setProfileOpen(true)}
          startIcon={<Info size={12} />}
          sx={{
            mt: 1,
            backgroundColor: currentUser?.role === 'CUSTOMER' ? 'rgba(0, 168, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: currentUser?.role === 'CUSTOMER' ? '#00A8FF' : '#10B981',
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'none',
            justifyContent: 'flex-start',
            py: 0.4,
            px: 1,
            borderRadius: '6px'
          }}
        >
          {currentUser?.role === 'CUSTOMER' ? 'Customer Account' : (currentUser?.specialty || 'Technician Account')}
        </Button>
      </Box>

      {/* Navigation Links based on Role */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, px: 1, mb: 1, display: 'block', letterSpacing: 0.5 }}>
          {isCustomer ? 'CUSTOMER DASHBOARD' : 'TECHNICIAN PORTAL'}
        </Typography>

        <List disablePadding>
          {isCustomer ? (
            /* CUSTOMER NAVIGATION LINKS */
            <>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'new-request'}
                  onClick={() => setActiveTab('new-request')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'new-request' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'new-request' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'new-request' ? '#00A8FF' : '#94A3B8' }}>
                    <PlusCircle size={20} />
                  </ListItemIcon>
                  <ListItemText primary="New Request" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'appointments'}
                  onClick={() => setActiveTab('appointments')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'appointments' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'appointments' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'appointments' ? '#00A8FF' : '#94A3B8' }}>
                    <Calendar size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Book Appointment" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'chat' || activeTab === 'chat-support'}
                  onClick={() => setActiveTab('chat')}
                  sx={{
                    borderRadius: 2,
                    color: (activeTab === 'chat' || activeTab === 'chat-support') ? '#00A8FF' : '#94A3B8',
                    backgroundColor: (activeTab === 'chat' || activeTab === 'chat-support') ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: (activeTab === 'chat' || activeTab === 'chat-support') ? '#00A8FF' : '#94A3B8' }}>
                    <MessageSquare size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Live Chat & Calls" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'progress-tracker'}
                  onClick={() => setActiveTab('progress-tracker')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'progress-tracker' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'progress-tracker' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'progress-tracker' ? '#00A8FF' : '#94A3B8' }}>
                    <Activity size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Track Progress" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            /* TECHNICIAN NAVIGATION LINKS */
            <>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'tech-dashboard'}
                  onClick={() => setActiveTab('tech-dashboard')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'tech-dashboard' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'tech-dashboard' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'tech-dashboard' ? '#00A8FF' : '#94A3B8' }}>
                    <ClipboardList size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Job Requests" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'emergency-queue'}
                  onClick={() => setActiveTab('emergency-queue')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'emergency-queue' ? '#EF4444' : '#94A3B8',
                    backgroundColor: activeTab === 'emergency-queue' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'emergency-queue' ? '#EF4444' : '#94A3B8' }}>
                    <Shield size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Emergency Queue" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 700 }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'chat' || activeTab === 'chat-support'}
                  onClick={() => setActiveTab('chat')}
                  sx={{
                    borderRadius: 2,
                    color: (activeTab === 'chat' || activeTab === 'chat-support') ? '#00A8FF' : '#94A3B8',
                    backgroundColor: (activeTab === 'chat' || activeTab === 'chat-support') ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: (activeTab === 'chat' || activeTab === 'chat-support') ? '#00A8FF' : '#94A3B8' }}>
                    <MessageSquare size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Live Chat & Calls" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'tech-availability'}
                  onClick={() => setActiveTab('tech-availability')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'tech-availability' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'tech-availability' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'tech-availability' ? '#00A8FF' : '#94A3B8' }}>
                    <Sliders size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Availability Config" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Box>

      {/* Sign Out Button */}
      <Box sx={{ pt: 2, borderTop: '1px solid #1E293B' }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={onLogout}
          startIcon={<LogOut size={18} />}
          sx={{
            justifyContent: 'flex-start',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#EF4444'
            }
          }}
        >
          Sign Out
        </Button>
      </Box>

      {/* User Profile Info Modal */}
      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#172036',
            color: '#FFF',
            borderRadius: 3,
            border: '1px solid #2A364F',
            p: 1,
            minWidth: 340
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1, backgroundColor: '#00A8FF', fontSize: 22, fontWeight: 700 }}>
            {(currentUser?.name || 'US').slice(0, 2).toUpperCase()}
          </Avatar>
          <Typography variant="h6" fontWeight={700}>
            {currentUser?.name}
          </Typography>
          <Chip
            label={currentUser?.role}
            size="small"
            color={currentUser?.role === 'CUSTOMER' ? 'primary' : 'success'}
            sx={{ mt: 0.5, fontWeight: 700 }}
          />
        </DialogTitle>
        <DialogContent>
          <Divider sx={{ borderColor: '#2A364F', mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Mail size={16} color="#00A8FF" />
              <Typography variant="body2">{currentUser?.email || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Phone size={16} color="#00A8FF" />
              <Typography variant="body2">{currentUser?.phone || '+880 1700-000000'}</Typography>
            </Box>
            {currentUser?.specialty && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <UserCheck size={16} color="#10B981" />
                <Typography variant="body2" color="#10B981" fontWeight={600}>
                  {currentUser?.specialty}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="outlined" onClick={() => setProfileOpen(false)} sx={{ color: '#94A3B8', borderColor: '#2A364F' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
