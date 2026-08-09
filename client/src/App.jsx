import React, { useState } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Sidebar } from './components/Sidebar';
import { CreateRequest } from './pages/CreateRequest';
import { AppointmentBooking } from './pages/AppointmentBooking';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { TechnicianAvailability } from './pages/TechnicianAvailability';
import { ServiceProgressTracker } from './pages/ServiceProgressTracker';

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
          {/* Module 1: Service Request Creation */}
          {activeTab === 'new-request' && (
            <CreateRequest onNavigateToAppointment={() => setActiveTab('appointments')} />
          )}

          {/* Module 2: Appointment Scheduling */}
          {activeTab === 'appointments' && (
            <AppointmentBooking />
          )}

          {/* Module 3 Feature 4: Service Progress Tracking */}
          {activeTab === 'progress-tracker' && (
            <ServiceProgressTracker />
          )}

          {/* Technician Dashboard Console */}
          {activeTab === 'tech-dashboard' && (
            <TechnicianDashboard />
          )}

          {/* Module 3 Feature 3: Technician Availability Management */}
          {activeTab === 'tech-availability' && (
            <TechnicianAvailability />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
