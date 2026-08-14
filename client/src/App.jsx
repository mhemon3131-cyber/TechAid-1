import React, { useState } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Auth } from './pages/Auth';
import { Sidebar } from './components/Sidebar';
import { CreateRequest } from './pages/CreateRequest';
import { AppointmentBooking } from './pages/AppointmentBooking';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { TechnicianAvailability } from './pages/TechnicianAvailability';
import { ServiceProgressTracker } from './pages/ServiceProgressTracker';
import ChatPage from './pages/ChatPage';
import EmergencyQueue from './pages/EmergencyQueue';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('techaid_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('new-request');

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('techaid_user', JSON.stringify(user));
    if (user.role === 'TECHNICIAN') {
      setActiveTab('tech-dashboard');
    } else {
      setActiveTab('new-request');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('techaid_user');
  };

  // If user is not logged in, render real Login page
  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Auth onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D1527' }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {/* Module 1: Service Request Creation */}
          {activeTab === 'new-request' && (
            <CreateRequest
              currentUser={currentUser}
              onNavigateToAppointment={() => setActiveTab('appointments')}
            />
          )}

          {/* Module 2: Appointment Scheduling */}
          {activeTab === 'appointments' && (
            <AppointmentBooking currentUser={currentUser} />
          )}

          {/* Module 2 & 3: Real-Time Communication System (Chat/Calls) */}
          {activeTab === 'chat' && <ChatPage />}

          {/* Module 3: Emergency Support Queue */}
          {activeTab === 'emergency-queue' && <EmergencyQueue />}

          {/* Module 3 Feature 4: Service Progress Tracking */}
          {activeTab === 'progress-tracker' && (
            <ServiceProgressTracker currentUser={currentUser} />
          )}

          {/* Technician Dashboard Console */}
          {activeTab === 'tech-dashboard' && (
            <TechnicianDashboard currentUser={currentUser} />
          )}

          {/* Module 3 Feature 3: Technician Availability Management */}
          {activeTab === 'tech-availability' && (
            <TechnicianAvailability currentUser={currentUser} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
