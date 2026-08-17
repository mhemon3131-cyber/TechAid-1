import React, {
  useEffect,
  useState
} from 'react';

import axios from 'axios';

import {
  Box,
  ThemeProvider,
  CssBaseline
} from '@mui/material';

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


// ==========================================================
// MAIN BRANCH - AI / SUPPORT FEATURES
// ==========================================================

import {
  AIIssueClassifier
} from './pages/AIIssueClassifier';

import {
  AITroubleshootAssistant
} from './pages/AITroubleshootAssistant';

import {
  IssueResolutionHistory
} from './pages/IssueResolutionHistory';

import {
  ServiceCostEstimator
} from './pages/ServiceCostEstimator';


// ==========================================================
// MEMBER 4 - AUTO ASSIGNMENT
// ==========================================================

import {
  TechnicianAssignment
} from './pages/TechnicianAssignment';


// ==========================================================
// MEMBER 4 - MANUAL TECHNICIAN SEARCH
// ==========================================================

import {
  TechnicianSearch
} from './pages/TechnicianSearch';


// ==========================================================
// MODULE 3 FEATURE 4 - RATING & REVIEW
// ==========================================================

import RatingReview from './pages/RatingReview';


// ==========================================================
// MODULE 2 FEATURE 4 - PAYMENT
// ==========================================================

import Payment from './pages/Payment';


