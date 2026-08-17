import React, { useState } from 'react';

import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  CircularProgress,
  TextField,
  Alert,
  Divider,
  Avatar
} from '@mui/material';

import { styled } from '@mui/material/styles';

import {
  Clock,
  UserCheck,
  CheckCircle2,
  Wrench,
  Navigation,
  CheckCheck,
  Search,
  Star
} from 'lucide-react';

import axios from 'axios';


// ======================================================
// CUSTOM STEPPER CONNECTOR
// ======================================================

const ColorlibConnector = styled(StepConnector)(() => ({
  '& .MuiStepConnector-line': {
    height: 4,
    border: 0,
    backgroundColor: '#2A364F',
    borderRadius: 1
  },

  '&.Mui-active .MuiStepConnector-line': {
    backgroundColor: '#00A8FF'
  },

  '&.Mui-completed .MuiStepConnector-line': {
    backgroundColor: '#10B981'
  }
}));


// ======================================================
// SERVICE PROGRESS TRACKER
// ======================================================

export const ServiceProgressTracker = ({
  currentUser,
  onNavigateToReview
}) => {

  // ====================================================
  // CHANGED:
  // Page open hole tracking ID blank thakbe.
  // ====================================================

  const [trackingIdInput, setTrackingIdInput] =
    useState('');

  const [progressData, setProgressData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState('');

  const [msg, setMsg] =
    useState('');


  // ======================================================
  // SERVICE STATUS STAGES
  // ======================================================

  const stagesList = [
    {
      key: 'PENDING',
      label: 'Pending',
      icon: <Clock size={18} />
    },
    {
      key: 'ASSIGNED',
      label: 'Assigned',
      icon: <UserCheck size={18} />
    },
    {
      key: 'ACCEPTED',
      label: 'Accepted',
      icon: <CheckCircle2 size={18} />
    },
    {
      key: 'IN_PROGRESS',
      label: 'In Progress',
      icon: <Wrench size={18} />
    },
    {
      key: 'ON_THE_WAY',
      label: 'On the Way',
      icon: <Navigation size={18} />
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      icon: <CheckCheck size={18} />
    }
  ];


  // ======================================================
  // FETCH SERVICE PROGRESS
  //
  // Tracking ID dilei only data show korbe.
  // ======================================================

  const fetchProgress = async (idToFetch) => {

    const cleanId =
      String(idToFetch || '')
        .trim();


    if (!cleanId) {

      setProgressData(null);

      setError(
        'Please enter a tracking ID.'
      );

      return;
    }


    setLoading(true);

    setError('');

    setMsg('');

    setProgressData(null);


    try {

      const res =
        await axios.get(
          `http://localhost:5000/api/requests/${cleanId}/progress`
        );


      if (res.data.success) {

        setProgressData(
          res.data.data
        );

      } else {

        setProgressData(null);

        setError(
          res.data.message ||
          'Could not load service progress.'
        );
      }


    } catch (err) {

      // ==================================================
      // CHANGED:
      //
      // Fake ON_THE_WAY fallback removed.
      //
      // Backend-e request na thakle actual error show.
      // ==================================================

      console.error(
        'Progress load error:',
        err
      );


      setProgressData(null);


      setError(
        err?.response?.data?.message ||
        'Service request not found. Please check the tracking ID.'
      );


    } finally {

      setLoading(false);

    }
  };


  // ======================================================
  // UPDATE SERVICE STATUS
  // ======================================================

  const handleUpdateStatus =
    async (nextStatus) => {

      if (!progressData) {
        return;
      }


      setUpdating(true);

      setMsg('');

      setError('');


      try {

        const res =
          await axios.put(
            `http://localhost:5000/api/requests/${progressData.trackingId}/status`,
            {
              status:
                nextStatus,

              note:
                `Technician updated stage to ${nextStatus}.`
            }
          );


        if (
          res.data.success
        ) {

          setMsg(
            `Service progress stage updated to ${nextStatus}.`
          );


          // ================================================
          // IMPORTANT:
          // Backend success-er por abar DB theke progress
          // load kori.
          //
          // Fake local status banai na.
          // ================================================

          await fetchProgress(
            progressData.trackingId
          );
        }


      } catch (err) {

        console.error(
          'Status update error:',
          err
        );


        setError(
          err?.response?.data?.message ||
          'Could not update service progress.'
        );


      } finally {

        setUpdating(false);
      }
    };


  // ======================================================
  // MODULE 3 FEATURE 4
  // GO TO RATING & REVIEW
  // ======================================================

  const handleRateAndReview = () => {

    if (!progressData) {
      return;
    }


    localStorage.setItem(
      'techaid_review_tracking_id',
      progressData.trackingId
    );


    if (onNavigateToReview) {

      onNavigateToReview();

    }
  };


  // ======================================================
  // UI
  // ======================================================

  return (

    <Box
      sx={{
        flexGrow: 1,
        p: 4,
        backgroundColor:
          '#0D1527',
        minHeight:
          '100vh',
        overflowY:
          'auto'
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <Box sx={{ mb: 4 }}>

        <Typography
          variant="h5"
          sx={{
            color:
              '#FFF',
            fontWeight:
              700
          }}
        >
          Service Progress Tracking System
        </Typography>


        <Typography
          variant="body2"
          sx={{
            color:
              '#94A3B8'
          }}
        >
          Real-time lifecycle monitoring:
          Pending ➔ Assigned ➔ Accepted ➔
          In Progress ➔ On the Way ➔ Completed
        </Typography>

      </Box>


      {/* =================================================
          SEARCH
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          p: 2.5,

          backgroundColor:
            '#172036',

          borderRadius:
            3,

          border:
            '1px solid #2A364F',

          maxWidth:
            900,

          mb:
            4,

          display:
            'flex',

          gap:
            2,

          alignItems:
            'center'
        }}
      >

        <TextField
          fullWidth
          size="small"
          placeholder="Enter Unique Tracking ID (e.g. REQ-2026-8942)..."
          value={
            trackingIdInput
          }
          onChange={(e) => {

            setTrackingIdInput(
              e.target.value
            );


            // New ID type korle previous result hide
            setProgressData(
              null
            );


            setError(
              ''
            );


            setMsg(
              ''
            );
          }}
          onKeyDown={(e) => {

            if (
              e.key === 'Enter'
            ) {

              fetchProgress(
                trackingIdInput
              );
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root':
              {
                color:
                  '#FFF',

                backgroundColor:
                  '#0F172A',

                '& fieldset':
                  {
                    borderColor:
                      '#2A364F'
                  }
              }
          }}
        />


        <Button
          variant="contained"
          onClick={() =>
            fetchProgress(
              trackingIdInput
            )
          }
          disabled={
            loading
          }
          startIcon={
            loading
              ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                )
              : (
                  <Search
                    size={18}
                  />
                )
          }
          sx={{
            backgroundColor:
              '#00A8FF',

            color:
              '#0D1527',

            fontWeight:
              700,

            px:
              3,

            minWidth:
              150,

            '&:hover':
              {
                backgroundColor:
                  '#38BDF8'
              }
          }}
        >
          {
            loading
              ? 'Tracking...'
              : 'Track Request'
          }
        </Button>

      </Paper>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {msg && (

        <Alert
          severity="success"
          sx={{
            mb: 3,
            maxWidth: 900,
            backgroundColor:
              'rgba(16, 185, 129, 0.15)',
            color:
              '#10B981',
            border:
              '1px solid #10B981'
          }}
        >
          {msg}
        </Alert>

      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb: 3,
            maxWidth: 900,
            backgroundColor:
              'rgba(239, 68, 68, 0.15)',
            color:
              '#EF4444'
          }}
        >
          {error}
        </Alert>

      )}


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <Box
          sx={{
            maxWidth:
              900,

            display:
              'flex',

            justifyContent:
              'center',

            py:
              4
          }}
        >

          <CircularProgress
            color="primary"
          />

        </Box>

      ) : progressData ? (

        <Grid
          container
          spacing={4}
          sx={{
            maxWidth:
              900
          }}
        >


          {/* ===============================================
              PROGRESS CARD
          =============================================== */}

          <Grid item xs={12}>

            <Paper
              elevation={0}
              sx={{
                backgroundColor:
                  '#172036',

                borderRadius:
                  3,

                p:
                  4,

                border:
                  '1px solid #2A364F'
              }}
            >

              <Box
                sx={{
                  display:
                    'flex',

                  justifyContent:
                    'space-between',

                  alignItems:
                    'center',

                  mb:
                    3
                }}
              >

                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        '#64748B'
                    }}
                  >
                    TRACKING NUMBER
                  </Typography>


                  <Typography
                    variant="h6"
                    sx={{
                      color:
                        '#00A8FF',

                      fontWeight:
                        700
                    }}
                  >
                    {
                      progressData.trackingId
                    }
                  </Typography>

                </Box>


                <Chip
                  label={
                    progressData.currentStatus
                  }
                  sx={{
                    backgroundColor:
                      progressData.currentStatus ===
                      'COMPLETED'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(0, 168, 255, 0.2)',

                    color:
                      progressData.currentStatus ===
                      'COMPLETED'
                        ? '#10B981'
                        : '#00A8FF',

                    fontWeight:
                      700,

                    fontSize:
                      '0.85rem'
                  }}
                />

              </Box>


              {/* ===========================================
                  STEPPER
              =========================================== */}

              <Box sx={{ my: 4 }}>

                <Stepper
                  activeStep={
                    progressData.currentStageIndex
                  }
                  connector={
                    <ColorlibConnector />
                  }
                  alternativeLabel
                >

                  {stagesList.map(
                    (stage, idx) => {

                      const isCompleted =
                        idx <
                        progressData.currentStageIndex;


                      const isActive =
                        idx ===
                        progressData.currentStageIndex;


                      return (

                        <Step
                          key={
                            stage.key
                          }
                        >

                          <StepLabel
                            StepIconComponent={() => (

                              <Avatar
                                sx={{
                                  width:
                                    42,

                                  height:
                                    42,

                                  backgroundColor:
                                    isCompleted
                                      ? '#10B981'
                                      : isActive
                                      ? '#00A8FF'
                                      : '#0F172A',

                                  color:
                                    isCompleted ||
                                    isActive
                                      ? '#0D1527'
                                      : '#94A3B8',

                                  border:
                                    isActive
                                      ? '3px solid #38BDF8'
                                      : '1px solid #2A364F',

                                  boxShadow:
                                    isActive
                                      ? '0 0 12px rgba(0, 168, 255, 0.5)'
                                      : 'none'
                                }}
                              >
                                {
                                  stage.icon
                                }
                              </Avatar>

                            )}
                          >

                            <Typography
                              variant="caption"
                              sx={{
                                color:
                                  isActive
                                    ? '#00A8FF'
                                    : isCompleted
                                    ? '#10B981'
                                    : '#94A3B8',

                                fontWeight:
                                  isActive
                                    ? 700
                                    : 500,

                                display:
                                  'block',

                                mt:
                                  0.5
                              }}
                            >
                              {
                                stage.label
                              }
                            </Typography>

                          </StepLabel>

                        </Step>

                      );
                    }
                  )}

                </Stepper>

              </Box>


              <Divider
                sx={{
                  borderColor:
                    '#2A364F',
                  my:
                    3
                }}
              />


              {/* ===========================================
                  STATUS CONTROLS
              =========================================== */}

              <Box
                sx={{
                  backgroundColor:
                    '#0F172A',

                  p:
                    2.5,

                  borderRadius:
                    2,

                  border:
                    '1px solid #2A364F'
                }}
              >

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#FFF',

                    fontWeight:
                      600,

                    mb:
                      1.5
                  }}
                >
                  Advance Progress Stage
                </Typography>


                <Box
                  sx={{
                    display:
                      'flex',

                    gap:
                      1,

                    flexWrap:
                      'wrap'
                  }}
                >

                  {stagesList.map(
                    (stg) => (

                      <Button
                        key={
                          stg.key
                        }

                        size="small"

                        disabled={
                          updating ||
                          progressData.currentStatus ===
                            stg.key
                        }

                        onClick={() =>
                          handleUpdateStatus(
                            stg.key
                          )
                        }

                        sx={{
                          backgroundColor:
                            progressData.currentStatus ===
                            stg.key
                              ? '#00A8FF'
                              : '#172036',

                          color:
                            progressData.currentStatus ===
                            stg.key
                              ? '#0D1527'
                              : '#94A3B8',

                          border:
                            '1px solid #2A364F',

                          fontWeight:
                            600,

                          fontSize:
                            '0.75rem',

                          '&:hover':
                            {
                              backgroundColor:
                                '#00A8FF',

                              color:
                                '#0D1527'
                            }
                        }}
                      >
                        Set {stg.label}
                      </Button>

                    )
                  )}

                </Box>

              </Box>


              {/* ===========================================
                  REVIEW BUTTON ONLY AFTER COMPLETED
              =========================================== */}

              {currentUser?.role ===
                'CUSTOMER' &&
                progressData.currentStatus ===
                  'COMPLETED' && (

                  <Box
                    sx={{
                      mt:
                        3,

                      p:
                        2.5,

                      borderRadius:
                        2,

                      backgroundColor:
                        'rgba(245, 158, 11, 0.08)',

                      border:
                        '1px solid rgba(245, 158, 11, 0.35)'
                    }}
                  >

                    <Typography
                      variant="subtitle1"
                      sx={{
                        color:
                          '#FFFFFF',

                        fontWeight:
                          700
                      }}
                    >
                      Service Completed
                    </Typography>


                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          '#94A3B8',

                        mt:
                          0.5,

                        mb:
                          2
                      }}
                    >
                      Your service is complete.
                      You can now rate and review
                      your technician.
                    </Typography>


                    <Button
                      variant="contained"
                      startIcon={
                        <Star size={18} />
                      }
                      onClick={
                        handleRateAndReview
                      }
                      sx={{
                        backgroundColor:
                          '#F59E0B',

                        color:
                          '#0D1527',

                        fontWeight:
                          800,

                        '&:hover':
                          {
                            backgroundColor:
                              '#FBBF24'
                          }
                      }}
                    >
                      Rate & Review Technician
                    </Button>

                  </Box>

                )}

            </Paper>

          </Grid>


          {/* ===============================================
              HISTORY LOGS
          =============================================== */}

          <Grid item xs={12}>

            <Paper
              elevation={0}
              sx={{
                backgroundColor:
                  '#172036',

                borderRadius:
                  3,

                p:
                  3,

                border:
                  '1px solid #2A364F'
              }}
            >

              <Typography
                variant="subtitle1"
                sx={{
                  color:
                    '#FFF',

                  fontWeight:
                    700,

                  mb:
                    2
                }}
              >
                Service Lifecycle History Logs
              </Typography>


              <Box
                sx={{
                  display:
                    'flex',

                  flexDirection:
                    'column',

                  gap:
                    2
                }}
              >

                {(progressData.logs || []).map(
                  (log, i) => {

                    const logDate =
                      log.createdAt ||
                      log.timestamp;


                    return (

                      <Box
                        key={
                          log.id ||
                          `${log.status}-${i}`
                        }
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            2,

                          p:
                            1.5,

                          backgroundColor:
                            '#0F172A',

                          borderRadius:
                            2,

                          borderLeft:
                            '4px solid #00A8FF'
                        }}
                      >

                        <CheckCircle2
                          size={20}
                          color="#00A8FF"
                        />


                        <Box
                          sx={{
                            flexGrow:
                              1
                          }}
                        >

                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                '#FFF',

                              fontWeight:
                                600
                            }}
                          >
                            Stage: {log.status}
                          </Typography>


                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                '#94A3B8'
                            }}
                          >
                            {log.note}
                          </Typography>

                        </Box>


                        {logDate && (

                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                '#64748B'
                            }}
                          >
                            {
                              new Date(
                                logDate
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour:
                                    '2-digit',

                                  minute:
                                    '2-digit'
                                }
                              )
                            }
                          </Typography>

                        )}

                      </Box>

                    );
                  }
                )}

              </Box>

            </Paper>

          </Grid>

        </Grid>

      ) : null}

    </Box>
  );
};