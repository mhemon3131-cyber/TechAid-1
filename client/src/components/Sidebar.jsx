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
  MessageSquare,
  Search,
  Bot,
  Brain,
  CreditCard,
  Star,
  Calculator,
  History
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export const Sidebar = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const isCustomer = currentUser?.role === 'CUSTOMER';
  const isTechnician = currentUser?.role === 'TECHNICIAN';
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Box
      sx={{
        width: 260,
        backgroundColor: '#0D1527',
        borderRight: '1px solid #1E293B',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        boxSizing: 'border-box'
      }}
    >
      {/* Brand Header & Integrated Notification Bell */}
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

        {/* Integrated Notification Bell for both Customer and Technician */}
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
        
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {currentUser?.email || ''}
        </Typography>
        {currentUser?.phone && (
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
            {currentUser.phone}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Chip
            label={isCustomer ? 'Customer Account' : (currentUser?.specialty || 'Smartphone Repair & OS Recovery')}
            size="small"
            sx={{
              backgroundColor: isCustomer ? 'rgba(0, 168, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isCustomer ? '#00A8FF' : '#10B981',
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
          />
          <Button
            size="small"
            onClick={() => setProfileOpen(true)}
            sx={{ color: '#00A8FF', minWidth: 'auto', p: 0.5, fontSize: '0.7rem' }}
          >
            <Info size={14} />
          </Button>
        </Box>
      </Box>

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        {isCustomer ? (
          /* CUSTOMER MENU */
          <>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
              MODULE 1: REQUESTS & DISCOVERY
            </Typography>
            <List disablePadding sx={{ mb: 2 }}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'new-request'}
                  onClick={() => setActiveTab('new-request')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'new-request' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'new-request' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'new-request' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <PlusCircle size={18} />
                  </ListItemIcon>
                  <ListItemText primary="New Request" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'ai-classifier'}
                  onClick={() => setActiveTab('ai-classifier')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'ai-classifier' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'ai-classifier' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'ai-classifier' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Brain size={18} />
                  </ListItemIcon>
                  <ListItemText primary="AI Issue Classifier" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'ai-troubleshoot'}
                  onClick={() => setActiveTab('ai-troubleshoot')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'ai-troubleshoot' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'ai-troubleshoot' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'ai-troubleshoot' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Bot size={18} />
                  </ListItemIcon>
                  <ListItemText primary="AI Troubleshooter" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'tech-search'}
                  onClick={() => setActiveTab('tech-search')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'tech-search' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'tech-search' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'tech-search' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Search size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Search Technicians" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>
            </List>

            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
              MODULE 2 & 3: SCHEDULING & CHAT
            </Typography>
            <List disablePadding sx={{ mb: 2 }}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'appointments'}
                  onClick={() => setActiveTab('appointments')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'appointments' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'appointments' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'appointments' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Calendar size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Book Appointment" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'chat' || activeTab === 'chat-support'}
                  onClick={() => setActiveTab('chat')}
                  sx={{
                    borderRadius: 2,
                    color: (activeTab === 'chat' || activeTab === 'chat-support') ? '#00A8FF' : '#94A3B8',
                    backgroundColor: (activeTab === 'chat' || activeTab === 'chat-support') ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: (activeTab === 'chat' || activeTab === 'chat-support') ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <MessageSquare size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Live Chat & Calls" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'progress-tracker'}
                  onClick={() => setActiveTab('progress-tracker')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'progress-tracker' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'progress-tracker' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'progress-tracker' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Activity size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Track Progress" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>
            </List>

            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
              MODULE 4: PAYMENT & ESTIMATES
            </Typography>
            <List disablePadding>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'payment'}
                  onClick={() => setActiveTab('payment')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'payment' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'payment' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'payment' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <CreditCard size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Payments & Billing" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'cost-estimator'}
                  onClick={() => setActiveTab('cost-estimator')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'cost-estimator' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'cost-estimator' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'cost-estimator' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Calculator size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Cost Estimator" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'rating-review'}
                  onClick={() => setActiveTab('rating-review')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'rating-review' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'rating-review' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'rating-review' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Star size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Rate & Review" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        ) : (
          /* TECHNICIAN MENU */
          <>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
              TECHNICIAN PORTAL
            </Typography>
            <List disablePadding sx={{ mb: 2 }}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'tech-dashboard'}
                  onClick={() => setActiveTab('tech-dashboard')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'tech-dashboard' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'tech-dashboard' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'tech-dashboard' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <ClipboardList size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Job Requests" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'emergency-queue'}
                  onClick={() => setActiveTab('emergency-queue')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'emergency-queue' ? '#EF4444' : '#94A3B8',
                    backgroundColor: activeTab === 'emergency-queue' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'emergency-queue' ? '#EF4444' : '#64748B', minWidth: 36 }}>
                    <Shield size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Emergency Queue" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem', color: activeTab === 'emergency-queue' ? '#EF4444' : '#94A3B8' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'chat' || activeTab === 'chat-support'}
                  onClick={() => setActiveTab('chat')}
                  sx={{
                    borderRadius: 2,
                    color: (activeTab === 'chat' || activeTab === 'chat-support') ? '#00A8FF' : '#94A3B8',
                    backgroundColor: (activeTab === 'chat' || activeTab === 'chat-support') ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: (activeTab === 'chat' || activeTab === 'chat-support') ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <MessageSquare size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Live Chat & Calls" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'tech-availability'}
                  onClick={() => setActiveTab('tech-availability')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'tech-availability' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'tech-availability' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'tech-availability' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Sliders size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Availability Config" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeTab === 'progress-tracker'}
                  onClick={() => setActiveTab('progress-tracker')}
                  sx={{
                    borderRadius: 2,
                    color: activeTab === 'progress-tracker' ? '#00A8FF' : '#94A3B8',
                    backgroundColor: activeTab === 'progress-tracker' ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 168, 255, 0.08)' }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === 'progress-tracker' ? '#00A8FF' : '#64748B', minWidth: 36 }}>
                    <Activity size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Status Tracker" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        )}
      </Box>

      {/* Logout Button */}
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={onLogout}
        startIcon={<LogOut size={16} />}
        sx={{
          borderRadius: 2,
          fontWeight: 600,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          color: '#EF4444',
          '&:hover': {
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }
        }}
      >
        Sign Out
      </Button>

      {/* User Profile Modal */}
      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        PaperProps={{
          sx: { backgroundColor: '#172036', color: '#FFF', borderRadius: 3, border: '1px solid #2A364F', p: 1, minWidth: 360 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: isCustomer ? '#00A8FF' : '#10B981', color: '#0D1527', fontWeight: 700 }}>
            {currentUser?.avatar || currentUser?.name?.slice(0, 2).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {currentUser?.name || 'User Profile'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentUser?.role} ACCOUNT
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
            <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: '#0F172A', borderColor: '#2A364F' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                EMAIL ADDRESS
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {currentUser?.email || 'user@techaid.com'}
              </Typography>
            </Paper>

            {currentUser?.phone && (
              <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: '#0F172A', borderColor: '#2A364F' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  PHONE NUMBER
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {currentUser.phone}
                </Typography>
              </Paper>
            )}

            {isTechnician && currentUser?.specialty && (
              <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: '#0F172A', borderColor: '#2A364F' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  SPECIALTY
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {currentUser.specialty}
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)} sx={{ color: '#00A8FF', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