export default function App() {

  // ========================================================
  // CURRENT USER
  // ========================================================

  const [
    currentUser,
    setCurrentUser
  ] = useState(() => {

    const saved =
      localStorage.getItem(
        'techaid_user'
      );

    return saved
      ? JSON.parse(
          saved
        )
      : null;
  });


  // ========================================================
  // ACTIVE TAB
  // ========================================================

  const [
    activeTab,
    setActiveTab
  ] = useState(
    'new-request'
  );


  // ========================================================
  // ACTIVE CHAT
  // ========================================================

  const [
    activeConvId,
    setActiveConvId
  ] = useState(
    null
  );


  // ========================================================
  // STRIPE REDIRECT
  // ========================================================

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const paymentStatus =
      params.get(
        'payment'
      );


    if (
      paymentStatus ===
        'success' ||
      paymentStatus ===
        'cancelled'
    ) {

      setActiveTab(
        'payment'
      );
    }

  }, []);


  // ========================================================
  // LOGIN SUCCESS
  // ========================================================

  const handleLoginSuccess =
    (user) => {

      setCurrentUser(
        user
      );


      localStorage.setItem(
        'techaid_user',
        JSON.stringify(
          user
        )
      );


      if (
        user.role ===
        'TECHNICIAN'
      ) {

        setActiveTab(
          'tech-dashboard'
        );

      } else {

        setActiveTab(
          'new-request'
        );
      }
    };


  // ========================================================
  // LOGOUT
  // ========================================================

  const handleLogout =
    () => {

      setCurrentUser(
        null
      );


      localStorage.removeItem(
        'techaid_user'
      );


      setActiveTab(
        'new-request'
      );


      setActiveConvId(
        null
      );


      window.history.replaceState(
        {},
        '',
        window.location.pathname
      );
    };


  // ========================================================
  // EMERGENCY REQUEST ACCEPTED
  // ========================================================

  const handleEmergencyAccepted =
    (reqItem) => {

      const custId =
        reqItem?.customer?.id ||
        reqItem?.customerId ||
        'usr-1';


      const custName =
        reqItem?.customer?.name ||
        reqItem?.customerName ||
        'Customer';


      const custEmail =
        reqItem?.customer?.email ||
        'customer@techaid.com';


      const techId =
        currentUser?.id ||
        'usr-4';


      const techName =
        currentUser?.name ||
        'Technician';


      const targetConvId =
        `conv_${custId}_${techId}`;


      axios
        .post(
          'http://localhost:1257/api/conversations/register',

          {
            id:
              targetConvId,

            serviceRequestId:
              reqItem?.id ||
              reqItem?.trackingId,

            customerId:
              custId,

            customerName:
              custName,

            customerEmail:
              custEmail,

            technicianId:
              techId,

            technicianName:
              techName,

            title:
              reqItem?.title ||
              reqItem?.requestTitle ||
              'Emergency Technical Support',

            deviceCategory:
              reqItem?.deviceCategory ||
              'Laptop'
          },

          {
            headers: {

              'user-id':
                currentUser?.id,

              'user-role':
                currentUser?.role,

              'user-name':
                currentUser?.name
            }
          }
        )
        .catch(
          () => {}
        );


      setActiveConvId(
        targetConvId
      );


      setActiveTab(
        'chat'
      );
    };


  // ========================================================
  // TECHNICIAN OPEN CHAT
  // ========================================================

  const handleTechnicianOpenChat =
    (app) => {

      const custId =
        app?.customerId ||
        'usr-1';


      const custName =
        app?.customerName ||
        'Customer';


      const techId =
        currentUser?.id ||
        'usr-4';


      const techName =
        currentUser?.name ||
        'Technician';


      const targetConvId =
        `conv_${custId}_${techId}`;


      axios
        .post(
          'http://localhost:1257/api/conversations/register',

          {
            id:
              targetConvId,

            serviceRequestId:
              app?.serviceRequestId ||
              app?.id,

            customerId:
              custId,

            customerName:
              custName,

            technicianId:
              techId,

            technicianName:
              techName,

            title:
              app?.requestTitle ||
              app?.title ||
              'Technical Repair Request',

            deviceCategory:
              app?.deviceCategory ||
              'Laptop'
          },

          {
            headers: {

              'user-id':
                currentUser?.id,

              'user-role':
                currentUser?.role,

              'user-name':
                currentUser?.name
            }
          }
        )
        .catch(
          () => {}
        );


      setActiveConvId(
        targetConvId
      );


      setActiveTab(
        'chat'
      );
    };


  // ========================================================
  // LOGIN PAGE
  // ========================================================

  if (
    !currentUser
  ) {

    return (

      <ThemeProvider
        theme={
          theme
        }
      >

        <CssBaseline />


        <Auth
          onLoginSuccess={
            handleLoginSuccess
          }
        />

      </ThemeProvider>
    );
  }


  // ========================================================
  // MAIN APP
  // ========================================================

  return (

    <ThemeProvider
      theme={
        theme
      }
    >

      <CssBaseline />


      <Box
        sx={{
          display:
            'flex',

          minHeight:
            '100vh',

          backgroundColor:
            '#0D1527'
        }}
      >

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Sidebar
          activeTab={
            activeTab
          }

          setActiveTab={
            setActiveTab
          }

          currentUser={
            currentUser
          }

          onLogout={
            handleLogout
          }
        />


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <Box
          sx={{
            flexGrow:
              1,

            overflow:
              'auto'
          }}
        >

          {/* ===============================================
              NEW REQUEST
          =============================================== */}

          {activeTab ===
            'new-request' && (

            <CreateRequest
              currentUser={
                currentUser
              }

              onNavigateToAppointment={() =>
                setActiveTab(
                  'appointments'
                )
              }

              onNavigateToChat={() =>
                setActiveTab(
                  'chat'
                )
              }
            />
          )}


          {/* ===============================================
              AUTO ASSIGNMENT
          =============================================== */}

          {activeTab ===
            'technician-assignment' && (

            <TechnicianAssignment
              currentUser={
                currentUser
              }

              onSearchTechnicians={() =>
                setActiveTab(
                  'technician-search'
                )
              }
            />
          )}


          {/* ===============================================
              TECHNICIAN SEARCH
          =============================================== */}

          {activeTab ===
            'technician-search' && (

            <TechnicianSearch
              currentUser={
                currentUser
              }

              onBack={() =>
                setActiveTab(
                  'technician-assignment'
                )
              }
            />
          )}


          {/* ===============================================
              APPOINTMENTS
          =============================================== */}

          {activeTab ===
            'appointments' && (

            <AppointmentBooking
              currentUser={
                currentUser
              }
            />
          )}


          {/* ===============================================
              LIVE CHAT
          =============================================== */}

          {activeTab ===
            'chat' && (

            <ChatPage
              currentUser={
                currentUser
              }

              initialConvId={
                activeConvId
              }
            />
          )}


          {/* ===============================================
              EMERGENCY QUEUE
          =============================================== */}

          {activeTab ===
            'emergency-queue' && (

            <EmergencyQueue
              onAcceptSuccess={
                handleEmergencyAccepted
              }
            />
          )}


          {/* ===============================================
              PROGRESS TRACKER
          =============================================== */}

          {activeTab ===
            'progress-tracker' && (

            <ServiceProgressTracker
              currentUser={
                currentUser
              }

              onNavigateToReview={() =>
                setActiveTab(
                  'rating-review'
                )
              }
            />
          )}


          {/* ===============================================
              PAYMENT
          =============================================== */}

          {activeTab ===
            'payment' && (

            <Payment
              currentUser={
                currentUser
              }
            />
          )}


          {/* ===============================================
              RATING & REVIEW
          =============================================== */}

          {activeTab ===
            'rating-review' && (

            <RatingReview
              currentUser={
                currentUser
              }
            />
          )}


          {/* ===============================================
              AI ISSUE CLASSIFIER
          =============================================== */}

          {activeTab ===
            'ai-classify' && (

            <AIIssueClassifier
              currentUser={
                currentUser
              }
            />
          )}


          {/* ===============================================
              AI TROUBLESHOOT
          =============================================== */}

          {activeTab ===
            'ai-troubleshoot' && (

            <AITroubleshootAssistant
              currentUser={
                currentUser
              }
            />
          )}


          {/* ===============================================
              ISSUE RESOLUTION HISTORY
          =============================================== */}

          {activeTab ===
            'resolution-history' && (

            <IssueResolutionHistory
              currentUser={
                currentUser
              }
            />
          )}


          {/* ===============================================
              SERVICE COST ESTIMATOR
          =============================================== */}

          {activeTab ===
            'cost-estimate' && (

            <ServiceCostEstimator
              currentUser={
                currentUser
              }
            />
          )}


          {/* ===============================================
              TECHNICIAN DASHBOARD
          =============================================== */}

          {activeTab ===
            'tech-dashboard' && (

            <TechnicianDashboard
              currentUser={
                currentUser
              }

              onOpenChat={
                handleTechnicianOpenChat
              }
            />
          )}


          {/* ===============================================
              TECHNICIAN AVAILABILITY
          =============================================== */}

          {activeTab ===
            'tech-availability' && (

            <TechnicianAvailability
              currentUser={
                currentUser
              }
            />
          )}

        </Box>

      </Box>

    </ThemeProvider>
  );
}