import React from 'react';
import NotificationBell from './NotificationBell';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Chip
} from '@mui/material';
import {
  PlusCircle,
  Calendar,
  ClipboardList,
  Shield,
  Activity,
  Sliders,
  LogOut,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Bot,
  History,
  Calculator
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const isCustomer = currentUser?.role === 'CUSTOMER';

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
      {/* Brand Header with Notification Bell */}
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
        <NotificationBell currentUser={currentUser} />
      </Box>

      {/* Current Active Account Card */}
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
        <Chip
          label={currentUser?.role === 'CUSTOMER' ? 'Customer Account' : `${currentUser?.specialty || 'Technician'}`}
          size="small"
          sx={{
            mt: 0.8,
            backgroundColor: currentUser?.role === 'CUSTOMER' ? 'rgba(0, 168, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: currentUser?.role === 'CUSTOMER' ? '#00A8FF' : '#10B981',
            fontSize: '0.68rem',
            fontWeight: 700
          }}
        />
      </Box>

      {/* Navigation Links */}
      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, px: 1, mb: 1 }}>
        {isCustomer ? 'CUSTOMER DASHBOARD' : 'TECHNICIAN PORTAL'}
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

            {/* Live Chat (Member 3) */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'chat'}
                onClick={() => setActiveTab('chat')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'chat' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'chat' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'chat' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'chat' ? '#00A8FF' : '#94A3B8' }}>
                  <MessageSquare size={18} />
                </ListItemIcon>
                <ListItemText primary="Live Chat & Calls" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
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

            {/* AI Issue Classification (Member 1) */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'ai-classify'}
                onClick={() => setActiveTab('ai-classify')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'ai-classify' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'ai-classify' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'ai-classify' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'ai-classify' ? '#00A8FF' : '#94A3B8' }}>
                  <Sparkles size={18} />
                </ListItemIcon>
                <ListItemText primary="AI Issue Classifier" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            {/* AI Troubleshooting Assistant (Member 1) */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'ai-troubleshoot'}
                onClick={() => setActiveTab('ai-troubleshoot')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'ai-troubleshoot' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'ai-troubleshoot' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'ai-troubleshoot' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'ai-troubleshoot' ? '#00A8FF' : '#94A3B8' }}>
                  <Bot size={18} />
                </ListItemIcon>
                <ListItemText primary="AI Troubleshoot" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            {/* Issue Resolution History (Member 1) */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'resolution-history'}
                onClick={() => setActiveTab('resolution-history')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'resolution-history' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'resolution-history' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'resolution-history' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'resolution-history' ? '#00A8FF' : '#94A3B8' }}>
                  <History size={18} />
                </ListItemIcon>
                <ListItemText primary="Resolution History" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            {/* Service Cost Estimator (Member 1) */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'cost-estimate'}
                onClick={() => setActiveTab('cost-estimate')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'cost-estimate' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'cost-estimate' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'cost-estimate' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'cost-estimate' ? '#00A8FF' : '#94A3B8' }}>
                  <Calculator size={18} />
                </ListItemIcon>
                <ListItemText primary="Cost Estimator" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
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

            {/* Emergency Queue (Member 3) */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'emergency-queue'}
                onClick={() => setActiveTab('emergency-queue')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'emergency-queue' ? '#FFFFFF' : '#EF4444',
                  backgroundColor: activeTab === 'emergency-queue' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'emergency-queue' ? '4px solid #EF4444' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: '#EF4444' }}>
                  <AlertTriangle size={18} />
                </ListItemIcon>
                <ListItemText primary="Emergency Queue" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            {/* Live Chat (Member 3) */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'chat'}
                onClick={() => setActiveTab('chat')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'chat' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'chat' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'chat' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: activeTab === 'chat' ? '#00A8FF' : '#94A3B8' }}>
                  <MessageSquare size={18} />
                </ListItemIcon>
                <ListItemText primary="Live Chat & Calls" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
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
