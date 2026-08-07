import React, { useState } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Sidebar } from './components/Sidebar';
import { CreateRequest } from './pages/CreateRequest';
import { AppointmentBooking } from './pages/AppointmentBooking';
import { TechnicianDashboard } from './pages/TechnicianDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('new-request');
  const [userRole, setUserRole] = useState('CUSTOMER');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D1527' }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          setUserRole={setUserRole}
        />

        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {activeTab === 'new-request' && (
            <CreateRequest onNavigateToAppointment={() => setActiveTab('appointments')} />
          )}

          {activeTab === 'appointments' && (
            <AppointmentBooking />
          )}

          {activeTab === 'messages' && (
            <Box sx={{ p: 4, color: '#FFF' }}>
              <h2>Messages & Live Support</h2>
              <p>Module 3 feature - Integrated with Socket.IO and ZEGOCLOUD API.</p>
            </Box>
          )}

          {activeTab === 'tech-dashboard' && (
            <TechnicianDashboard />
          )}

          {activeTab === 'tech-schedule' && (
            <Box sx={{ p: 4, color: '#FFF' }}>
              <h2>Technician Schedule</h2>
              <p>Calendar view of all accepted appointments.</p>
            </Box>
          )}

          {activeTab === 'tech-earnings' && (
            <Box sx={{ p: 4, color: '#FFF' }}>
              <h2>Earnings Overview</h2>
              <p>Total Income: ৳14,200 (12 completed jobs this week)</p>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
