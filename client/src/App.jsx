import React, {
  useEffect,
  useState
} from 'react';

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

import { TechnicianAssignment } from './pages/TechnicianAssignment';

// MEMBER 4 - manual technician search
import { TechnicianSearch } from './pages/TechnicianSearch';

// MODULE 3 FEATURE 4 - Rating & Review
import RatingReview from './pages/RatingReview';

// ==========================================================
// MODULE 2 FEATURE 4 - SECURE PAYMENT & INVOICE SYSTEM
// ==========================================================
import Payment from './pages/Payment';


export default function App() {

  // ========================================================
  // CURRENT USER
  // ========================================================

  const [currentUser, setCurrentUser] = useState(() => {

    const saved =
      localStorage.getItem(
        'techaid_user'
      );

    return saved
      ? JSON.parse(saved)
      : null;
  });


  // ========================================================
  // ACTIVE PAGE
  // ========================================================

  const [
    activeTab,
    setActiveTab
  ] = useState('new-request');


  // ========================================================
  // STRIPE REDIRECT CHECK
  //
  // Stripe success hole:
  // ?payment=success&session_id=...
  //
  // Payment page automatically open hobe.
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
      paymentStatus === 'success' ||
      paymentStatus === 'cancelled'
    ) {

      setActiveTab(
        'payment'
      );
    }

  }, []);


  // ========================================================
  // LOGIN
  // ========================================================

  const handleLoginSuccess = (user) => {

    setCurrentUser(user);

    localStorage.setItem(
      'techaid_user',
      JSON.stringify(user)
    );


    if (
      user.role === 'TECHNICIAN'
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

  const handleLogout = () => {

    setCurrentUser(null);

    localStorage.removeItem(
      'techaid_user'
    );

    setActiveTab(
      'new-request'
    );


    // Stripe query params clean
    window.history.replaceState(
      {},
      '',
      window.location.pathname
    );
  };


  // ========================================================
  // LOGIN PAGE
  // ========================================================

  if (!currentUser) {

    return (

      <ThemeProvider theme={theme}>

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

    <ThemeProvider theme={theme}>

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
            CONTENT
        ================================================= */}

        <Box
          sx={{
            flexGrow:
              1,

            overflow:
              'hidden'
          }}
        >

          {/* ===============================================
              CUSTOMER - NEW REQUEST
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
            />

          )}


          {/* ===============================================
              MEMBER 4 - AUTO ASSIGNMENT
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
              MEMBER 4 - MANUAL TECHNICIAN SEARCH
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
              CUSTOMER - APPOINTMENTS
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
              CUSTOMER - PROGRESS
          =============================================== */}

          {activeTab ===
            'progress-tracker' && (

            <ServiceProgressTracker
              currentUser={
                currentUser
              }
            />

          )}


          {/* ===============================================
              MODULE 3 FEATURE 4 - RATING & REVIEW
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
              MODULE 2 FEATURE 4 - PAYMENT & INVOICE
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
              TECHNICIAN JOB REQUESTS
          =============================================== */}

          {activeTab ===
            'tech-dashboard' && (

            <TechnicianDashboard
              currentUser={
                currentUser
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