import React, {
  useEffect,
  useState
} from 'react';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Typography
} from '@mui/material';

import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  User,
  X
} from 'lucide-react';

import axios from 'axios';

import {
  getTechnicianAutomaticJobs
} from '../services/assignmentApi';


// ==========================================================
// TECHNICIAN JOB REQUEST MANAGEMENT
//
// Existing group appointment feature + Member 4 automatic
// assignment jobs ek page-e show korbe.
//
// Automatic flow:
//
// Customer service request
//      ↓
// Best technician auto suggested
//      ↓
// Customer accepts
//      ↓
// Appointment created
//      ↓
// Ei Technician Job Requests page-e show
//      ↓
// Customer name / email / phone / issue / location /
// date / time / service method shob visible
// ==========================================================

export const TechnicianDashboard = ({
  currentUser
}) => {

  // ========================================================
  // EXISTING APPOINTMENTS
  // ========================================================

  const [
    appointments,
    setAppointments
  ] = useState([]);


  // ========================================================
  // MEMBER 4 AUTO-ASSIGNED ACCEPTED JOBS
  // ========================================================

  const [
    automaticJobs,
    setAutomaticJobs
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    msg,
    setMsg
  ] = useState('');


  const [
    error,
    setError
  ] = useState('');


  // ========================================================
  // RESCHEDULE MODAL
  // EXISTING FEATURE
  // ========================================================

  const [
    rescheduleTarget,
    setRescheduleTarget
  ] = useState(null);


  const [
    newSelectedDate,
    setNewSelectedDate
  ] = useState('Mon 13');


  const [
    newTimeSlot,
    setNewTimeSlot
  ] = useState(
    '02:30 pm'
  );


  const dateOptions = [
    {
      day: 'Sun',
      dateNum: '12'
    },
    {
      day: 'Mon',
      dateNum: '13'
    },
    {
      day: 'Tue',
      dateNum: '14'
    },
    {
      day: 'Wed',
      dateNum: '15'
    },
    {
      day: 'Thu',
      dateNum: '16'
    }
  ];


  const timeSlots = [
    '10:00 am',
    '11:30 am',
    '1:00 pm',
    '02:30 pm',
    '04:00 pm',
    '06:30 pm'
  ];


  // ========================================================
  // LOAD DATA WHEN TECHNICIAN CHANGES
  // ========================================================

  useEffect(() => {

    if (
      currentUser?.technicianId
    ) {

      fetchData();
    }

  }, [
    currentUser
  ]);


  // ========================================================
  // FETCH BOTH TYPES OF JOB DATA
  //
  // 1. Existing Appointment Module data
  // 2. Member 4 accepted automatic assignments
  // ========================================================

  const fetchData =
    async () => {

      const technicianId =
        currentUser?.technicianId;


      if (!technicianId) {

        setError(
          'Technician profile ID is missing. Please log in again using your technician account.'
        );

        return;
      }


      setLoading(true);

      setError('');


      try {

        // ==================================================
        // EXISTING GROUP APPOINTMENTS
        // ==================================================

        try {

          const appointmentResponse =
            await axios.get(
              `http://localhost:5000/api/appointments?technicianId=${technicianId}`
            );


          if (
            appointmentResponse.data
              .success
          ) {

            setAppointments(
              appointmentResponse.data
                .data || []
            );
          }


        } catch (appointmentError) {

          console.error(
            'Failed to load existing appointments:',
            appointmentError
          );


          setAppointments([]);
        }


        // ==================================================
        // MEMBER 4 AUTOMATIC ACCEPTED JOBS
        // ==================================================

        try {

          const automaticResponse =
            await getTechnicianAutomaticJobs(
              technicianId
            );


          if (
            automaticResponse?.success
          ) {

            setAutomaticJobs(
              automaticResponse.data ||
              []
            );
          }


        } catch (automaticError) {

          console.error(
            'Failed to load automatic technician jobs:',
            automaticError
          );


          setAutomaticJobs([]);
        }


      } finally {

        setLoading(false);
      }
    };


  // ========================================================
  // EXISTING APPOINTMENT STATUS UPDATE
  // ========================================================

  const handleStatusUpdate =
    async (
      id,
      status,
      extraData = {}
    ) => {

      setLoading(true);

      setMsg('');

      setError('');


      try {

        const response =
          await axios.put(
            `http://localhost:5000/api/appointments/${id}/status`,
            {
              status,
              ...extraData
            }
          );


        if (
          response.data.success
        ) {

          setMsg(
            `Appointment ${status
              .toLowerCase()
              .replace(
                '_',
                ' '
              )} successfully.`
          );


          await fetchData();
        }


      } catch (err) {

        setError(
          err?.response?.data
            ?.message ||
          'Failed to update appointment status.'
        );


      } finally {

        setLoading(false);

        setRescheduleTarget(
          null
        );
      }
    };


  // ========================================================
  // RESCHEDULE CONFIRM
  // EXISTING GROUP FEATURE
  // ========================================================

  const handleConfirmReschedule =
    () => {

      if (
        !rescheduleTarget
      ) {
        return;
      }


      const formattedDate =
        `Mon Jul ${
          newSelectedDate.split(
            ' '
          )[1]
        }, 2026`;


      handleStatusUpdate(
        rescheduleTarget.id,
        'RESCHEDULED',
        {
          newDate:
            formattedDate,

          newTimeSlot:
            newTimeSlot
        }
      );
    };


  // ========================================================
  // AUTO JOB -> APPOINTMENT ID
  //
  // Customer automatic technician accept korle backend
  // Appointment create kore.
  //
  // Ei helper appointment status actions-e oi ID use korbe.
  // ========================================================

  const getAutoJobAppointmentId =
    (job) => {

      return (
        job?.appointment?.id ||
        null
      );
    };


  // ========================================================
  // DISPLAY LOCATION
  // ========================================================

  const getLocationText =
    (location) => {

      if (
        !location
      ) {

        return 'Location not provided';
      }


      if (
        location.address
      ) {

        return location.address;
      }


      if (
        location.latitude !==
          undefined &&
        location.longitude !==
          undefined
      ) {

        return `${Number(
          location.latitude
        ).toFixed(
          5
        )}, ${Number(
          location.longitude
        ).toFixed(
          5
        )}`;
      }


      return 'Location not provided';
    };


  // ========================================================
  // STATUS CHIP STYLE
  // ========================================================

  const getStatusStyle =
    (status) => {

      if (
        status === 'APPROVED' ||
        status === 'ACCEPTED'
      ) {

        return {
          backgroundColor:
            'rgba(16, 185, 129, 0.2)',

          color:
            '#10B981'
        };
      }


      if (
        status === 'REJECTED'
      ) {

        return {
          backgroundColor:
            'rgba(239, 68, 68, 0.2)',

          color:
            '#EF4444'
        };
      }


      if (
        status === 'RESCHEDULED'
      ) {

        return {
          backgroundColor:
            'rgba(59, 130, 246, 0.2)',

          color:
            '#60A5FA'
        };
      }


      return {
        backgroundColor:
          'rgba(245, 158, 11, 0.2)',

        color:
          '#F59E0B'
      };
    };


  // ========================================================
  // REMOVE DUPLICATE EXISTING APPOINTMENTS
  //
  // Automatic accepted assignment creates an Appointment.
  //
  // Tai same job:
  // - automaticJobs-e ache
  // - appointments-eo ache
  //
  // Customer full details-er automatic card-ta retain korbo,
  // duplicate basic appointment card hide korbo.
  // ========================================================

  const automaticAppointmentIds =
    new Set(
      automaticJobs
        .map(
          (job) =>
            job?.appointment?.id
        )
        .filter(Boolean)
    );


  const normalAppointments =
    appointments.filter(
      (appointment) =>
        !automaticAppointmentIds.has(
          appointment.id
        )
    );


  const totalJobs =
    automaticJobs.length +
    normalAppointments.length;


  // ========================================================
  // UI
  // ========================================================

  return (

    <Box
      sx={{
        flexGrow:
          1,

        p:
          4,

        backgroundColor:
          '#0D1527',

        minHeight:
          '100vh',

        overflowY:
          'auto'
      }}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <Box
        sx={{
          mb:
            4
        }}
      >

        <Typography
          variant="h5"
          sx={{
            color:
              '#FFF',

            fontWeight:
              700
          }}
        >
          Job Requests Management
        </Typography>


        <Typography
          variant="body2"
          sx={{
            color:
              '#94A3B8',

            mt:
              0.5
          }}
        >
          Logged in as Technician:{' '}

          <strong
            style={{
              color:
                '#00A8FF'
            }}
          >
            {
              currentUser?.name ||
              'Technician'
            }
          </strong>

          {' • '}

          {
            currentUser
              ?.specialty ||
            'Technical Specialist'
          }
        </Typography>


        <Typography
          variant="caption"
          sx={{
            color:
              '#64748B'
          }}
        >
          Accepted automatic assignments and regular appointments appear here.
        </Typography>

      </Box>


      {/* ===================================================
          SUCCESS
      =================================================== */}

      {msg && (

        <Alert
          severity="success"
          sx={{
            mb:
              3,

            backgroundColor:
              'rgba(16,185,129,0.12)',

            color:
              '#10B981',

            border:
              '1px solid rgba(16,185,129,0.35)'
          }}
        >
          {msg}
        </Alert>

      )}


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb:
              3
          }}
        >
          {error}
        </Alert>

      )}


      {/* ===================================================
          JOB COUNTER
      =================================================== */}

      {!loading && (

        <Box
          sx={{
            mb:
              2
          }}
        >

          <Chip
            label={`${totalJobs} Job Request${
              totalJobs === 1
                ? ''
                : 's'
            }`}
            sx={{
              backgroundColor:
                'rgba(0,168,255,0.12)',

              color:
                '#00A8FF',

              fontWeight:
                700
            }}
          />

        </Box>

      )}


      {/* ===================================================
          LOADING
      =================================================== */}

      {loading ? (

        <Box
          sx={{
            display:
              'flex',

            alignItems:
              'center',

            gap:
              1.5
          }}
        >

          <CircularProgress
            size={28}
          />


          <Typography
            sx={{
              color:
                '#94A3B8'
            }}
          >
            Loading job requests...
          </Typography>

        </Box>

      ) : totalJobs === 0 ? (

        /* =================================================
           EMPTY
        ================================================= */

        <Paper
          elevation={0}
          sx={{
            p:
              4,

            backgroundColor:
              '#172036',

            borderRadius:
              3,

            border:
              '1px solid #2A364F',

            textAlign:
              'center'
          }}
        >

          <AlertCircle
            size={48}
            color="#94A3B8"
            style={{
              margin:
                '0 auto 12px auto',

              display:
                'block'
            }}
          />


          <Typography
            variant="h6"
            sx={{
              color:
                '#FFF',

              fontWeight:
                600
            }}
          >
            No incoming job requests for {
              currentUser?.name ||
              'this technician'
            }
          </Typography>


          <Typography
            variant="body2"
            sx={{
              color:
                '#94A3B8'
            }}
          >
            When a customer accepts your automatic technician assignment or books an appointment with you, the job will appear here.
          </Typography>

        </Paper>

      ) : (

        <Grid
          container
          spacing={3}
          sx={{
            maxWidth:
              1000
          }}
        >

          {/* =================================================
              MEMBER 4 AUTOMATIC ACCEPTED JOBS
          ================================================= */}

          {automaticJobs.map(
            (job) => {

              const customer =
                job.customer ||
                {};


              const request =
                job.serviceRequest ||
                {};


              const schedule =
                job.schedule ||
                {};


              const appointment =
                job.appointment ||
                {};


              const displayStatus =
                appointment.status ||
                job.assignmentStatus ||
                'ACCEPTED';


              const statusStyle =
                getStatusStyle(
                  displayStatus
                );


              const appointmentId =
                getAutoJobAppointmentId(
                  job
                );


              return (

                <Grid
                  item
                  xs={12}
                  key={
                    job.assignmentId
                  }
                >

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
                        '1px solid #10B981'
                    }}
                  >

                    {/* =======================================
                        TOP
                    ======================================= */}

                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'flex-start',

                        justifyContent:
                          'space-between',

                        gap:
                          2,

                        flexWrap:
                          'wrap',

                        mb:
                          2
                      }}
                    >

                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            2
                        }}
                      >

                        <Avatar
                          sx={{
                            backgroundColor:
                              '#00A8FF',

                            color:
                              '#0D1527',

                            fontWeight:
                              700
                          }}
                        >
                          {
                            customer.name
                              ? customer.name
                                  .slice(
                                    0,
                                    2
                                  )
                                  .toUpperCase()
                              : 'CU'
                          }
                        </Avatar>


                        <Box>

                          <Typography
                            variant="subtitle1"
                            sx={{
                              color:
                                '#FFF',

                              fontWeight:
                                700
                            }}
                          >
                            {
                              customer.name ||
                              'Customer'
                            }
                          </Typography>


                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                '#00A8FF',

                              fontWeight:
                                600
                            }}
                          >
                            {
                              request.title ||
                              `${request.deviceCategory || 'Technical'} Support`
                            }
                          </Typography>


                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                '#10B981',

                              fontWeight:
                                700
                            }}
                          >
                            ✓ CUSTOMER ACCEPTED YOUR AUTOMATIC ASSIGNMENT
                          </Typography>

                        </Box>

                      </Box>


                      <Chip
                        label={
                          displayStatus
                        }
                        size="small"
                        sx={{
                          ...statusStyle,

                          fontWeight:
                            700
                        }}
                      />

                    </Box>


                    {/* =======================================
                        CUSTOMER CONTACT
                    ======================================= */}

                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor:
                          '#0F172A',

                        p:
                          2,

                        borderRadius:
                          2,

                        border:
                          '1px solid #2A364F',

                        mb:
                          2
                      }}
                    >

                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B',

                          fontWeight:
                            700
                        }}
                      >
                        CUSTOMER CONTACT INFORMATION
                      </Typography>


                      <Grid
                        container
                        spacing={2}
                        sx={{
                          mt:
                            0
                        }}
                      >

                        <Grid
                          item
                          xs={12}
                          md={4}
                        >

                          <Box
                            sx={{
                              display:
                                'flex',

                              alignItems:
                                'center',

                              gap:
                                1
                            }}
                          >

                            <User
                              size={16}
                              color="#00A8FF"
                            />


                            <Box>

                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    '#64748B'
                                }}
                              >
                                Customer
                              </Typography>


                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    '#FFF',

                                  fontWeight:
                                    600
                                }}
                              >
                                {
                                  customer.name ||
                                  'N/A'
                                }
                              </Typography>

                            </Box>

                          </Box>

                        </Grid>


                        <Grid
                          item
                          xs={12}
                          md={4}
                        >

                          <Box
                            sx={{
                              display:
                                'flex',

                              alignItems:
                                'center',

                              gap:
                                1
                            }}
                          >

                            <Phone
                              size={16}
                              color="#10B981"
                            />


                            <Box>

                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    '#64748B'
                                }}
                              >
                                Phone
                              </Typography>


                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    '#FFF',

                                  fontWeight:
                                    600
                                }}
                              >
                                {
                                  customer.phone ||
                                  'Not provided'
                                }
                              </Typography>

                            </Box>

                          </Box>

                        </Grid>


                        <Grid
                          item
                          xs={12}
                          md={4}
                        >

                          <Box
                            sx={{
                              display:
                                'flex',

                              alignItems:
                                'center',

                              gap:
                                1
                            }}
                          >

                            <Mail
                              size={16}
                              color="#38BDF8"
                            />


                            <Box>

                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    '#64748B'
                                }}
                              >
                                Email
                              </Typography>


                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    '#FFF',

                                  fontWeight:
                                    600
                                }}
                              >
                                {
                                  customer.email ||
                                  'Not provided'
                                }
                              </Typography>

                            </Box>

                          </Box>

                        </Grid>

                      </Grid>

                    </Paper>


                    {/* =======================================
                        ISSUE
                    ======================================= */}

                    <Box
                      sx={{
                        backgroundColor:
                          '#0F172A',

                        p:
                          2,

                        borderRadius:
                          2,

                        mb:
                          2.5,

                        border:
                          '1px solid #2A364F'
                      }}
                    >

                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B',

                          display:
                            'block',

                          mb:
                            0.5
                        }}
                      >
                        CUSTOMER ISSUE DESCRIPTION
                      </Typography>


                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            '#E2E8F0',

                          lineHeight:
                            1.6
                        }}
                      >
                        {
                          request.description ||
                          'Customer submitted issue for diagnosis.'
                        }
                      </Typography>

                    </Box>


                    {/* =======================================
                        REQUEST INFO
                    ======================================= */}

                    <Box
                      sx={{
                        display:
                          'flex',

                        gap:
                          1,

                        flexWrap:
                          'wrap',

                        mb:
                          2.5
                      }}
                    >

                      <Chip
                        size="small"
                        label={
                          request.deviceCategory ||
                          'Device'
                        }
                        sx={{
                          backgroundColor:
                            'rgba(0,168,255,0.15)',

                          color:
                            '#00A8FF'
                        }}
                      />


                      <Chip
                        size="small"
                        label={
                          request.urgency ||
                          'Normal'
                        }
                        sx={{
                          backgroundColor:
                            request.urgency ===
                            'Critical'
                              ? 'rgba(239,68,68,.15)'
                              : 'rgba(245,158,11,.15)',

                          color:
                            request.urgency ===
                            'Critical'
                              ? '#EF4444'
                              : '#F59E0B'
                        }}
                      />


                      <Chip
                        size="small"
                        label={
                          request.serviceMethod ||
                          'Service'
                        }
                        sx={{
                          backgroundColor:
                            '#0F172A',

                          color:
                            '#38BDF8'
                        }}
                      />

                    </Box>


                    {/* =======================================
                        DATE / TIME / LOCATION
                    ======================================= */}

                    <Box
                      sx={{
                        display:
                          'flex',

                        gap:
                          3,

                        mb:
                          3,

                        flexWrap:
                          'wrap'
                      }}
                    >

                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            1
                        }}
                      >

                        <Calendar
                          size={16}
                          color="#00A8FF"
                        />


                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              '#E2E8F0',

                            fontWeight:
                              600
                          }}
                        >
                          {
                            schedule.date ||
                            appointment.date ||
                            'Date unavailable'
                          }
                        </Typography>

                      </Box>


                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            1
                        }}
                      >

                        <Clock
                          size={16}
                          color="#00A8FF"
                        />


                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              '#E2E8F0',

                            fontWeight:
                              600
                          }}
                        >
                          {
                            schedule.timeSlot ||
                            appointment.timeSlot ||
                            'Time unavailable'
                          }
                        </Typography>

                      </Box>


                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'flex-start',

                          gap:
                            1,

                          maxWidth:
                            500
                        }}
                      >

                        <MapPin
                          size={16}
                          color="#10B981"
                          style={{
                            marginTop:
                              2,

                            flexShrink:
                              0
                          }}
                        />


                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              '#94A3B8'
                          }}
                        >
                          {
                            getLocationText(
                              job.location
                            )
                          }
                        </Typography>

                      </Box>

                    </Box>


                    {/* =======================================
                        AUTO ASSIGNED SLOT NOTICE
                    ======================================= */}

                    <Alert
                      severity="info"
                      sx={{
                        mb:
                          2.5,

                        backgroundColor:
                          'rgba(0,168,255,.08)',

                        color:
                          '#38BDF8'
                      }}
                    >
                      This date and time were automatically selected from your available schedule. The confirmed slot is reserved for this customer.
                    </Alert>


                    {/* =======================================
                        ACTIONS
                    ======================================= */}

                    {appointmentId && (

                      <Box
                        sx={{
                          display:
                            'flex',

                          gap:
                            2,

                          justifyContent:
                            'flex-end',

                          flexWrap:
                            'wrap'
                        }}
                      >

                        {/* RESCHEDULE */}

                        <Button
                          onClick={() =>
                            setRescheduleTarget({
                              ...appointment,

                              id:
                                appointmentId,

                              customerName:
                                customer.name
                            })
                          }
                          startIcon={
                            <RefreshCw
                              size={16}
                            />
                          }
                          sx={{
                            color:
                              '#94A3B8',

                            backgroundColor:
                              '#0F172A',

                            border:
                              '1px solid #2A364F',

                            px:
                              2.5,

                            '&:hover':
                              {
                                backgroundColor:
                                  '#1E293B'
                              }
                          }}
                        >
                          Reschedule
                        </Button>


                        {/* DECLINE */}

                        <Button
                          onClick={() =>
                            handleStatusUpdate(
                              appointmentId,
                              'REJECTED'
                            )
                          }
                          startIcon={
                            <X
                              size={16}
                            />
                          }
                          sx={{
                            color:
                              '#EF4444',

                            backgroundColor:
                              'rgba(239,68,68,.1)',

                            border:
                              '1px solid rgba(239,68,68,.3)',

                            px:
                              2.5
                          }}
                        >
                          Decline
                        </Button>


                        {/* Already customer accepted,
                            appointment backend-e APPROVED.
                            So redundant Accept button hide. */}

                        {displayStatus !==
                          'APPROVED' && (

                          <Button
                            variant="contained"
                            onClick={() =>
                              handleStatusUpdate(
                                appointmentId,
                                'APPROVED'
                              )
                            }
                            startIcon={
                              <Check
                                size={16}
                              />
                            }
                            sx={{
                              backgroundColor:
                                '#00A8FF',

                              color:
                                '#0D1527',

                              fontWeight:
                                700,

                              px:
                                3
                            }}
                          >
                            Accept Appointment
                          </Button>

                        )}

                      </Box>

                    )}

                  </Paper>

                </Grid>

              );
            }
          )}


          {/* =================================================
              EXISTING GROUP APPOINTMENTS
              UNCHANGED FUNCTIONALITY
          ================================================= */}

          {normalAppointments.map(
            (app) => {

              const statusStyle =
                getStatusStyle(
                  app.status
                );


              return (

                <Grid
                  item
                  xs={12}
                  key={
                    app.id
                  }
                >

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

                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'space-between',

                        mb:
                          2
                      }}
                    >

                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            2
                        }}
                      >

                        <Avatar
                          sx={{
                            backgroundColor:
                              '#00A8FF',

                            color:
                              '#0D1527',

                            fontWeight:
                              700
                          }}
                        >
                          {
                            app.customerName
                              ? app.customerName
                                  .slice(
                                    0,
                                    2
                                  )
                                  .toUpperCase()
                              : 'CU'
                          }
                        </Avatar>


                        <Box>

                          <Typography
                            variant="subtitle1"
                            sx={{
                              color:
                                '#FFF',

                              fontWeight:
                                700
                            }}
                          >
                            {
                              app.customerName
                            }
                          </Typography>


                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                '#00A8FF',

                              fontWeight:
                                600
                            }}
                          >
                            {
                              app.requestTitle ||
                              'Technical Repair Request'
                            }
                          </Typography>

                        </Box>

                      </Box>


                      <Chip
                        label={
                          app.status
                        }
                        size="small"
                        sx={{
                          ...statusStyle,

                          fontWeight:
                            700
                        }}
                      />

                    </Box>


                    <Box
                      sx={{
                        backgroundColor:
                          '#0F172A',

                        p:
                          2,

                        borderRadius:
                          2,

                        mb:
                          2.5,

                        border:
                          '1px solid #2A364F'
                      }}
                    >

                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B',

                          display:
                            'block',

                          mb:
                            0.5
                        }}
                      >
                        CUSTOMER ISSUE DESCRIPTION
                      </Typography>


                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            '#E2E8F0',

                          lineHeight:
                            1.6
                        }}
                      >
                        {
                          app.requestDescription ||
                          'Customer submitted issue for diagnosis.'
                        }
                      </Typography>

                    </Box>


                    <Box
                      sx={{
                        display:
                          'flex',

                        gap:
                          3,

                        mb:
                          3,

                        flexWrap:
                          'wrap'
                      }}
                    >

                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            1
                        }}
                      >

                        <Calendar
                          size={16}
                          color="#00A8FF"
                        />


                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              '#94A3B8'
                          }}
                        >
                          {app.date} • {app.timeSlot}
                        </Typography>

                      </Box>


                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            1
                        }}
                      >

                        <Clock
                          size={16}
                          color="#00A8FF"
                        />


                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              '#94A3B8'
                          }}
                        >
                          {
                            app.serviceType
                          }
                        </Typography>

                      </Box>

                    </Box>


                    {/* EXISTING ACTIONS */}

                    <Box
                      sx={{
                        display:
                          'flex',

                        gap:
                          2,

                        justifyContent:
                          'flex-end',

                        flexWrap:
                          'wrap'
                      }}
                    >

                      <Button
                        onClick={() =>
                          setRescheduleTarget(
                            app
                          )
                        }
                        startIcon={
                          <RefreshCw
                            size={16}
                          />
                        }
                        sx={{
                          color:
                            '#94A3B8',

                          backgroundColor:
                            '#0F172A',

                          border:
                            '1px solid #2A364F',

                          px:
                            2.5
                        }}
                      >
                        Reschedule
                      </Button>


                      <Button
                        onClick={() =>
                          handleStatusUpdate(
                            app.id,
                            'REJECTED'
                          )
                        }
                        startIcon={
                          <X
                            size={16}
                          />
                        }
                        sx={{
                          color:
                            '#EF4444',

                          backgroundColor:
                            'rgba(239,68,68,.1)',

                          border:
                            '1px solid rgba(239,68,68,.3)',

                          px:
                            2.5
                        }}
                      >
                        Decline
                      </Button>


                      {app.status !==
                        'APPROVED' && (

                        <Button
                          variant="contained"
                          onClick={() =>
                            handleStatusUpdate(
                              app.id,
                              'APPROVED'
                            )
                          }
                          startIcon={
                            <Check
                              size={16}
                            />
                          }
                          sx={{
                            backgroundColor:
                              '#00A8FF',

                            color:
                              '#0D1527',

                            fontWeight:
                              700,

                            px:
                              3
                          }}
                        >
                          Accept Appointment
                        </Button>

                      )}

                    </Box>

                  </Paper>

                </Grid>

              );
            }
          )}

        </Grid>

      )}


      {/* ===================================================
          EXISTING RESCHEDULE MODAL
      =================================================== */}

      <Dialog
        open={
          Boolean(
            rescheduleTarget
          )
        }
        onClose={() =>
          setRescheduleTarget(
            null
          )
        }
        PaperProps={{
          sx: {
            backgroundColor:
              '#172036',

            color:
              '#FFF',

            borderRadius:
              3,

            border:
              '1px solid #2A364F',

            minWidth:
              420
          }
        }}
      >

        <DialogTitle
          sx={{
            fontWeight:
              700
          }}
        >
          Reschedule Appointment
        </DialogTitle>


        <DialogContent>

          <Typography
            variant="body2"
            sx={{
              color:
                '#94A3B8',

              mb:
                3
            }}
          >
            Select a new date and available time slot for client{' '}

            <strong>
              {
                rescheduleTarget
                  ?.customerName
              }
            </strong>
            :
          </Typography>


          <Typography
            variant="caption"
            sx={{
              color:
                '#94A3B8',

              fontWeight:
                600,

              display:
                'block',

              mb:
                1
            }}
          >
            New Date:
          </Typography>


          <Box
            sx={{
              display:
                'flex',

              gap:
                1,

              mb:
                3
            }}
          >

            {dateOptions.map(
              (d) => {

                const label =
                  `${d.day} ${d.dateNum}`;


                const selected =
                  newSelectedDate ===
                  label;


                return (

                  <Box
                    key={
                      label
                    }
                    onClick={() =>
                      setNewSelectedDate(
                        label
                      )
                    }
                    sx={{
                      flex:
                        1,

                      py:
                        1,

                      textAlign:
                        'center',

                      borderRadius:
                        2,

                      cursor:
                        'pointer',

                      backgroundColor:
                        selected
                          ? '#00A8FF'
                          : '#0F172A',

                      color:
                        selected
                          ? '#0D1527'
                          : '#FFF',

                      border:
                        selected
                          ? '1px solid #00A8FF'
                          : '1px solid #2A364F',

                      fontWeight:
                        700
                    }}
                  >

                    <Typography
                      variant="caption"
                      sx={{
                        display:
                          'block'
                      }}
                    >
                      {d.day}
                    </Typography>


                    <Typography
                      variant="body2"
                    >
                      {d.dateNum}
                    </Typography>

                  </Box>

                );
              }
            )}

          </Box>


          <Typography
            variant="caption"
            sx={{
              color:
                '#94A3B8',

              fontWeight:
                600,

              display:
                'block',

              mb:
                1
            }}
          >
            New Time Slot:
          </Typography>


          <Grid
            container
            spacing={1}
            sx={{
              mb:
                2
            }}
          >

            {timeSlots.map(
              (slot) => {

                const selected =
                  newTimeSlot ===
                  slot;


                return (

                  <Grid
                    item
                    xs={4}
                    key={
                      slot
                    }
                  >

                    <Button
                      fullWidth
                      size="small"
                      onClick={() =>
                        setNewTimeSlot(
                          slot
                        )
                      }
                      sx={{
                        backgroundColor:
                          selected
                            ? '#00A8FF'
                            : '#0F172A',

                        color:
                          selected
                            ? '#0D1527'
                            : '#94A3B8',

                        border:
                          selected
                            ? '1px solid #00A8FF'
                            : '1px solid #2A364F',

                        py:
                          0.8,

                        fontSize:
                          '0.75rem',

                        fontWeight:
                          600
                      }}
                    >
                      {slot}
                    </Button>

                  </Grid>

                );
              }
            )}

          </Grid>

        </DialogContent>


        <DialogActions
          sx={{
            p:
              2.5
          }}
        >

          <Button
            onClick={() =>
              setRescheduleTarget(
                null
              )
            }
            sx={{
              color:
                '#94A3B8'
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={
              handleConfirmReschedule
            }
            sx={{
              backgroundColor:
                '#00A8FF',

              color:
                '#0D1527',

              fontWeight:
                700
            }}
          >
            Confirm Reschedule
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
};