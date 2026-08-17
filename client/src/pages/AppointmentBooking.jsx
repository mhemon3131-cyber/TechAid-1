import React, {
  useEffect,
  useState
} from 'react';

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';

import {
  Search,
  Star,
  MapPin,
  CheckCircle2
} from 'lucide-react';

import axios from 'axios';


export const AppointmentBooking = ({
  currentUser
}) => {

  const [
    step,
    setStep
  ] = useState(1);


  const [
    technicians,
    setTechnicians
  ] = useState([]);


  const [
    selectedTech,
    setSelectedTech
  ] = useState(null);


  const [
    searchQuery,
    setSearchQuery
  ] = useState('');


  // ======================================================
  // SLOT SELECTION
  // ======================================================

  const [
    selectedDate,
    setSelectedDate
  ] = useState('Mon 13');


  const [
    selectedTimeSlot,
    setSelectedTimeSlot
  ] = useState('10:00 am');


  const [
    serviceType,
    setServiceType
  ] = useState('Remote support');


  // ======================================================
  // BOOKED SLOT MAP
  //
  // Key:
  // technicianId + formatted date
  // ======================================================

  const [
    bookedMap,
    setBookedMap
  ] = useState({});


  // ======================================================
  // MODAL & API STATE
  // ======================================================

  const [
    openModal,
    setOpenModal
  ] = useState(false);


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    bookingSuccess,
    setBookingSuccess
  ] = useState(null);


  const [
    conflictError,
    setConflictError
  ] = useState('');


  // ======================================================
  // DATE OPTIONS
  // ======================================================

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


  const serviceTypes = [
    'Remote support',
    'Home visit',
    'Service center'
  ];


  // ======================================================
  // FALLBACK TECHNICIAN
  //
  // Only use if backend has no technician / unavailable.
  // ======================================================

  const fallbackTechs = [
    {
      id: 'usr-4',
      name: 'TechAlex',
      specialty:
        'Networking & Wi-Fi Specialist',
      rating: 4.9,
      distanceKm: 2.1,
      isAvailable: true,
      avatar: 'TA'
    }
  ];


  // ======================================================
  // FORMAT DATE
  // ======================================================

  const getFormattedDateStr =
    (dateLabel) => {

      const parts =
        dateLabel.split(' ');


      const dayName =
        parts[0];


      const num =
        parts[1];


      return `${dayName} Jul ${num}, 2026`;
    };


  // ======================================================
  // LOAD TECHNICIANS
  // ======================================================

  useEffect(() => {

    fetchTechs();

  }, []);


  // ======================================================
  // LOAD BOOKED SLOTS WHEN TECH / DATE CHANGES
  // ======================================================

  useEffect(() => {

    if (
      selectedTech &&
      selectedDate
    ) {

      fetchBookedSlotsForCurrentSelection();
    }

  }, [
    selectedTech?.id,
    selectedDate
  ]);


  // ======================================================
  // FETCH TECHNICIANS
  //
  // Keep existing backend:
  // http://localhost:5000
  //
  // Also merge registered technicians from localStorage.
  // ======================================================

  const fetchTechs =
    async () => {

      const registeredTechs =
        JSON.parse(
          localStorage.getItem(
            'techaid_registered_techs'
          ) || '[]'
        );


      try {

        const res =
          await axios.get(
            'http://localhost:5000/api/technicians'
          );


        let combined = [];


        if (
          res.data.success &&
          Array.isArray(
            res.data.data
          ) &&
          res.data.data.length > 0
        ) {

          combined = [
            ...res.data.data
          ];

        } else {

          combined = [
            ...fallbackTechs
          ];
        }


        registeredTechs.forEach(
          (registeredTech) => {

            const alreadyExists =
              combined.some(
                (tech) =>
                  String(
                    tech.name || ''
                  ).toLowerCase() ===
                  String(
                    registeredTech.name || ''
                  ).toLowerCase()
              );


            if (
              !alreadyExists
            ) {

              combined.push(
                registeredTech
              );
            }
          }
        );


        setTechnicians(
          combined
        );


        setSelectedTech(
          combined[0] ||
          null
        );


      } catch (err) {

        console.error(
          'Technician fetch error:',
          err
        );


        const combined = [
          ...fallbackTechs
        ];


        registeredTechs.forEach(
          (registeredTech) => {

            const alreadyExists =
              combined.some(
                (tech) =>
                  String(
                    tech.name || ''
                  ).toLowerCase() ===
                  String(
                    registeredTech.name || ''
                  ).toLowerCase()
              );


            if (
              !alreadyExists
            ) {

              combined.push(
                registeredTech
              );
            }
          }
        );


        setTechnicians(
          combined
        );


        setSelectedTech(
          combined[0] ||
          null
        );
      }
    };


  // ======================================================
  // FETCH BOOKED SLOTS
  // ======================================================

  const fetchBookedSlotsForCurrentSelection =
    async () => {

      if (
        !selectedTech
      ) {

        return;
      }


      const formattedDate =
        getFormattedDateStr(
          selectedDate
        );


      const key =
        `${selectedTech.id}_${formattedDate}`;


      try {

        const res =
          await axios.get(
            `http://localhost:5000/api/appointments?technicianId=${selectedTech.id}&date=${encodeURIComponent(
              formattedDate
            )}`
          );


        if (
          res.data.success
        ) {

          const taken =
            (res.data.data || [])
              .filter(
                (appointment) =>

                  appointment.status !==
                    'REJECTED' &&

                  appointment.technicianId ===
                    selectedTech.id &&

                  appointment.date ===
                    formattedDate
              )
              .map(
                (appointment) =>
                  appointment.timeSlot
              );


          setBookedMap(
            (prev) => ({
              ...prev,

              [key]:
                taken
            })
          );
        }


      } catch (err) {

        console.error(
          'Booked slot fetch error:',
          err
        );

        // Existing local booked map stays unchanged.
      }
    };


  // ======================================================
  // CURRENT BOOKING KEY
  // ======================================================

  const currentFormattedDate =
    getFormattedDateStr(
      selectedDate
    );


  const currentKey =
    selectedTech
      ? `${selectedTech.id}_${currentFormattedDate}`
      : '';


  const activeBookedSlots =
    bookedMap[
      currentKey
    ] || [];


  // ======================================================
  // FILTER TECHNICIANS
  // ======================================================

  const filteredTechs =
    technicians.filter(
      (tech) => {

        const name =
          String(
            tech.name || ''
          ).toLowerCase();


        const specialty =
          String(
            tech.specialty || ''
          ).toLowerCase();


        const query =
          searchQuery.toLowerCase();


        return (
          name.includes(
            query
          ) ||
          specialty.includes(
            query
          )
        );
      }
    );


  // ======================================================
  // CONFIRM BOOKING
  // ======================================================

  const handleConfirmBooking =
    async () => {

      setLoading(true);

      setConflictError('');


      if (
        !selectedTech
      ) {

        setConflictError(
          'Please select a technician.'
        );

        setLoading(false);

        return;
      }


      if (
        activeBookedSlots.includes(
          selectedTimeSlot
        )
      ) {

        setConflictError(
          `Scheduling Conflict: ${selectedTech.name} is already booked for ${selectedTimeSlot} on ${selectedDate}. Please select another available time slot.`
        );


        setLoading(false);

        return;
      }


      const formattedDate =
        getFormattedDateStr(
          selectedDate
        );


      try {

        // --------------------------------------------------
        // Main branch active request support
        //
        // If customer came from a service request,
        // attach that request.
        //
        // Otherwise manual appointment keeps null.
        // --------------------------------------------------

        const activeRequest =
          JSON.parse(
            localStorage.getItem(
              'techaid_active_request'
            ) || 'null'
          );


        const payload = {

          technicianId:
            selectedTech.id,

          date:
            formattedDate,

          timeSlot:
            selectedTimeSlot,

          serviceType,

          customerId:
            currentUser?.id ||
            'usr-1',

          serviceRequestId:
            activeRequest?.id ||
            null
        };


        const res =
          await axios.post(
            'http://localhost:5000/api/appointments',
            payload
          );


        if (
          res.data.success
        ) {

          // REAL DATABASE SUCCESS ONLY

          setBookingSuccess(
            res.data.data
          );


          setBookedMap(
            (prev) => ({

              ...prev,

              [currentKey]: [
                ...(
                  prev[
                    currentKey
                  ] || []
                ),

                selectedTimeSlot
              ]
            })
          );

        } else {

          setBookingSuccess(
            null
          );


          setConflictError(
            res.data.message ||
            'Appointment could not be saved.'
          );
        }


      } catch (err) {

        console.error(
          'Appointment booking error:',
          err
        );


        setBookingSuccess(
          null
        );


        setConflictError(
          err?.response?.data?.message ||
          'Appointment could not be saved. Please try again.'
        );


      } finally {

        setLoading(false);
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
          PAGE HEADER
      ================================================= */}

      <Box
        sx={{
          mb: 4
        }}
      >

        <Typography
          variant="h5"
          sx={{
            color: '#FFF',
            fontWeight: 700
          }}
        >
          Appointment Scheduling System
        </Typography>


        <Typography
          variant="body2"
          sx={{
            color:
              '#94A3B8'
          }}
        >
          Select technician, date, time slot & prevent scheduling conflicts
        </Typography>

      </Box>


      {step === 1 ? (

        // ==================================================
        // STEP 1
        // CHOOSE TECHNICIAN
        // ==================================================

        <Box
          sx={{
            maxWidth:
              800
          }}
        >

          <Typography
            variant="h6"
            sx={{
              color:
                '#FFF',

              fontWeight:
                600,

              mb:
                2
            }}
          >
            Choose a technician
          </Typography>


          <TextField
            fullWidth
            placeholder="Search by name or specialty..."
            value={
              searchQuery
            }
            onChange={
              (e) =>
                setSearchQuery(
                  e.target.value
                )
            }
            InputProps={{
              startAdornment: (

                <Search
                  size={20}
                  color="#94A3B8"
                  style={{
                    marginRight:
                      10
                  }}
                />
              )
            }}
            sx={{
              mb:
                3,

              backgroundColor:
                '#172036',

              borderRadius:
                2,

              '& .MuiOutlinedInput-root': {

                color:
                  '#FFF',

                '& fieldset': {
                  borderColor:
                    '#2A364F'
                },

                '&:hover fieldset': {
                  borderColor:
                    '#00A8FF'
                },

                '&.Mui-focused fieldset': {
                  borderColor:
                    '#00A8FF'
                }
              }
            }}
          />


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

            {filteredTechs.length ===
              0 ? (

              <Paper
                elevation={0}
                sx={{
                  p:
                    4,

                  textAlign:
                    'center',

                  backgroundColor:
                    '#172036',

                  border:
                    '1px dashed #2A364F',

                  borderRadius:
                    3
                }}
              >

                <Typography
                  variant="body1"
                  sx={{
                    color:
                      '#94A3B8'
                  }}
                >
                  No technicians found.
                </Typography>

              </Paper>

            ) : (

              filteredTechs.map(
                (tech) => (

                  <Paper
                    key={
                      tech.id
                    }
                    elevation={0}
                    onClick={() =>
                      setSelectedTech(
                        tech
                      )
                    }
                    sx={{
                      backgroundColor:
                        '#172036',

                      borderRadius:
                        3,

                      p:
                        2.5,

                      border:
                        selectedTech?.id ===
                        tech.id
                          ? '2px solid #00A8FF'
                          : '1px solid #2A364F',

                      cursor:
                        'pointer',

                      display:
                        'flex',

                      alignItems:
                        'center',

                      justifyContent:
                        'space-between',

                      transition:
                        'all 0.2s',

                      '&:hover': {
                        borderColor:
                          '#00A8FF'
                      }
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
                          width:
                            52,

                          height:
                            52,

                          backgroundColor:
                            '#0F172A',

                          color:
                            '#00A8FF',

                          fontWeight:
                            700,

                          border:
                            '2px solid #00A8FF'
                        }}
                      >
                        {
                          tech.avatar ||
                          tech.name
                            ?.slice(
                              0,
                              2
                            )
                            .toUpperCase()
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
                            tech.name
                          }
                        </Typography>


                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              '#94A3B8'
                          }}
                        >
                          {
                            tech.specialty
                          }
                        </Typography>

                      </Box>

                    </Box>


                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap:
                          3
                      }}
                    >

                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            0.5
                        }}
                      >

                        <Star
                          size={18}
                          fill="#F59E0B"
                          color="#F59E0B"
                        />


                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              '#FFF',

                            fontWeight:
                              700
                          }}
                        >
                          {
                            tech.rating ??
                            4.8
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
                            0.5
                        }}
                      >

                        <MapPin
                          size={16}
                          color="#94A3B8"
                        />


                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              '#94A3B8'
                          }}
                        >
                          {
                            tech.distanceKm ??
                            2.5
                          } km
                        </Typography>

                      </Box>


                      {tech.isAvailable && (

                        <Chip
                          label="Available"
                          size="small"
                          sx={{
                            backgroundColor:
                              'rgba(16, 185, 129, 0.2)',

                            color:
                              '#10B981',

                            fontWeight:
                              700
                          }}
                        />

                      )}

                    </Box>

                  </Paper>
                )
              )
            )}

          </Box>


          <Box
            sx={{
              display:
                'flex',

              justifyContent:
                'flex-end',

              mt:
                4
            }}
          >

            <Button
              variant="contained"
              onClick={() =>
                setStep(
                  2
                )
              }
              disabled={
                !selectedTech
              }
              sx={{
                backgroundColor:
                  '#00A8FF',

                color:
                  '#0D1527',

                px:
                  4,

                py:
                  1.2,

                fontSize:
                  '1rem',

                fontWeight:
                  700,

                '&:hover': {
                  backgroundColor:
                    '#38BDF8'
                }
              }}
            >
              Continue to Select Slot
            </Button>

          </Box>

        </Box>

      ) : (

        // ==================================================
        // STEP 2
        // DATE & TIME
        // ==================================================

        <Grid
          container
          spacing={4}
          sx={{
            maxWidth:
              1000
          }}
        >

          <Grid
            item
            xs={12}
            md={7}
          >

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

              {/* TECHNICIAN SUMMARY */}

              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    2,

                  mb:
                    4,

                  p:
                    2,

                  backgroundColor:
                    '#0F172A',

                  borderRadius:
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
                    selectedTech?.avatar ||
                    selectedTech?.name
                      ?.slice(
                        0,
                        2
                      )
                      .toUpperCase()
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
                      selectedTech?.name
                    }
                  </Typography>


                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        '#94A3B8'
                    }}
                  >
                    {
                      selectedTech?.specialty
                    }
                  </Typography>

                </Box>

              </Box>


              {/* DATE */}

              <Typography
                variant="body2"
                sx={{
                  color:
                    '#94A3B8',

                  fontWeight:
                    600,

                  mb:
                    1.5
                }}
              >
                Select a date
              </Typography>


              <Box
                sx={{
                  display:
                    'flex',

                  gap:
                    1.5,

                  mb:
                    4
                }}
              >

                {dateOptions.map(
                  (dateOption) => {

                    const label =
                      `${dateOption.day} ${dateOption.dateNum}`;


                    const selected =
                      selectedDate ===
                      label;


                    return (

                      <Box
                        key={
                          label
                        }
                        onClick={() =>
                          setSelectedDate(
                            label
                          )
                        }
                        sx={{
                          flex:
                            1,

                          py:
                            1.5,

                          px:
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

                          transition:
                            'all 0.2s'
                        }}
                      >

                        <Typography
                          variant="caption"
                          sx={{
                            display:
                              'block',

                            fontWeight:
                              500
                          }}
                        >
                          {
                            dateOption.day
                          }
                        </Typography>


                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              700
                          }}
                        >
                          {
                            dateOption.dateNum
                          }
                        </Typography>

                      </Box>
                    );
                  }
                )}

              </Box>


              {/* TIME SLOT */}

              <Typography
                variant="body2"
                sx={{
                  color:
                    '#94A3B8',

                  fontWeight:
                    600,

                  mb:
                    1.5
                }}
              >
                Available time slots for {selectedTech?.name} — {selectedDate}
              </Typography>


              <Grid
                container
                spacing={1.5}
                sx={{
                  mb:
                    4
                }}
              >

                {timeSlots.map(
                  (slot) => {

                    const isBooked =
                      activeBookedSlots.includes(
                        slot
                      );


                    const selected =
                      selectedTimeSlot ===
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
                          disabled={
                            isBooked
                          }
                          onClick={() =>
                            setSelectedTimeSlot(
                              slot
                            )
                          }
                          sx={{
                            backgroundColor:
                              isBooked
                                ? '#1E293B'
                                : selected
                                  ? '#00A8FF'
                                  : '#0F172A',

                            color:
                              isBooked
                                ? '#64748B'
                                : selected
                                  ? '#0D1527'
                                  : '#94A3B8',

                            border:
                              isBooked
                                ? '1px dashed #334155'
                                : selected
                                  ? '1px solid #00A8FF'
                                  : '1px solid #2A364F',

                            py:
                              1,

                            fontSize:
                              '0.85rem',

                            fontWeight:
                              600,

                            textDecoration:
                              isBooked
                                ? 'line-through'
                                : 'none'
                          }}
                        >
                          {slot}
                          {
                            isBooked
                              ? ' (Booked)'
                              : ''
                          }
                        </Button>

                      </Grid>
                    );
                  }
                )}

              </Grid>


              {/* SERVICE TYPE */}

              <Typography
                variant="body2"
                sx={{
                  color:
                    '#94A3B8',

                  fontWeight:
                    600,

                  mb:
                    1.5
                }}
              >
                Service type
              </Typography>


              <Box
                sx={{
                  display:
                    'flex',

                  gap:
                    1.5,

                  mb:
                    4
                }}
              >

                {serviceTypes.map(
                  (type) => {

                    const selected =
                      serviceType ===
                      type;


                    return (

                      <Button
                        key={
                          type
                        }
                        onClick={() =>
                          setServiceType(
                            type
                          )
                        }
                        sx={{
                          backgroundColor:
                            selected
                              ? 'rgba(0, 168, 255, 0.15)'
                              : '#0F172A',

                          color:
                            selected
                              ? '#00A8FF'
                              : '#94A3B8',

                          border:
                            selected
                              ? '1px solid #00A8FF'
                              : '1px solid #2A364F',

                          px:
                            2,

                          py:
                            1,

                          fontWeight:
                            600
                        }}
                      >
                        {
                          type
                        }
                      </Button>
                    );
                  }
                )}

              </Box>


              <Box
                sx={{
                  display:
                    'flex',

                  gap:
                    2
                }}
              >

                <Button
                  onClick={() =>
                    setStep(
                      1
                    )
                  }
                  sx={{
                    color:
                      '#94A3B8',

                    border:
                      '1px solid #2A364F'
                  }}
                >
                  Back
                </Button>


                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {

                    setConflictError(
                      ''
                    );

                    setBookingSuccess(
                      null
                    );

                    setOpenModal(
                      true
                    );
                  }}
                  disabled={
                    activeBookedSlots.includes(
                      selectedTimeSlot
                    )
                  }
                  sx={{
                    backgroundColor:
                      '#00A8FF',

                    color:
                      '#0D1527',

                    py:
                      1.2,

                    fontWeight:
                      700
                  }}
                >
                  Review Booking
                </Button>

              </Box>

            </Paper>

          </Grid>

        </Grid>
      )}


      {/* =================================================
          CONFIRMATION MODAL
      ================================================= */}

      <Dialog
        open={
          openModal
        }
        onClose={() =>
          setOpenModal(
            false
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

            p:
              2,

            minWidth:
              400
          }
        }}
      >

        <DialogTitle
          sx={{
            textAlign:
              'center',

            pb:
              1
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight:
                700
            }}
          >
            Confirm your booking
          </Typography>
        </DialogTitle>


        <DialogContent>

          {conflictError && (

            <Alert
              severity="error"
              sx={{
                mb:
                  2,

                backgroundColor:
                  'rgba(239, 68, 68, 0.15)',

                color:
                  '#EF4444'
              }}
            >
              {
                conflictError
              }
            </Alert>
          )}


          {bookingSuccess ? (

            <Box
              sx={{
                textAlign:
                  'center',

                py:
                  2
              }}
            >

              <CheckCircle2
                size={56}
                color="#10B981"
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
                    '#10B981',

                  fontWeight:
                    700,

                  mb:
                    1
                }}
              >
                Booking Successful!
              </Typography>


              <Typography
                variant="body2"
                sx={{
                  color:
                    '#94A3B8',

                  mb:
                    2
                }}
              >
                Appointment saved successfully in the database.
              </Typography>


              <Box
                sx={{
                  backgroundColor:
                    '#0F172A',

                  p:
                    2,

                  borderRadius:
                    2,

                  textAlign:
                    'left',

                  mb:
                    2
                }}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color:
                      '#64748B',

                    display:
                      'block'
                  }}
                >
                  APPOINTMENT ID
                </Typography>


                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#00A8FF',

                    fontWeight:
                      700
                  }}
                >
                  {
                    bookingSuccess.id
                  }
                </Typography>


                <Typography
                  variant="caption"
                  sx={{
                    color:
                      '#64748B',

                    display:
                      'block',

                    mt:
                      1
                  }}
                >
                  DATE & TIME
                </Typography>


                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#FFF'
                  }}
                >
                  {bookingSuccess.date} at {bookingSuccess.timeSlot}
                </Typography>

              </Box>

            </Box>

          ) : (

            <Box
              sx={{
                display:
                  'flex',

                flexDirection:
                  'column',

                gap:
                  2,

                py:
                  1
              }}
            >

              <Box
                sx={{
                  display:
                    'flex',

                  justifyContent:
                    'space-between'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#94A3B8'
                  }}
                >
                  Technician
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
                    selectedTech?.name
                  }
                </Typography>
              </Box>


              <Box
                sx={{
                  display:
                    'flex',

                  justifyContent:
                    'space-between'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#94A3B8'
                  }}
                >
                  Date & time
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
                  {getFormattedDateStr(selectedDate)}, {selectedTimeSlot}
                </Typography>
              </Box>


              <Box
                sx={{
                  display:
                    'flex',

                  justifyContent:
                    'space-between'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#94A3B8'
                  }}
                >
                  Service type
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
                    serviceType
                  }
                </Typography>
              </Box>


              <Box
                sx={{
                  display:
                    'flex',

                  justifyContent:
                    'space-between'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#94A3B8'
                  }}
                >
                  Estimated cost
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#00A8FF',

                    fontWeight:
                      700
                  }}
                >
                  ৳800 - 1,500
                </Typography>
              </Box>

            </Box>
          )}

        </DialogContent>


        <DialogActions
          sx={{
            px:
              3,

            pb:
              2
          }}
        >

          {bookingSuccess ? (

            <Button
              fullWidth
              variant="contained"
              onClick={() => {

                setBookingSuccess(
                  null
                );

                setOpenModal(
                  false
                );

                setStep(
                  1
                );
              }}
              sx={{
                backgroundColor:
                  '#00A8FF',

                color:
                  '#0D1527',

                fontWeight:
                  700
              }}
            >
              Done
            </Button>

          ) : (

            <Button
              fullWidth
              variant="contained"
              onClick={
                handleConfirmBooking
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
                  : null
              }
              sx={{
                backgroundColor:
                  '#00A8FF',

                color:
                  '#0D1527',

                py:
                  1.2,

                fontWeight:
                  700
              }}
            >
              {
                loading
                  ? 'Booking...'
                  : 'Confirm booking'
              }
            </Button>
          )}

        </DialogActions>

      </Dialog>

    </Box>
  );
};