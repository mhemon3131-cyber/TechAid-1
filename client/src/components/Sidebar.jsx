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
  ClipboardList,
  Shield,
  Activity,
  Sliders,
  LogOut,
  MapPinned,
  Star,
  Search,
  CreditCard
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout
}) => {
  const isCustomer =
    currentUser?.role === 'CUSTOMER';

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

      {/* =================================================
          LOGO
      ================================================= */}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 3
        }}
      >
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
            boxShadow:
              '0 0 15px rgba(0, 168, 255, 0.4)'
          }}
        >
          <Shield
            size={24}
            strokeWidth={2.5}
          />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1.25rem'
            }}
          >
            Tech
            <span
              style={{
                color: '#00A8FF'
              }}
            >
              Aid
            </span>
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              display: 'block',
              fontSize: '0.7rem'
            }}
          >
            IT Support Platform
          </Typography>
        </Box>
      </Box>


      {/* =================================================
          CURRENT USER
      ================================================= */}

      <Box
        sx={{
          backgroundColor: '#172036',
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          mb: 3,
          border:
            '1px solid #2A364F'
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#94A3B8',
            fontWeight: 600,
            display: 'block'
          }}
        >
          LOGGED IN AS
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#FFF',
            fontWeight: 700,
            mt: 0.2
          }}
        >
          {currentUser?.name || 'User'}
        </Typography>

        <Chip
          label={
            currentUser?.role ===
            'CUSTOMER'
              ? 'Customer Account'
              : `${
                  currentUser?.specialty ||
                  'Technician'
                }`
          }
          size="small"
          sx={{
            mt: 0.8,

            backgroundColor:
              currentUser?.role ===
              'CUSTOMER'
                ? 'rgba(0, 168, 255, 0.15)'
                : 'rgba(16, 185, 129, 0.15)',

            color:
              currentUser?.role ===
              'CUSTOMER'
                ? '#00A8FF'
                : '#10B981',

            fontSize: '0.68rem',
            fontWeight: 700
          }}
        />
      </Box>


      {/* =================================================
          DASHBOARD TITLE
      ================================================= */}

      <Typography
        variant="caption"
        sx={{
          color: '#64748B',
          fontWeight: 600,
          px: 1,
          mb: 1
        }}
      >
        {isCustomer
          ? 'CUSTOMER DASHBOARD'
          : 'TECHNICIAN PORTAL'}
      </Typography>


      {/* =================================================
          MENU
      ================================================= */}

      <List disablePadding>

        {isCustomer ? (

          <>
            {/* =============================================
                NEW REQUEST
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'new-request'
                }
                onClick={() =>
                  setActiveTab(
                    'new-request'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'new-request'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'new-request'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'new-request'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'new-request'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <PlusCircle
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="New Request"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>


            {/* =============================================
                AUTO ASSIGNMENT
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'technician-assignment'
                }
                onClick={() =>
                  setActiveTab(
                    'technician-assignment'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'technician-assignment'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'technician-assignment'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'technician-assignment'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'technician-assignment'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <MapPinned
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Auto Assignment"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>


            {/* =============================================
                MODULE 3 FEATURE 4
                ADVANCED SEARCH & FILTER
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'technician-search'
                }
                onClick={() =>
                  setActiveTab(
                    'technician-search'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'technician-search'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'technician-search'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'technician-search'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'technician-search'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <Search
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Advanced Search"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>


            {/* =============================================
                APPOINTMENTS
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'appointments'
                }
                onClick={() =>
                  setActiveTab(
                    'appointments'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'appointments'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'appointments'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'appointments'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'appointments'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <Calendar
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Book Appointment"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>


            {/* =============================================
                PROGRESS TRACKING
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'progress-tracker'
                }
                onClick={() =>
                  setActiveTab(
                    'progress-tracker'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'progress-tracker'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'progress-tracker'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'progress-tracker'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'progress-tracker'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <Activity
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Track Progress"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>


            {/* =============================================
                MODULE 2 FEATURE 4
                PAYMENT & INVOICE
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'payment'
                }
                onClick={() =>
                  setActiveTab(
                    'payment'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'payment'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'payment'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'payment'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'payment'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <CreditCard
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Payment & Invoice"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>


            {/* =============================================
                RATING & REVIEW
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'rating-review'
                }
                onClick={() =>
                  setActiveTab(
                    'rating-review'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'rating-review'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'rating-review'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'rating-review'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'rating-review'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <Star
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Rating & Review"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>

          </>

        ) : (

          <>
            {/* =============================================
                TECHNICIAN JOB REQUESTS
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'tech-dashboard'
                }
                onClick={() =>
                  setActiveTab(
                    'tech-dashboard'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'tech-dashboard'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'tech-dashboard'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'tech-dashboard'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'tech-dashboard'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <ClipboardList
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Job Requests"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>


            {/* =============================================
                TECHNICIAN AVAILABILITY
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'tech-availability'
                }
                onClick={() =>
                  setActiveTab(
                    'tech-availability'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'tech-availability'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'tech-availability'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'tech-availability'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'tech-availability'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <Sliders
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Availability Config"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>


            {/* =============================================
                TECHNICIAN STATUS TRACKER
            ============================================= */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'progress-tracker'
                }
                onClick={() =>
                  setActiveTab(
                    'progress-tracker'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'progress-tracker'
                      ? '#FFFFFF'
                      : '#94A3B8',

                  backgroundColor:
                    activeTab ===
                    'progress-tracker'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'progress-tracker'
                      ? '4px solid #00A8FF'
                      : '4px solid transparent',

                  '&:hover': {
                    backgroundColor:
                      '#172036'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,

                    color:
                      activeTab ===
                      'progress-tracker'
                        ? '#00A8FF'
                        : '#94A3B8'
                  }}
                >
                  <Activity
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Status Tracker"
                  primaryTypographyProps={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>

          </>
        )}

      </List>


      {/* =================================================
          LOGOUT
      ================================================= */}

      <Box
        sx={{
          mt: 'auto',
          pt: 2
        }}
      >
        <Button
          fullWidth
          onClick={onLogout}
          startIcon={
            <LogOut size={18} />
          }
          sx={{
            color: '#EF4444',

            backgroundColor:
              'rgba(239, 68, 68, 0.1)',

            border:
              '1px solid rgba(239, 68, 68, 0.3)',

            py: 1,

            fontWeight: 700,

            '&:hover': {
              backgroundColor:
                'rgba(239, 68, 68, 0.2)'
            }
          }}
        >
          Sign Out
        </Button>
      </Box>

    </Box>
  );
};