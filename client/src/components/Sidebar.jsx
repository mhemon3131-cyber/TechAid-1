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
  MapPinned,
  Star,
  Search,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Bot,
  History,
  Calculator
} from 'lucide-react';


export const Sidebar = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout
}) => {

  const isCustomer =
    currentUser?.role === 'CUSTOMER';


  // ========================================================
  // COMMON MENU BUTTON STYLE
  // ========================================================

  const menuStyle =
    (tab) => ({
      borderRadius: 2,

      color:
        activeTab === tab
          ? '#FFFFFF'
          : '#94A3B8',

      backgroundColor:
        activeTab === tab
          ? '#172036'
          : 'transparent',

      borderLeft:
        activeTab === tab
          ? '4px solid #00A8FF'
          : '4px solid transparent',

      '&:hover': {
        backgroundColor:
          '#172036'
      }
    });


  const menuIconStyle =
    (tab) => ({
      minWidth: 34,

      color:
        activeTab === tab
          ? '#00A8FF'
          : '#94A3B8'
    });


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
          BRAND HEADER + NOTIFICATION
      ================================================= */}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}
      >

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
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


        <NotificationBell
          currentUser={
            currentUser
          }
        />

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

      <List
        disablePadding
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pr: 0.5
        }}
      >

        {isCustomer ? (

          <>

            {/* NEW REQUEST */}

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
                sx={
                  menuStyle(
                    'new-request'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'new-request'
                    )
                  }
                >
                  <PlusCircle
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="New Request"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* AUTO ASSIGNMENT */}

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
                sx={
                  menuStyle(
                    'technician-assignment'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'technician-assignment'
                    )
                  }
                >
                  <MapPinned
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Auto Assignment"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* LIVE CHAT */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'chat'
                }
                onClick={() =>
                  setActiveTab(
                    'chat'
                  )
                }
                sx={
                  menuStyle(
                    'chat'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'chat'
                    )
                  }
                >
                  <MessageSquare
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Live Chat & Calls"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* ADVANCED SEARCH */}

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
                sx={
                  menuStyle(
                    'technician-search'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'technician-search'
                    )
                  }
                >
                  <Search
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Advanced Search"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* BOOK APPOINTMENT */}

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
                sx={
                  menuStyle(
                    'appointments'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'appointments'
                    )
                  }
                >
                  <Calendar
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Book Appointment"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* TRACK PROGRESS */}

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
                sx={
                  menuStyle(
                    'progress-tracker'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'progress-tracker'
                    )
                  }
                >
                  <Activity
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Track Progress"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* PAYMENT */}

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
                sx={
                  menuStyle(
                    'payment'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'payment'
                    )
                  }
                >
                  <CreditCard
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Payment & Invoice"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* RATING */}

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
                sx={
                  menuStyle(
                    'rating-review'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'rating-review'
                    )
                  }
                >
                  <Star
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Rating & Review"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* AI ISSUE CLASSIFIER */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'ai-classify'
                }
                onClick={() =>
                  setActiveTab(
                    'ai-classify'
                  )
                }
                sx={
                  menuStyle(
                    'ai-classify'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'ai-classify'
                    )
                  }
                >
                  <Sparkles
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="AI Issue Classifier"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* AI TROUBLESHOOT */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'ai-troubleshoot'
                }
                onClick={() =>
                  setActiveTab(
                    'ai-troubleshoot'
                  )
                }
                sx={
                  menuStyle(
                    'ai-troubleshoot'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'ai-troubleshoot'
                    )
                  }
                >
                  <Bot
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="AI Troubleshoot"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* RESOLUTION HISTORY */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'resolution-history'
                }
                onClick={() =>
                  setActiveTab(
                    'resolution-history'
                  )
                }
                sx={
                  menuStyle(
                    'resolution-history'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'resolution-history'
                    )
                  }
                >
                  <History
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Resolution History"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* COST ESTIMATOR */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'cost-estimate'
                }
                onClick={() =>
                  setActiveTab(
                    'cost-estimate'
                  )
                }
                sx={
                  menuStyle(
                    'cost-estimate'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'cost-estimate'
                    )
                  }
                >
                  <Calculator
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Cost Estimator"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>

          </>

        ) : (

          <>

            {/* TECHNICIAN JOB REQUESTS */}

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
                sx={
                  menuStyle(
                    'tech-dashboard'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'tech-dashboard'
                    )
                  }
                >
                  <ClipboardList
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Job Requests"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* EMERGENCY QUEUE */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'emergency-queue'
                }
                onClick={() =>
                  setActiveTab(
                    'emergency-queue'
                  )
                }
                sx={{
                  borderRadius: 2,

                  color:
                    activeTab ===
                    'emergency-queue'
                      ? '#FFFFFF'
                      : '#EF4444',

                  backgroundColor:
                    activeTab ===
                    'emergency-queue'
                      ? '#172036'
                      : 'transparent',

                  borderLeft:
                    activeTab ===
                    'emergency-queue'
                      ? '4px solid #EF4444'
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
                    color: '#EF4444'
                  }}
                >
                  <AlertTriangle
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Emergency Queue"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* LIVE CHAT */}

            <ListItem
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={
                  activeTab ===
                  'chat'
                }
                onClick={() =>
                  setActiveTab(
                    'chat'
                  )
                }
                sx={
                  menuStyle(
                    'chat'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'chat'
                    )
                  }
                >
                  <MessageSquare
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Live Chat & Calls"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* AVAILABILITY */}

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
                sx={
                  menuStyle(
                    'tech-availability'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'tech-availability'
                    )
                  }
                >
                  <Sliders
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Availability Config"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                />

              </ListItemButton>
            </ListItem>


            {/* STATUS TRACKER */}

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
                sx={
                  menuStyle(
                    'progress-tracker'
                  )
                }
              >

                <ListItemIcon
                  sx={
                    menuIconStyle(
                      'progress-tracker'
                    )
                  }
                >
                  <Activity
                    size={18}
                  />
                </ListItemIcon>

                <ListItemText
                  primary="Status Tracker"
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
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
          pt: 2
        }}
      >

        <Button
          fullWidth
          onClick={
            onLogout
          }
          startIcon={
            <LogOut
              size={18}
            />
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