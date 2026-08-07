import React from 'react';
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
  MessageSquare,
  ClipboardList,
  Clock,
  DollarSign,
  Shield,
  UserCheck
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, userRole, setUserRole }) => {
  return (
    <Box
      sx={{
        width: 240,
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
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
            CSE471 • Member 2
          </Typography>
        </Box>
      </Box>

      {/* Role Switcher Pill */}
      <Box
        sx={{
          backgroundColor: '#172036',
          p: 0.5,
          borderRadius: 2,
          display: 'flex',
          mb: 3,
          border: '1px solid #2A364F'
        }}
      >
        <Button
          fullWidth
          size="small"
          onClick={() => setUserRole('CUSTOMER')}
          sx={{
            backgroundColor: userRole === 'CUSTOMER' ? '#00A8FF' : 'transparent',
            color: userRole === 'CUSTOMER' ? '#0D1527' : '#94A3B8',
            fontSize: '0.75rem',
            py: 0.5,
            fontWeight: 700,
            '&:hover': {
              backgroundColor: userRole === 'CUSTOMER' ? '#00A8FF' : 'rgba(255,255,255,0.05)'
            }
          }}
        >
          Customer
        </Button>
        <Button
          fullWidth
          size="small"
          onClick={() => {
            setUserRole('TECHNICIAN');
            if (activeTab === 'new-request' || activeTab === 'appointments') {
              setActiveTab('tech-dashboard');
            }
          }}
          sx={{
            backgroundColor: userRole === 'TECHNICIAN' ? '#00A8FF' : 'transparent',
            color: userRole === 'TECHNICIAN' ? '#0D1527' : '#94A3B8',
            fontSize: '0.75rem',
            py: 0.5,
            fontWeight: 700,
            '&:hover': {
              backgroundColor: userRole === 'TECHNICIAN' ? '#00A8FF' : 'rgba(255,255,255,0.05)'
            }
          }}
        >
          Technician
        </Button>
      </Box>

      {/* Navigation Links */}
      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, px: 1, mb: 1 }}>
        {userRole === 'CUSTOMER' ? 'CUSTOMER MENU' : 'TECHNICIAN DASHBOARD'}
      </Typography>

      <List disablePadding>
        {userRole === 'CUSTOMER' ? (
          <>
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
                <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'new-request' ? '#00A8FF' : '#94A3B8' }}>
                  <PlusCircle size={20} />
                </ListItemIcon>
                <ListItemText primary="New request" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

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
                <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'appointments' ? '#00A8FF' : '#94A3B8' }}>
                  <Calendar size={20} />
                </ListItemIcon>
                <ListItemText primary="Appointments" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'messages'}
                onClick={() => setActiveTab('messages')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'messages' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'messages' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'messages' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'messages' ? '#00A8FF' : '#94A3B8' }}>
                  <MessageSquare size={20} />
                </ListItemIcon>
                <ListItemText primary="Messages" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
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
                <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'tech-dashboard' ? '#00A8FF' : '#94A3B8' }}>
                  <ClipboardList size={20} />
                </ListItemIcon>
                <ListItemText primary="Requests" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'tech-schedule'}
                onClick={() => setActiveTab('tech-schedule')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'tech-schedule' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'tech-schedule' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'tech-schedule' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'tech-schedule' ? '#00A8FF' : '#94A3B8' }}>
                  <Clock size={20} />
                </ListItemIcon>
                <ListItemText primary="Schedule" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === 'tech-earnings'}
                onClick={() => setActiveTab('tech-earnings')}
                sx={{
                  borderRadius: 2,
                  color: activeTab === 'tech-earnings' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: activeTab === 'tech-earnings' ? '#172036' : 'transparent',
                  borderLeft: activeTab === 'tech-earnings' ? '4px solid #00A8FF' : '4px solid transparent',
                  '&:hover': { backgroundColor: '#172036' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: activeTab === 'tech-earnings' ? '#00A8FF' : '#94A3B8' }}>
                  <DollarSign size={20} />
                </ListItemIcon>
                <ListItemText primary="Earning" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      <Box sx={{ mt: 'auto', p: 1.5, backgroundColor: '#172036', borderRadius: 2, border: '1px solid #1E293B' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserCheck size={18} color="#00A8FF" />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFF' }}>
            {userRole === 'CUSTOMER' ? 'Mehedi Hasan' : 'Rafiq Ahmed (Tech)'}
          </Typography>
        </Box>
        <Chip
          label={userRole === 'CUSTOMER' ? 'ID: 23201345' : 'Verified Technician'}
          size="small"
          sx={{ mt: 1, backgroundColor: 'rgba(0, 168, 255, 0.15)', color: '#00A8FF', fontSize: '0.7rem', fontWeight: 700 }}
        />
      </Box>
    </Box>
  );
};
