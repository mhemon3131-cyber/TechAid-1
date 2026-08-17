import React, {
  useEffect,
  useState
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Slider,
  Switch,
  Typography
} from '@mui/material';

import {
  Calendar,
  Clock,
  MapPin,
  Save,
  Shield,
  Users
} from 'lucide-react';

import axios from 'axios';


export const TechnicianAvailability = ({
  currentUser
}) => {

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    saving,
    setSaving
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
  // AVAILABILITY STATE
  // ========================================================

  const [
    isAvailable,
    setIsAvailable
  ] = useState(true);

  const [
    selectedDays,
    setSelectedDays
  ] = useState([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri'
  ]);

  const [
    workingHours,
    setWorkingHours
  ] = useState(
    '09:00 AM - 06:00 PM'
  );

  const [
    serviceAreas,
    setServiceAreas
  ] = useState([
    'Gulshan',
    'Banani',
    'Dhanmondi',
    'Uttara'
  ]);

  const [
    maxAppointments,
    setMaxAppointments
  ] = useState(5);


  const allDays = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
  ];


  const allHoursOptions = [
    '08:00 AM - 04:00 PM',
    '09:00 AM - 06:00 PM',
    '10:00 AM - 07:00 PM',
    '12:00 PM - 09:00 PM'
  ];


  const allAreasOptions = [
    'Gulshan',
    'Banani',
    'Dhanmondi',
    'Uttara',
    'Mohakhali',
    'Mirpur',
    'Bhashani',
    'Baridhara'
  ];


  // ========================================================
  // REMOVE DUPLICATE / EMPTY SERVICE AREAS
  // ========================================================

  const cleanServiceAreas =
    (areas = []) => {

      const list =
        Array.isArray(
          areas
        )
          ? areas
          : String(
              areas || ''
            ).split(',');


      return [
        ...new Set(
          list
            .map(
              (area) =>
                String(
                  area
                ).trim()
            )
            .filter(Boolean)
        )
      ];
    };


  // ========================================================
  // LOAD AVAILABILITY
  // ========================================================

  useEffect(() => {

    fetchAvailability();

  }, [currentUser]);


  const fetchAvailability =
    async () => {

      setLoading(
        true
      );

      setError('');


      try {

        const techId =
          currentUser?.technicianId ||
          currentUser?.id ||
          'tech-1';


        const res =
          await axios.get(
            `http://localhost:5000/api/technicians/availability/${techId}`
          );


        if (
          res.data.success
        ) {

          const data =
            res.data.data;


          setIsAvailable(
            data.isAvailable
          );


          setSelectedDays(
            data.availableDays ||
            [
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri'
            ]
          );


          setWorkingHours(
            data.workingHours ||
            '09:00 AM - 06:00 PM'
          );


          setServiceAreas(
            cleanServiceAreas(
              data.serviceAreas ||
              []
            )
          );


          setMaxAppointments(
            data.maxDailyAppointments ||
            5
          );
        }


      } catch (err) {

        console.warn(
          'Availability fetch error:',
          err
        );


        setError(
          err?.response?.data?.message ||
          'Unable to load technician availability.'
        );


      } finally {

        setLoading(
          false
        );
      }
    };


  // ========================================================
  // DAY TOGGLE
  // ========================================================

  const handleDayToggle =
    (day) => {

      if (
        selectedDays.includes(
          day
        )
      ) {

        setSelectedDays(
          selectedDays.filter(
            (selectedDay) =>
              selectedDay !==
              day
          )
        );

      } else {

        setSelectedDays([
          ...selectedDays,
          day
        ]);
      }
    };


  // ========================================================
  // AREA TOGGLE
  // ========================================================

  const handleAreaToggle =
    (area) => {

      const cleanAreas =
        cleanServiceAreas(
          serviceAreas
        );


      if (
        cleanAreas.includes(
          area
        )
      ) {

        setServiceAreas(
          cleanAreas.filter(
            (selectedArea) =>
              selectedArea !==
              area
          )
        );

      } else {

        setServiceAreas(
          cleanServiceAreas([
            ...cleanAreas,
            area
          ])
        );
      }
    };


  // ========================================================
  // SAVE
  // ========================================================

  const handleSave =
    async () => {

      setSaving(
        true
      );

      setMsg('');

      setError('');


      const latestServiceAreas =
        cleanServiceAreas(
          serviceAreas
        );


      const payload = {

        isAvailable,

        availableDays:
          selectedDays,

        workingHours,

        serviceAreas:
          latestServiceAreas,

        maxDailyAppointments:
          maxAppointments
      };


      try {

        const techId =
          currentUser?.technicianId ||
          currentUser?.id ||
          'tech-1';


        const res =
          await axios.put(
            `http://localhost:5000/api/technicians/availability/${techId}`,
            payload
          );


        if (
          res.data.success
        ) {

          setServiceAreas(
            cleanServiceAreas(
              res.data.data
                ?.serviceAreas ||
              latestServiceAreas
            )
          );


          setMsg(
            'Technician working schedule updated in database!'
          );
        }


      } catch (err) {

        console.error(
          'Availability save error:',
          err
        );


        setError(
          err?.response?.data?.message ||
          'Unable to save technician schedule.'
        );


      } finally {

        setSaving(
          false
        );
      }
    };


  // ========================================================
  // PAGE
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

      {/* =================================================
          HEADER
      ================================================= */}

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
          Technician Availability Management
        </Typography>


        <Typography
          variant="body2"
          sx={{
            color:
              '#94A3B8'
          }}
        >
          Configuring schedule for:{' '}

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
        </Typography>

      </Box>


      {/* =================================================
          SUCCESS
      ================================================= */}

      {msg && (

        <Alert
          severity="success"
          sx={{
            mb:
              3,

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
          ERROR
      ================================================= */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb:
              3,

            backgroundColor:
              'rgba(239, 68, 68, 0.15)',

            color:
              '#EF4444'
          }}
        >
          {error}
        </Alert>
      )}


      {loading ? (

        <CircularProgress
          color="primary"
        />

      ) : (

        <Grid
          container
          spacing={4}
          sx={{
            maxWidth:
              950
          }}
        >

          {/* =================================================
              LEFT CONFIG
          ================================================= */}

          <Grid
            item
            xs={12}
            md={8}
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

              {/* =============================================
                  ONLINE STATUS
              ============================================= */}

              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'space-between',

                  mb:
                    3,

                  p:
                    2,

                  backgroundColor:
                    '#0F172A',

                  borderRadius:
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
                      1.5
                  }}
                >

                  <Shield
                    size={22}
                    color={
                      isAvailable
                        ? '#10B981'
                        : '#EF4444'
                    }
                  />


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
                      Service Availability Status
                    </Typography>


                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          '#94A3B8'
                      }}
                    >
                      {
                        isAvailable
                          ? 'Active — Accepting customer bookings'
                          : 'Inactive — Temporarily offline'
                      }
                    </Typography>

                  </Box>

                </Box>


                <FormControlLabel
                  control={

                    <Switch
                      checked={
                        isAvailable
                      }
                      onChange={(event) =>
                        setIsAvailable(
                          event.target.checked
                        )
                      }
                      color="primary"
                    />
                  }
                  label=""
                />

              </Box>


              <Divider
                sx={{
                  borderColor:
                    '#2A364F',

                  my:
                    3
                }}
              />


              {/* =============================================
                  AVAILABLE DAYS
              ============================================= */}

              <Typography
                variant="body2"
                sx={{
                  color:
                    '#94A3B8',

                  fontWeight:
                    600,

                  mb:
                    1.5,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    1
                }}
              >
                <Calendar
                  size={18}
                  color="#00A8FF"
                />

                Available Days
              </Typography>


              <Box
                sx={{
                  display:
                    'flex',

                  gap:
                    1,

                  flexWrap:
                    'wrap',

                  mb:
                    4
                }}
              >

                {allDays.map(
                  (day) => {

                    const selected =
                      selectedDays.includes(
                        day
                      );


                    return (

                      <Button
                        key={
                          day
                        }
                        onClick={() =>
                          handleDayToggle(
                            day
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

                          fontWeight:
                            700,

                          px:
                            2.5,

                          py:
                            1,

                          '&:hover':
                            {
                              backgroundColor:
                                selected
                                  ? '#00A8FF'
                                  : '#1E293B'
                            }
                        }}
                      >
                        {day}
                      </Button>
                    );
                  }
                )}

              </Box>


              {/* =============================================
                  WORKING HOURS
              ============================================= */}

              <Typography
                variant="body2"
                sx={{
                  color:
                    '#94A3B8',

                  fontWeight:
                    600,

                  mb:
                    1.5,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    1
                }}
              >
                <Clock
                  size={18}
                  color="#00A8FF"
                />

                Working Hours
              </Typography>


              <Grid
                container
                spacing={1.5}
                sx={{
                  mb:
                    4
                }}
              >

                {allHoursOptions.map(
                  (hours) => {

                    const selected =
                      workingHours ===
                      hours;


                    return (

                      <Grid
                        item
                        xs={6}
                        key={
                          hours
                        }
                      >

                        <Button
                          fullWidth
                          onClick={() =>
                            setWorkingHours(
                              hours
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

                            py:
                              1.2,

                            fontWeight:
                              600,

                            fontSize:
                              '0.85rem',

                            '&:hover':
                              {
                                backgroundColor:
                                  selected
                                    ? 'rgba(0, 168, 255, 0.25)'
                                    : '#1E293B'
                              }
                          }}
                        >
                          {hours}
                        </Button>

                      </Grid>
                    );
                  }
                )}

              </Grid>


              {/* =============================================
                  SERVICE AREAS
              ============================================= */}

              <Typography
                variant="body2"
                sx={{
                  color:
                    '#94A3B8',

                  fontWeight:
                    600,

                  mb:
                    1.5,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    1
                }}
              >
                <MapPin
                  size={18}
                  color="#00A8FF"
                />

                Supported Service Areas
              </Typography>


              <Box
                sx={{
                  display:
                    'flex',

                  gap:
                    1,

                  flexWrap:
                    'wrap',

                  mb:
                    4
                }}
              >

                {allAreasOptions.map(
                  (area) => {

                    const selected =
                      cleanServiceAreas(
                        serviceAreas
                      ).includes(
                        area
                      );


                    return (

                      <Chip
                        key={
                          area
                        }
                        label={
                          area
                        }
                        onClick={() =>
                          handleAreaToggle(
                            area
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

                          fontWeight:
                            600,

                          py:
                            2,

                          px:
                            1,

                          cursor:
                            'pointer'
                        }}
                      />
                    );
                  }
                )}

              </Box>


              {/* =============================================
                  MAX DAILY APPOINTMENTS
              ============================================= */}

              <Typography
                variant="body2"
                sx={{
                  color:
                    '#94A3B8',

                  fontWeight:
                    600,

                  mb:
                    1.5,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    1
                }}
              >
                <Users
                  size={18}
                  color="#00A8FF"
                />

                Maximum Daily Appointments Limit
              </Typography>


              <Box
                sx={{
                  px:
                    2,

                  py:
                    2,

                  backgroundColor:
                    '#0F172A',

                  borderRadius:
                    2,

                  mb:
                    4
                }}
              >

                <Typography
                  variant="h6"
                  sx={{
                    color:
                      '#00A8FF',

                    fontWeight:
                      700,

                    textAlign:
                      'center',

                    mb:
                      1
                  }}
                >
                  {maxAppointments} Appointments / Day
                </Typography>


                <Slider
                  value={
                    maxAppointments
                  }
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(
                    _,
                    value
                  ) =>
                    setMaxAppointments(
                      value
                    )
                  }
                  sx={{
                    color:
                      '#00A8FF',

                    '& .MuiSlider-thumb':
                      {
                        backgroundColor:
                          '#00A8FF'
                      },

                    '& .MuiSlider-track':
                      {
                        backgroundColor:
                          '#00A8FF'
                      }
                  }}
                />

              </Box>


              {/* =============================================
                  SAVE
              ============================================= */}

              <Button
                variant="contained"
                fullWidth
                onClick={
                  handleSave
                }
                disabled={
                  saving
                }
                startIcon={
                  saving
                    ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    )
                    : (
                      <Save
                        size={18}
                      />
                    )
                }
                sx={{
                  backgroundColor:
                    '#00A8FF',

                  color:
                    '#0D1527',

                  py:
                    1.5,

                  fontWeight:
                    700,

                  fontSize:
                    '1rem',

                  '&:hover':
                    {
                      backgroundColor:
                        '#38BDF8'
                    }
                }}
              >
                {
                  saving
                    ? 'Saving Schedule...'
                    : 'Save Availability Config'
                }
              </Button>

            </Paper>

          </Grid>


          {/* =================================================
              SUMMARY
          ================================================= */}

          <Grid
            item
            xs={12}
            md={4}
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
                Schedule Summary
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

                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        '#94A3B8'
                    }}
                  >
                    Working Days
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
                      selectedDays.length >
                      0
                        ? selectedDays.join(
                            ', '
                          )
                        : 'No days selected'
                    }
                  </Typography>

                </Box>


                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        '#94A3B8'
                    }}
                  >
                    Shift Hours
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
                    {workingHours}
                  </Typography>

                </Box>


                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        '#94A3B8'
                    }}
                  >
                    Covered Neighborhoods
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
                      cleanServiceAreas(
                        serviceAreas
                      ).length >
                      0
                        ? cleanServiceAreas(
                            serviceAreas
                          ).join(
                            ', '
                          )
                        : 'No service area selected'
                    }
                  </Typography>

                </Box>


                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        '#94A3B8'
                    }}
                  >
                    Daily Capacity
                  </Typography>


                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        '#10B981',

                      fontWeight:
                        700
                    }}
                  >
                    Max {maxAppointments} slots / day
                  </Typography>

                </Box>

              </Box>

            </Paper>

          </Grid>

        </Grid>
      )}

    </Box>
  );
};