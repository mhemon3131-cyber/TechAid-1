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
  MessageSquare,
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
// ==========================================================

export const TechnicianDashboard = ({
  currentUser,
  onOpenChat
}) => {

  // ========================================================
  // EXISTING APPOINTMENTS
  // ========================================================

  const [
    appointments,
    setAppointments
  ] = useState([]);


  // ========================================================
  // AUTO-ASSIGNED ACCEPTED JOBS
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
  // RESCHEDULE
  // ========================================================

  const [
    rescheduleTarget,
    setRescheduleTarget
  ] = useState(null);


  const [
    newSelectedDate,
    setNewSelectedDate
  ] = useState(
    'Mon 13'
  );


  const [
    newTimeSlot,
    setNewTimeSlot
  ] = useState(
    '02:30 pm'
  );


  const dateOptions = [
    {
      day:
        'Sun',

      dateNum:
        '12'
    },

    {
      day:
        'Mon',

      dateNum:
        '13'
    },

    {
      day:
        'Tue',

      dateNum:
        '14'
    },

    {
      day:
        'Wed',

      dateNum:
        '15'
    },

    {
      day:
        'Thu',

      dateNum:
        '16'
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
  // TECHNICIAN ID
  //
  // Supports both:
  // currentUser.technicianId
  // currentUser.id
  // ========================================================

  const getTechnicianId =
    () => {

      return (
        currentUser?.technicianId ||
        currentUser?.id ||
        null
      );
    };


  // ========================================================
  // LOAD WHEN USER CHANGES
  // ========================================================

  useEffect(() => {

    const technicianId =
      getTechnicianId();


    if (
      technicianId
    ) {

      fetchData();

    } else {

      setError(
        'Technician profile ID is missing. Please log in again using your technician account.'
      );
    }

  }, [
    currentUser
  ]);


  // ========================================================
  // FETCH BOTH JOB TYPES
  //
  // 1. Regular appointments
  // 2. Automatic accepted assignments
  // ========================================================

  const fetchData =
    async () => {

      const technicianId =
        getTechnicianId();


      if (
        !technicianId
      ) {

        setError(
          'Technician profile ID is missing. Please log in again using your technician account.'
        );

        return;
      }


      setLoading(
        true
      );

      setError('');


      try {

        // ==================================================
        // REGULAR APPOINTMENTS
        // ==================================================

        try {

          const appointmentResponse =
            await axios.get(
              `http://localhost:5000/api/appointments?technicianId=${technicianId}`
            );


          if (
            appointmentResponse
              .data
              .success
          ) {

            setAppointments(
              appointmentResponse
                .data
                .data ||
              []
            );

          } else {

            setAppointments([]);
          }


        } catch (
          appointmentError
        ) {

          console.error(
            'Failed to load appointments:',
            appointmentError
          );


          setAppointments([]);
        }


        // ==================================================
        // AUTOMATIC ACCEPTED JOBS
        // ==================================================

        try {

          const automaticResponse =
            await getTechnicianAutomaticJobs(
              technicianId
            );


          if (
            automaticResponse
              ?.success
          ) {

            setAutomaticJobs(
              automaticResponse
                .data ||
              []
            );

          } else {

            setAutomaticJobs([]);
          }


        } catch (
          automaticError
        ) {

          console.error(
            'Failed to load automatic jobs:',
            automaticError
          );


          setAutomaticJobs([]);
        }


      } finally {

        setLoading(
          false
        );
      }
    };


  // ========================================================
  // SERVICE REQUEST STATUS SYNC
  //
  // Appointment APPROVED -> Request ACCEPTED
  // ========================================================

  const syncRequestStatus =
    async (
      appItem,
      status
    ) => {

      const requestIdentifier =
        appItem?.trackingId ||
        appItem?.serviceRequest
          ?.trackingId ||
        appItem?.serviceRequestId ||
        null;


      if (
        !requestIdentifier
      ) {

        return;
      }


      let requestStatus =
        status;


      if (
        status ===
        'APPROVED'
      ) {

        requestStatus =
          'ACCEPTED';
      }


      // Appointment-only states are not
      // necessarily valid ServiceStatus values.
      if (
        status ===
        'RESCHEDULED' ||
        status ===
        'REJECTED'
      ) {

        return;
      }


      try {

        await axios.put(
          `http://localhost:5000/api/requests/${requestIdentifier}/status`,

          {
            status:
              requestStatus,

            note:
              `Technician ${currentUser?.name || ''} updated status to ${requestStatus}.`
          }
        );


      } catch (
        syncError
      ) {

        console.warn(
          'Service request status sync failed:',
          syncError
        );
      }
    };


  // ========================================================
  // APPOINTMENT STATUS UPDATE
  // ========================================================

  const handleStatusUpdate =
    async (
      id,
      status,
      extraData = {},
      appItem = null
    ) => {

      setLoading(
        true
      );

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

          await syncRequestStatus(
            appItem,
            status
          );


          setMsg(
            `Appointment ${status
              .toLowerCase()
              .replace(
                /_/g,
                ' '
              )} successfully.`
          );


          await fetchData();
        }


      } catch (err) {

        console.error(
          'Appointment status update failed:',
          err
        );


        setError(
          err?.response
            ?.data
            ?.message ||
          'Failed to update appointment status.'
        );


      } finally {

        setLoading(
          false
        );


        setRescheduleTarget(
          null
        );
      }
    };


  // ========================================================
  // RESCHEDULE CONFIRM
  // ========================================================

  const handleConfirmReschedule =
    () => {

      if (
        !rescheduleTarget
      ) {

        return;
      }


      const parts =
        newSelectedDate.split(
          ' '
        );


      const dayName =
        parts[0];


      const dateNumber =
        parts[1];


      const formattedDate =
        `${dayName} Jul ${dateNumber}, 2026`;


      handleStatusUpdate(
        rescheduleTarget.id,

        'RESCHEDULED',

        {
          newDate:
            formattedDate,

          newTimeSlot:
            newTimeSlot
        },

        rescheduleTarget
      );
    };


  // ========================================================
  // AUTO JOB APPOINTMENT ID
  // ========================================================

  const getAutoJobAppointmentId =
    (job) => {

      return (
        job?.appointment?.id ||
        null
      );
    };


  // ========================================================
  // LOCATION DISPLAY
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
  // STATUS STYLE
  // ========================================================

  const getStatusStyle =
    (status) => {

      if (
        status ===
          'APPROVED' ||
        status ===
          'ACCEPTED' ||
        status ===
          'IN_PROGRESS' ||
        status ===
          'ON_THE_WAY' ||
        status ===
          'COMPLETED'
      ) {

        return {

          backgroundColor:
            'rgba(16, 185, 129, 0.2)',

          color:
            '#10B981'
        };
      }


      if (
        status ===
        'REJECTED'
      ) {

        return {

          backgroundColor:
            'rgba(239, 68, 68, 0.2)',

          color:
            '#EF4444'
        };
      }


      if (
        status ===
        'RESCHEDULED'
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
  // REMOVE DUPLICATE APPOINTMENTS
  //
  // Auto assignment also creates Appointment.
  // So duplicate normal card hide.
  // ========================================================

  const automaticAppointmentIds =
    new Set(
      automaticJobs
        .map(
          (job) =>
            job?.appointment
              ?.id
        )
        .filter(
          Boolean
        )
    );


  const normalAppointments =
    appointments.filter(
      (appointment) =>
        !automaticAppointmentIds
          .has(
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
            label={
              `${totalJobs} Job Request${
                totalJobs === 1
                  ? ''
                  : 's'
              }`
            }
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
          CONTENT
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
              AUTO ACCEPTED JOBS
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


              const chatItem = {

                ...appointment,

                customerId:
                  customer.id,

                customerName:
                  customer.name,

                customerEmail:
                  customer.email,

                serviceRequestId:
                  request.id,

                trackingId:
                  request.trackingId,

                requestTitle:
                  request.title,

                title:
                  request.title,

                deviceCategory:
                  request.deviceCategory
              };


              const statusItem = {

                ...appointment,

                serviceRequestId:
                  request.id,

                trackingId:
                  request.trackingId,

                serviceRequest:
                  request
              };


              return (

                <Grid
                  item
                  xs={12}
                  key={
                    job.assignmentId ||
                    appointmentId
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

                    {/* TOP */}

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


                    {/* CONTACT */}

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


                    {/* ISSUE */}

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


                    {/* REQUEST INFO */}

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


                    {/* DATE/TIME/LOCATION */}

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


                    {/* ACTIONS */}

                    <Box
                      sx={{
                        display:
                          'flex',

                        gap:
                          1.5,

                        justifyContent:
                          'flex-end',

                        flexWrap:
                          'wrap'
                      }}
                    >

                      <Button
                        size="small"
                        onClick={() =>
                          onOpenChat &&
                          onOpenChat(
                            chatItem
                          )
                        }
                        startIcon={
                          <MessageSquare
                            size={16}
                          />
                        }
                        sx={{
                          color:
                            '#00A8FF',

                          backgroundColor:
                            'rgba(0,168,255,.12)',

                          border:
                            '1px solid #00A8FF',

                          px:
                            2,

                          fontWeight:
                            700
                        }}
                      >
                        Open Live Chat
                      </Button>


                      {appointmentId && (

                        <>
                          <Button
                            size="small"
                            onClick={() =>
                              setRescheduleTarget({

                                ...statusItem,

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
                                2
                            }}
                          >
                            Reschedule
                          </Button>


                          {(
                            displayStatus ===
                              'PENDING'
                          ) && (

                            <>
                              <Button
                                size="small"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointmentId,
                                    'REJECTED',
                                    {},
                                    statusItem
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
                                    2
                                }}
                              >
                                Decline
                              </Button>


                              <Button
                                size="small"
                                variant="contained"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointmentId,
                                    'APPROVED',
                                    {},
                                    statusItem
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
                                    2.5
                                }}
                              >
                                Accept Appointment
                              </Button>
                            </>
                          )}


                          {(
                            displayStatus ===
                              'APPROVED' ||
                            displayStatus ===
                              'ACCEPTED'
                          ) && (

                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointmentId,
                                    'IN_PROGRESS',
                                    {},
                                    statusItem
                                  )
                                }
                                sx={{
                                  backgroundColor:
                                    '#3B82F6',

                                  color:
                                    '#FFF',

                                  fontWeight:
                                    700
                                }}
                              >
                                Start Diagnosing
                              </Button>


                              <Button
                                size="small"
                                variant="contained"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointmentId,
                                    'ON_THE_WAY',
                                    {},
                                    statusItem
                                  )
                                }
                                sx={{
                                  backgroundColor:
                                    '#F59E0B',

                                  color:
                                    '#0D1527',

                                  fontWeight:
                                    700
                                }}
                              >
                                On the Way
                              </Button>


                              <Button
                                size="small"
                                variant="contained"
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointmentId,
                                    'COMPLETED',
                                    {},
                                    statusItem
                                  )
                                }
                                sx={{
                                  backgroundColor:
                                    '#10B981',

                                  color:
                                    '#0D1527',

                                  fontWeight:
                                    700
                                }}
                              >
                                Mark Completed
                              </Button>
                            </>
                          )}


                          {(
                            displayStatus ===
                              'IN_PROGRESS' ||
                            displayStatus ===
                              'ON_THE_WAY'
                          ) && (

                            <Button
                              size="small"
                              variant="contained"
                              onClick={() =>
                                handleStatusUpdate(
                                  appointmentId,
                                  'COMPLETED',
                                  {},
                                  statusItem
                                )
                              }
                              startIcon={
                                <Check
                                  size={16}
                                />
                              }
                              sx={{
                                backgroundColor:
                                  '#10B981',

                                color:
                                  '#0D1527',

                                fontWeight:
                                  700
                              }}
                            >
                              Complete Service
                            </Button>
                          )}


                          {displayStatus ===
                            'COMPLETED' && (

                            <Chip
                              label="Service Completed"
                              color="success"
                            />
                          )}


                          {displayStatus ===
                            'REJECTED' && (

                            <Chip
                              label="Appointment Declined"
                              color="error"
                            />
                          )}

                        </>
                      )}

                    </Box>

                  </Paper>

                </Grid>
              );
            }
          )}


          {/* =================================================
              NORMAL APPOINTMENTS
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
                              app.customerName ||
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


                    <Box
                      sx={{
                        display:
                          'flex',

                        gap:
                          1.5,

                        justifyContent:
                          'flex-end',

                        flexWrap:
                          'wrap'
                      }}
                    >

                      <Button
                        size="small"
                        onClick={() =>
                          onOpenChat &&
                          onOpenChat(
                            app
                          )
                        }
                        startIcon={
                          <MessageSquare
                            size={16}
                          />
                        }
                        sx={{
                          color:
                            '#00A8FF',

                          backgroundColor:
                            'rgba(0,168,255,.12)',

                          border:
                            '1px solid #00A8FF',

                          px:
                            2,

                          fontWeight:
                            700
                        }}
                      >
                        Open Live Chat
                      </Button>


                      {app.status ===
                        'PENDING' && (

                        <>
                          <Button
                            size="small"
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
                                2
                            }}
                          >
                            Reschedule
                          </Button>


                          <Button
                            size="small"
                            onClick={() =>
                              handleStatusUpdate(
                                app.id,
                                'REJECTED',
                                {},
                                app
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
                                2
                            }}
                          >
                            Decline
                          </Button>


                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              handleStatusUpdate(
                                app.id,
                                'APPROVED',
                                {},
                                app
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
                                2.5
                            }}
                          >
                            Accept Appointment
                          </Button>
                        </>
                      )}


                      {(
                        app.status ===
                          'APPROVED' ||
                        app.status ===
                          'ACCEPTED'
                      ) && (

                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              handleStatusUpdate(
                                app.id,
                                'IN_PROGRESS',
                                {},
                                app
                              )
                            }
                            sx={{
                              backgroundColor:
                                '#3B82F6',

                              color:
                                '#FFF',

                              fontWeight:
                                700
                            }}
                          >
                            Start Diagnosing
                          </Button>


                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              handleStatusUpdate(
                                app.id,
                                'ON_THE_WAY',
                                {},
                                app
                              )
                            }
                            sx={{
                              backgroundColor:
                                '#F59E0B',

                              color:
                                '#0D1527',

                              fontWeight:
                                700
                            }}
                          >
                            On the Way
                          </Button>


                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              handleStatusUpdate(
                                app.id,
                                'COMPLETED',
                                {},
                                app
                              )
                            }
                            sx={{
                              backgroundColor:
                                '#10B981',

                              color:
                                '#0D1527',

                              fontWeight:
                                700
                            }}
                          >
                            Mark Completed
                          </Button>
                        </>
                      )}


                      {(
                        app.status ===
                          'IN_PROGRESS' ||
                        app.status ===
                          'ON_THE_WAY'
                      ) && (

                        <Button
                          size="small"
                          variant="contained"
                          onClick={() =>
                            handleStatusUpdate(
                              app.id,
                              'COMPLETED',
                              {},
                              app
                            )
                          }
                          startIcon={
                            <Check
                              size={16}
                            />
                          }
                          sx={{
                            backgroundColor:
                              '#10B981',

                            color:
                              '#0D1527',

                            fontWeight:
                              700
                          }}
                        >
                          Complete Service
                        </Button>
                      )}


                      {app.status ===
                        'COMPLETED' && (

                        <Chip
                          label="Service Completed"
                          color="success"
                        />
                      )}


                      {app.status ===
                        'REJECTED' && (

                        <Chip
                          label="Appointment Declined"
                          color="error"
                        />
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
          RESCHEDULE MODAL
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
                  ?.customerName ||
                'Customer'
              }
            </strong>
            .
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
              (date) => {

                const label =
                  `${date.day} ${date.dateNum}`;


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
                      {date.day}
                    </Typography>


                    <Typography
                      variant="body2"
                    >
                      {date.dateNum}
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