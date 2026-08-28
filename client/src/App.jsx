import React, { useState } from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Auth } from './pages/Auth';
import { Sidebar } from './components/Sidebar';
import axios from 'axios';
import { getSocket } from './socket/socket';

// Module 1 Pages
import { CreateRequest } from './pages/CreateRequest';
import { AIIssueClassifier } from './pages/AIIssueClassifier';
import { AITroubleshootAssistant } from './pages/AITroubleshootAssistant';
import EmergencyQueue from './pages/EmergencyQueue';
import { IssueResolutionHistory } from './pages/IssueResolutionHistory';

// Module 2 Pages
import { AppointmentBooking } from './pages/AppointmentBooking';
import { TechnicianSearch } from './pages/TechnicianSearch';
import { TechnicianAssignment } from './pages/TechnicianAssignment';

// Module 3 Pages
import { ServiceProgressTracker } from './pages/ServiceProgressTracker';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { TechnicianAvailability } from './pages/TechnicianAvailability';
import ChatPage from './pages/ChatPage';

// Module 4 Pages
import Payment from './pages/Payment';
import RatingReview from './pages/RatingReview';
import { ServiceCostEstimator } from './pages/ServiceCostEstimator';

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

    // Emit live socket event to notify customer that request was accepted
    const socket = getSocket();
    socket.emit('emergency_request_accepted', {
      targetConvId,
      serviceRequestId: reqItem?.id || reqItem?.trackingId,
      customerId: custId,
      customerName: custName,
      technicianId: techId,
      technicianName: techName,
    });

    setActiveConvId(targetConvId);
    setActiveTab('chat-support');
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

        <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: '100vh' }}>
          {/* --- MODULE 1: REQUESTS & AI --- */}
          {activeTab === 'new-request' && (
            <CreateRequest
              currentUser={currentUser}
              onNavigateToAppointment={() => setActiveTab('appointments')}
            />
          )}

          {activeTab === 'ai-classifier' && (
            <AIIssueClassifier
              currentUser={currentUser}
              onNavigateToAppointment={() => setActiveTab('appointments')}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AITroubleshootAssistant
              currentUser={currentUser}
              onNavigateToAppointment={() => setActiveTab('appointments')}
            />
          )}

          {activeTab === 'emergency-queue' && (
            <EmergencyQueue
              currentUser={currentUser}
              onAcceptSuccess={(reqItem) => handleEmergencyAccepted(reqItem)}
            />
          )}

          {activeTab === 'resolution-history' && (
            <IssueResolutionHistory currentUser={currentUser} />
          )}

          {/* --- MODULE 2: APPOINTMENTS & SEARCH --- */}
          {activeTab === 'appointments' && (
            <AppointmentBooking currentUser={currentUser} />
          )}

          {activeTab === 'tech-search' && (
            <TechnicianSearch onBack={() => setActiveTab('new-request')} />
          )}

          {activeTab === 'auto-assignment' && (
            <TechnicianAssignment
              currentUser={currentUser}
              onSearchTechnicians={() => setActiveTab('tech-search')}
            />
          )}

          {/* --- MODULE 3: TRACKING & CHAT --- */}
          {activeTab === 'progress-tracker' && (
            <ServiceProgressTracker currentUser={currentUser} />
          )}

          {(activeTab === 'chat-support' || activeTab === 'chat') && (
            <ChatPage
              currentUser={currentUser}
              initialConvId={activeConvId}
            />
          )}

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
                setActiveTab('chat-support');
              }}
            />
          )}

          {activeTab === 'tech-availability' && (
            <TechnicianAvailability currentUser={currentUser} />
          )}

          {/* --- MODULE 4: PAYMENT, REVIEWS & ESTIMATES --- */}
          {activeTab === 'payment' && (
            <Payment currentUser={currentUser} />
          )}

          {activeTab === 'rating-review' && (
            <RatingReview currentUser={currentUser} />
          )}

          {activeTab === 'cost-estimator' && (
            <ServiceCostEstimator />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
