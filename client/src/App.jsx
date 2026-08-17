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
  const [activeConvId, setActiveConvId] = useState(null);

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

  const handleEmergencyAccepted = async (reqItem) => {
    const custId = reqItem?.customer?.id || reqItem?.customerId || 'usr-1';
    const custName = reqItem?.customer?.name || reqItem?.customerName || 'Customer';
    const custEmail = reqItem?.customer?.email || 'customer@techaid.com';
    const techId = currentUser?.id || 'usr-4';
    const techName = currentUser?.name || 'Technician';
    const targetConvId = `conv_${custId}_${techId}`;

    try {
      await axios.post('http://localhost:1257/api/conversations/register', {
        id: targetConvId,
        serviceRequestId: reqItem?.id || reqItem?.trackingId,
        customerId: custId,
        customerName: custName,
        customerEmail: custEmail,
        technicianId: techId,
        technicianName: techName,
        title: reqItem?.title || reqItem?.requestTitle || 'Emergency Technical Support',
        deviceCategory: reqItem?.deviceCategory || 'Laptop'
      }, {
        headers: {
          'user-id': currentUser?.id,
          'user-role': currentUser?.role,
          'user-name': currentUser?.name
        }
      });
    } catch (e) {}

    setActiveConvId(targetConvId);
    setActiveTab('chat');
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
              onNavigateToChat={() => setActiveTab('chat')}
            />
          )}

          {/* Module 2: Appointment Scheduling */}
          {activeTab === 'appointments' && (
            <AppointmentBooking currentUser={currentUser} />
          )}

          {/* Module 2 & 3: Real-Time Communication System (Chat/Calls) */}
          {activeTab === 'chat' && (
            <ChatPage
              currentUser={currentUser}
              initialConvId={activeConvId}
            />
          )}

          {/* Module 3: Emergency Support Queue */}
          {activeTab === 'emergency-queue' && (
            <EmergencyQueue
              onAcceptSuccess={(reqItem) => handleEmergencyAccepted(reqItem)}
            />
          )}

          {/* Module 3 Feature 4: Service Progress Tracking */}
          {activeTab === 'progress-tracker' && (
            <ServiceProgressTracker currentUser={currentUser} />
          )}

          {/* Technician Dashboard Console */}
          {activeTab === 'tech-dashboard' && (
            <TechnicianDashboard
              currentUser={currentUser}
              onOpenChat={async (app) => {
                const custId = app?.customerId || 'usr-1';
                const custName = app?.customerName || 'Customer';
                const techId = currentUser?.id || 'usr-4';
                const techName = currentUser?.name || 'Technician';
                const targetConvId = `conv_${custId}_${techId}`;

                try {
                  await axios.post('http://localhost:1257/api/conversations/register', {
                    id: targetConvId,
                    serviceRequestId: app?.serviceRequestId || app?.id,
                    customerId: custId,
                    customerName: custName,
                    technicianId: techId,
                    technicianName: techName,
                    title: app?.requestTitle || app?.title || 'Technical Repair Request',
                    deviceCategory: app?.deviceCategory || 'Laptop'
                  }, {
                    headers: {
                      'user-id': currentUser?.id,
                      'user-role': currentUser?.role,
                      'user-name': currentUser?.name
                    }
                  });
                } catch (e) {}

                setActiveConvId(targetConvId);
                setActiveTab('chat');
              }}
            />
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
