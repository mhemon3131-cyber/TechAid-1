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
  Info
} from 'lucide-react';

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
      {/* Brand Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
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
            borderRadius: 1.5,
            '&:hover': {
              backgroundColor: currentUser?.role === 'CUSTOMER' ? 'rgba(0, 168, 255, 0.25)' : 'rgba(16, 185, 129, 0.25)'
            }
          }}
        >
          {currentUser?.role === 'CUSTOMER' ? 'Customer Account' : `${currentUser?.specialty || 'Technician'}`}
        </Button>
      </Box>

      {/* Profile Details Dialog Modal */}
      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#172036',
            color: '#FFF',
            borderRadius: 3,
            border: '1px solid #00A8FF',
            p: 1.5,
            minWidth: 360
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ backgroundColor: '#00A8FF', color: '#0D1527', fontWeight: 700 }}>
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFF' }}>
              {currentUser?.name || 'User Profile'}
            </Typography>
            <Chip
              label={currentUser?.role === 'CUSTOMER' ? 'Customer Account' : 'Technician Account'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                backgroundColor: 'rgba(0, 168, 255, 0.2)',
                color: '#00A8FF',
                fontWeight: 700
              }}
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, backgroundColor: '#0F172A', borderRadius: 2 }}>
              <User size={18} color="#00A8FF" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Full Name</Typography>
                <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{currentUser?.name}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, backgroundColor: '#0F172A', borderRadius: 2 }}>
              <Mail size={18} color="#00A8FF" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Email Address</Typography>
                <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{currentUser?.email}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, backgroundColor: '#0F172A', borderRadius: 2 }}>
              <Phone size={18} color="#00A8FF" />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Phone Number</Typography>
                <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{currentUser?.phone || 'Not provided'}</Typography>
              </Box>
            </Box>

            {currentUser?.role === 'TECHNICIAN' && currentUser?.specialty && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, backgroundColor: '#0F172A', borderRadius: 2 }}>
                <Shield size={18} color="#10B981" />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Specialty</Typography>
                  <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>{currentUser.specialty}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setProfileOpen(false)}
            sx={{
              backgroundColor: '#00A8FF',
              color: '#0D1527',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#38BDF8' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5, mb: 2 }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, px: 1, mb: 1, display: 'block' }}>
          {isCustomer ? 'CUSTOMER PORTAL' : 'TECHNICIAN PORTAL'}
        </Typography>

        <List disablePadding>
          {isCustomer ? (
            <>
              {/* New Request */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'new-request'}
                  onClick={() => setActiveTab('new-request')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'new-request' ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: activeTab === 'new-request' ? '#172036' : 'transparent',
                    borderLeft: activeTab === 'new-request' ? '4px solid #00A8FF' : '4px solid transparent',
                    '&:hover': { backgroundColor: '#172036' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'new-request' ? '#00A8FF' : '#94A3B8' }}>
                    <PlusCircle size={18} />
                  </ListItemIcon>
                  <ListItemText primary="New Request" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              {/* Appointments */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'appointments'}
                  onClick={() => setActiveTab('appointments')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'appointments' ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: activeTab === 'appointments' ? '#172036' : 'transparent',
                    borderLeft: activeTab === 'appointments' ? '4px solid #00A8FF' : '4px solid transparent',
                    '&:hover': { backgroundColor: '#172036' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'appointments' ? '#00A8FF' : '#94A3B8' }}>
                    <Calendar size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Book Appointment" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              {/* Track Progress */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'progress-tracker'}
                  onClick={() => setActiveTab('progress-tracker')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'progress-tracker' ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: activeTab === 'progress-tracker' ? '#172036' : 'transparent',
                    borderLeft: activeTab === 'progress-tracker' ? '4px solid #00A8FF' : '4px solid transparent',
                    '&:hover': { backgroundColor: '#172036' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'progress-tracker' ? '#00A8FF' : '#94A3B8' }}>
                    <Activity size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Track Progress" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              {/* Technician Job Requests */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'tech-dashboard'}
                  onClick={() => setActiveTab('tech-dashboard')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'tech-dashboard' ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: activeTab === 'tech-dashboard' ? '#172036' : 'transparent',
                    borderLeft: activeTab === 'tech-dashboard' ? '4px solid #00A8FF' : '4px solid transparent',
                    '&:hover': { backgroundColor: '#172036' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'tech-dashboard' ? '#00A8FF' : '#94A3B8' }}>
                    <ClipboardList size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Job Requests" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              {/* Technician Availability Config */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'tech-availability'}
                  onClick={() => setActiveTab('tech-availability')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'tech-availability' ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: activeTab === 'tech-availability' ? '#172036' : 'transparent',
                    borderLeft: activeTab === 'tech-availability' ? '4px solid #00A8FF' : '4px solid transparent',
                    '&:hover': { backgroundColor: '#172036' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'tech-availability' ? '#00A8FF' : '#94A3B8' }}>
                    <Sliders size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Availability Config" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>

              {/* Progress Status Tracker */}
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === 'progress-tracker'}
                  onClick={() => setActiveTab('progress-tracker')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'progress-tracker' ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: activeTab === 'progress-tracker' ? '#172036' : 'transparent',
                    borderLeft: activeTab === 'progress-tracker' ? '4px solid #00A8FF' : '4px solid transparent',
                    '&:hover': { backgroundColor: '#172036' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'progress-tracker' ? '#00A8FF' : '#94A3B8' }}>
                    <Activity size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Status Tracker" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Box>

      {/* Logout Button */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Button
          fullWidth
          onClick={onLogout}
          startIcon={<LogOut size={18} />}
          sx={{
            color: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            py: 1,
            fontWeight: 700,
            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );
};
