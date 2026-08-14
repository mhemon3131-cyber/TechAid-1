import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography
} from '@mui/material';

import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  Star
} from 'lucide-react';

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import {
  getServiceRequests
} from '../services/api';

import {
  acceptAutomaticTechnician,
  assignAutomaticBestTechnician,
  getAutomaticLatestAssignment,
  rejectAutomaticTechnician,
  saveAssignmentRequestLocation
} from '../services/assignmentApi';


// ==========================================================
// LEAFLET MARKER FIX
// ==========================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});


// ==========================================================
// MAP AUTO FIT
// ==========================================================

const AssignmentMapController = ({
  customerLocation,
  technicianLocation
}) => {
  const map = useMap();

  useEffect(() => {
    if (
      !customerLocation ||
      !technicianLocation
    ) {
      return;
    }

    const bounds =
      L.latLngBounds([
        [
          Number(customerLocation.latitude),
          Number(customerLocation.longitude)
        ],
        [
          Number(technicianLocation.latitude),
          Number(technicianLocation.longitude)
        ]
      ]);

    map.fitBounds(
      bounds,
      {
        padding: [45, 45]
      }
    );

  }, [
    map,
    customerLocation,
    technicianLocation
  ]);

  return null;
};


// ==========================================================
// MAIN PAGE
// ==========================================================

export const TechnicianAssignment = ({
  currentUser,
  onSearchTechnicians
}) => {

  const [
    serviceRequest,
    setServiceRequest
  ] = useState(null);


  const [
    customerLocation,
    setCustomerLocation
  ] = useState(null);


  const [
    assignmentData,
    setAssignmentData
  ] = useState(null);


  const [
    pageLoading,
    setPageLoading
  ] = useState(true);


  const [
    autoAssigning,
    setAutoAssigning
  ] = useState(false);


  const [
    accepting,
    setAccepting
  ] = useState(false);


  const [
    rejecting,
    setRejecting
  ] = useState(false);


  const [
    noMoreMatches,
    setNoMoreMatches
  ] = useState(false);


  const [
    error,
    setError
  ] = useState('');


  const [
    message,
    setMessage
  ] = useState('');


  const initializedRequestId =
    useRef(null);


  // ========================================================
  // CUSTOMER LOCATION
  // ========================================================

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          'techaid_customer_location'
        );

      if (stored) {
        setCustomerLocation(
          JSON.parse(stored)
        );
      }

    } catch (err) {
      console.log(
        'Customer location error:',
        err.message
      );
    }
  }, []);


  // ========================================================
  // LOAD LATEST CUSTOMER REQUEST
  // ========================================================

  useEffect(() => {

    const loadRequest =
      async () => {

        if (!currentUser?.id) {
          return;
        }


        setPageLoading(true);
        setError('');


        try {

          const response =
            await getServiceRequests();


          const requests =
            response?.data || [];


          const mine =
            requests.filter(
              (request) =>
                request.customerId ===
                currentUser.id
            );


          if (
            mine.length === 0
          ) {
            setError(
              'No service request found. Please create a service request first.'
            );

            return;
          }


          mine.sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          );


          setServiceRequest(
            mine[0]
          );

        } catch (err) {

          console.error(err);

          setError(
            'Unable to load your service request.'
          );

        } finally {

          setPageLoading(false);
        }
      };


    loadRequest();

  }, [currentUser]);


  // ========================================================
  // SAVE CUSTOMER LOCATION TO CURRENT REQUEST
  // ========================================================

  const syncCustomerLocation =
    async () => {

      if (
        !serviceRequest ||
        !customerLocation
      ) {
        throw new Error(
          'Customer location is not available.'
        );
      }


      const address =
        typeof customerLocation.displayName ===
          'string'
          ? customerLocation.displayName
          : customerLocation.address || null;


      await saveAssignmentRequestLocation(
        serviceRequest.id,
        customerLocation.latitude,
        customerLocation.longitude,
        address
      );
    };


  // ========================================================
  // INITIAL AUTOMATIC ASSIGNMENT
  // ========================================================

  useEffect(() => {

    if (
      !serviceRequest ||
      !customerLocation
    ) {
      return;
    }


    if (
      initializedRequestId.current ===
      serviceRequest.id
    ) {
      return;
    }


    initializedRequestId.current =
      serviceRequest.id;


    const startAssignment =
      async () => {

        setAutoAssigning(true);

        setError('');

        setMessage('');


        try {

          await syncCustomerLocation();


          // ----------------------------------------------
          // Existing assignment check
          // ----------------------------------------------

          try {

            const existing =
              await getAutomaticLatestAssignment(
                serviceRequest.id
              );


            const existingStatus =
              existing?.data?.assignment
                ?.status;


            if (
              existing?.success &&
              (
                existingStatus ===
                  'PENDING_CUSTOMER_APPROVAL' ||
                existingStatus ===
                  'ACCEPTED'
              )
            ) {

              setAssignmentData(
                existing.data
              );

              return;
            }

          } catch {
            // No existing assignment.
          }


          // ----------------------------------------------
          // Create automatic assignment
          // ----------------------------------------------

          const response =
            await assignAutomaticBestTechnician(
              serviceRequest.id
            );


          if (response?.success) {

            setAssignmentData(
              response.data
            );

            setMessage(
              'Best available technician selected automatically.'
            );
          }

        } catch (err) {

          const data =
            err?.response?.data;


          if (
            data?.noMoreAutomaticMatches
          ) {
            setNoMoreMatches(true);
          }


          setError(
            data?.message ||
            err.message ||
            'Automatic technician assignment failed.'
          );

        } finally {

          setAutoAssigning(false);
        }
      };


    startAssignment();

  }, [
    serviceRequest,
    customerLocation
  ]);


  // ========================================================
  // ACCEPT TECHNICIAN
  // ========================================================

  const handleAccept =
    async () => {

      if (!serviceRequest) {
        return;
      }


      setAccepting(true);

      setError('');

      setMessage('');


      try {

        const response =
          await acceptAutomaticTechnician(
            serviceRequest.id
          );


        if (response?.success) {

          const latest =
            await getAutomaticLatestAssignment(
              serviceRequest.id
            );


          setAssignmentData(
            latest.data
          );


          setMessage('');
        }

      } catch (err) {

        setError(
          err?.response?.data?.message ||
          'Unable to accept technician.'
        );

      } finally {

        setAccepting(false);
      }
    };


  // ========================================================
  // REJECT -> NEXT BEST
  // ========================================================

  const handleReject =
    async () => {

      if (!serviceRequest) {
        return;
      }


      setRejecting(true);

      setError('');

      setMessage('');

      setNoMoreMatches(false);


      try {

        // Current technician reject
        await rejectAutomaticTechnician(
          serviceRequest.id
        );


        // Next best technician
        const response =
          await assignAutomaticBestTechnician(
            serviceRequest.id
          );


        setAssignmentData(
          response.data
        );


        setMessage(
          'Next best available technician has been suggested.'
        );

      } catch (err) {

        const data =
          err?.response?.data;


        setAssignmentData(null);


        if (
          data?.noMoreAutomaticMatches ||
          err?.response?.status === 404
        ) {
          setNoMoreMatches(true);
        }


        setError(
          data?.message ||
          'No more automatic technician matches are available.'
        );

      } finally {

        setRejecting(false);
      }
    };


  // ========================================================
  // NORMALIZED DATA
  // ========================================================

  const assignment =
    assignmentData?.assignment ||
    null;


  const technician =
    assignmentData?.technician ||
    null;


  const schedule =
    assignmentData?.autoSchedule ||
    assignmentData?.schedule ||
    {
      date:
        assignment?.assignedDate,

      timeSlot:
        assignment?.assignedTimeSlot
    };


  const technicianLocation =
    technician?.location ||
    assignmentData?.technicianLocation ||
    null;


  const finalCustomerLocation =
    assignmentData?.customerLocation ||
    customerLocation ||
    null;


  const accepted =
    assignment?.status ===
    'ACCEPTED';


  const fee =
    technician?.charge?.label ||
    (
      technician?.charge?.amount !==
        undefined
        ? `৳${technician.charge.amount}`
        : 'N/A'
    );


  const distance =
    assignment?.distanceKm ??
    assignmentData?.distance?.km ??
    null;


  const locationText =
    finalCustomerLocation?.address ||
    finalCustomerLocation?.displayName ||
    (
      finalCustomerLocation?.latitude &&
      finalCustomerLocation?.longitude
        ? `${Number(
            finalCustomerLocation.latitude
          ).toFixed(5)}, ${Number(
            finalCustomerLocation.longitude
          ).toFixed(5)}`
        : 'Location not available'
    );


  // ========================================================
  // LOADING
  // ========================================================

  if (pageLoading) {

    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#0D1527',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }


  // ========================================================
  // PAGE
  // ========================================================

  return (

    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0D1527',
        color: '#FFFFFF',
        p: {
          xs: 2,
          md: 4
        }
      }}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <Typography
        variant="caption"
        sx={{
          color:
            accepted
              ? '#10B981'
              : '#00A8FF',

          fontWeight: 800
        }}
      >
        {
          accepted
            ? 'SERVICE CONFIRMATION'
            : 'AUTOMATIC TECHNICIAN ASSIGNMENT'
        }
      </Typography>


      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mt: 0.5
        }}
      >
        {
          accepted
            ? 'Service Confirmed'
            : 'Best Technician Match'
        }
      </Typography>


      <Typography
        sx={{
          color: '#94A3B8',
          mt: 0.5,
          mb: 3
        }}
      >
        {
          accepted
            ? 'Your technician and service schedule have been confirmed.'
            : 'The system automatically finds the most suitable available technician and service time.'
        }
      </Typography>


      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2
          }}
        >
          {error}
        </Alert>
      )}


      {/* SUCCESS MESSAGE BEFORE ACCEPT */}

      {message && !accepted && (
        <Alert
          severity="success"
          sx={{
            mb: 2
          }}
        >
          {message}
        </Alert>
      )}


      {/* ===================================================
          ACCEPTED / CONFIRMED VIEW
      =================================================== */}

      {accepted && technician && (

        <Paper
          elevation={0}
          sx={{
            maxWidth: 1050,
            backgroundColor: '#172036',
            border: '1px solid #10B981',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >

          {/* CONFIRMED HEADER */}

          <Box
            sx={{
              p: 3,
              backgroundColor:
                'rgba(16,185,129,.08)',
              borderBottom:
                '1px solid rgba(16,185,129,.25)'
            }}
          >

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >

              <CheckCircle2
                size={32}
                color="#10B981"
              />

              <Box>

                <Typography
                  variant="h5"
                  sx={{
                    color: '#10B981',
                    fontWeight: 800
                  }}
                >
                  Service Confirmed
                </Typography>


                <Typography
                  variant="body2"
                  sx={{
                    color: '#94A3B8',
                    mt: 0.3
                  }}
                >
                  Your technician has been confirmed for this service.
                </Typography>

              </Box>

            </Box>

          </Box>


          <Box sx={{ p: 3 }}>

            {/* ===============================================
                2. TECHNICIAN NAME
                3. SPECIALTY
            =============================================== */}

            <Box
              sx={{
                mb: 3
              }}
            >

              <Typography
                variant="caption"
                sx={{
                  color: '#64748B'
                }}
              >
                TECHNICIAN
              </Typography>


              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mt: 0.5
                }}
              >
                {technician.name}
              </Typography>


              <Typography
                sx={{
                  color: '#38BDF8',
                  mt: 0.5,
                  fontWeight: 600
                }}
              >
                {
                  technician.specialty ||
                  'Technical Specialist'
                }
              </Typography>

            </Box>


            <Divider
              sx={{
                borderColor: '#2A364F',
                mb: 3
              }}
            />


            <Grid
              container
              spacing={3}
            >

              {/* =============================================
                  4. RATING
              ============================================= */}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Rating
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    mt: 0.5
                  }}
                >

                  <Star
                    size={18}
                    fill="currentColor"
                  />

                  <Typography
                    fontWeight={800}
                  >
                    {
                      technician.rating ||
                      'N/A'
                    } / 5
                  </Typography>

                </Box>

              </Grid>


              {/* =============================================
                  5. PHONE
              ============================================= */}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Phone
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    mt: 0.5
                  }}
                >

                  <Phone
                    size={17}
                    color="#10B981"
                  />

                  <Typography
                    fontWeight={700}
                  >
                    {
                      technician.phone ||
                      'N/A'
                    }
                  </Typography>

                </Box>

              </Grid>


              {/* =============================================
                  5. EMAIL
              ============================================= */}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Email
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    mt: 0.5
                  }}
                >

                  <Mail
                    size={17}
                    color="#38BDF8"
                  />

                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak: 'break-word'
                    }}
                  >
                    {
                      technician.email ||
                      'N/A'
                    }
                  </Typography>

                </Box>

              </Grid>


              {/* =============================================
                  6. SERVICE FEE
              ============================================= */}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Service Fee
                </Typography>


                <Typography
                  variant="h6"
                  sx={{
                    color: '#10B981',
                    fontWeight: 800,
                    mt: 0.3
                  }}
                >
                  {fee}
                </Typography>

              </Grid>


              {/* =============================================
                  7. SERVICE DATE
              ============================================= */}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Service Date
                </Typography>


                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 800,
                    mt: 0.5
                  }}
                >
                  {
                    schedule?.date ||
                    'N/A'
                  }
                </Typography>

              </Grid>


              {/* =============================================
                  8. SERVICE TIME
              ============================================= */}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Service Time
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    mt: 0.5
                  }}
                >

                  <Clock
                    size={17}
                    color="#00A8FF"
                  />

                  <Typography
                    fontWeight={800}
                  >
                    {
                      schedule?.timeSlot ||
                      schedule?.time ||
                      'N/A'
                    }
                  </Typography>

                </Box>

              </Grid>


              {/* =============================================
                  9. DISTANCE
              ============================================= */}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Distance
                </Typography>


                <Typography
                  fontWeight={800}
                  sx={{
                    mt: 0.5
                  }}
                >
                  {
                    distance !==
                    null
                      ? `${Number(
                          distance
                        ).toFixed(2)} km`
                      : 'N/A'
                  }
                </Typography>

              </Grid>


              {/* =============================================
                  9. LOCATION
              ============================================= */}

              <Grid
                item
                xs={12}
                md={8}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Service Location
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.7,
                    mt: 0.5
                  }}
                >

                  <MapPin
                    size={18}
                    color="#10B981"
                    style={{
                      marginTop: 2,
                      flexShrink: 0
                    }}
                  />

                  <Typography
                    fontWeight={700}
                  >
                    {locationText}
                  </Typography>

                </Box>

              </Grid>

            </Grid>

          </Box>

        </Paper>
      )}


      {/* ===================================================
          BEFORE ACCEPT - SERVICE REQUEST
      =================================================== */}

      {!accepted &&
      serviceRequest && (

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: '#172036',
            border: '1px solid #2A364F',
            borderRadius: 3
          }}
        >

          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              fontWeight: 700
            }}
          >
            CURRENT SERVICE REQUEST
          </Typography>


          <Typography
            variant="h5"
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              mt: 1
            }}
          >
            {
              serviceRequest.deviceCategory
            } Support
          </Typography>


          <Typography
            sx={{
              color: '#CBD5E1',
              mt: 1
            }}
          >
            {
              serviceRequest.description ||
              serviceRequest.title
            }
          </Typography>


          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              mt: 2
            }}
          >

            <Chip
              label={
                serviceRequest.deviceCategory
              }
              sx={{
                color: '#00A8FF',
                backgroundColor:
                  'rgba(0,168,255,.15)'
              }}
            />


            <Chip
              label={
                serviceRequest.urgency
              }
              sx={{
                color: '#EF4444',
                backgroundColor:
                  'rgba(239,68,68,.15)'
              }}
            />


            <Chip
              label={
                serviceRequest.serviceMethod
              }
              sx={{
                color: '#FFFFFF',
                backgroundColor:
                  '#0F172A'
              }}
            />

          </Box>

        </Paper>
      )}


      {/* ===================================================
          AUTO MATCHING LOADER
      =================================================== */}

      {!accepted &&
      autoAssigning && (

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            textAlign: 'center',
            backgroundColor: '#172036',
            border: '1px solid #00A8FF',
            borderRadius: 3
          }}
        >

          <CircularProgress />


          <Typography
            variant="h6"
            sx={{
              mt: 2,
              fontWeight: 800
            }}
          >
            Finding Best Technician
          </Typography>


          <Typography
            sx={{
              color: '#94A3B8',
              mt: 1
            }}
          >
            Checking technician availability and service suitability...
          </Typography>

        </Paper>
      )}


      {/* ===================================================
          BEFORE ACCEPT - TECHNICIAN SUGGESTION
      =================================================== */}

      {!accepted &&
      !autoAssigning &&
      technician && (

        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#172036',
            border: '1px solid #00A8FF',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >

          <Box sx={{ p: 3 }}>

            {/* TECH HEADER */}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}
            >

              <Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#00A8FF',
                    fontWeight: 800
                  }}
                >
                  ★ BEST AVAILABLE MATCH
                </Typography>


                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mt: 0.5
                  }}
                >
                  {technician.name}
                </Typography>


                <Typography
                  sx={{
                    color: '#38BDF8',
                    mt: 0.5
                  }}
                >
                  {technician.specialty}
                </Typography>

              </Box>


              <Box
                sx={{
                  backgroundColor: '#0F172A',
                  px: 2,
                  py: 1.2,
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#94A3B8'
                  }}
                >
                  MATCH SCORE
                </Typography>


                <Typography
                  variant="h5"
                  sx={{
                    color: '#10B981',
                    fontWeight: 800
                  }}
                >
                  {
                    Number(
                      assignment?.totalScore ||
                      0
                    ).toFixed(1)
                  }%
                </Typography>

              </Box>

            </Box>


            {/* AUTO SERVICE TIME */}

            <Paper
              elevation={0}
              sx={{
                mt: 2.5,
                p: 2,
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: 2
              }}
            >

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >

                <Clock
                  size={20}
                  color="#10B981"
                />


                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B'
                    }}
                  >
                    AUTOMATIC AVAILABLE SERVICE TIME
                  </Typography>


                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800
                    }}
                  >
                    {
                      schedule?.date
                    }
                    {' • '}
                    {
                      schedule?.timeSlot ||
                      schedule?.time
                    }
                  </Typography>

                </Box>

              </Box>

            </Paper>


            <Divider
              sx={{
                my: 2.5,
                borderColor: '#2A364F'
              }}
            />


            {/* TECHNICIAN DETAILS */}

            <Grid
              container
              spacing={2.5}
            >

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Rating
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >

                  <Star
                    size={17}
                    fill="currentColor"
                  />


                  <Typography
                    fontWeight={700}
                  >
                    {
                      technician.rating
                    } / 5
                  </Typography>

                </Box>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Phone
                </Typography>


                <Typography
                  fontWeight={700}
                >
                  {
                    technician.phone ||
                    'N/A'
                  }
                </Typography>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Email
                </Typography>


                <Typography
                  fontWeight={700}
                >
                  {
                    technician.email ||
                    'N/A'
                  }
                </Typography>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Service Fee
                </Typography>


                <Typography
                  sx={{
                    color: '#10B981',
                    fontWeight: 800
                  }}
                >
                  {fee}
                </Typography>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Distance
                </Typography>


                <Typography
                  fontWeight={700}
                >
                  {
                    distance !== null
                      ? `${Number(
                          distance
                        ).toFixed(2)} km`
                      : 'N/A'
                  }
                </Typography>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
                md={4}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Working Hours
                </Typography>


                <Typography
                  fontWeight={700}
                >
                  {
                    technician.workingHours ||
                    'N/A'
                  }
                </Typography>

              </Grid>


              <Grid
                item
                xs={12}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Available Days
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    mt: 0.7
                  }}
                >

                  {
                    technician.availableDays
                      ?.map(
                        (day) => (

                          <Chip
                            key={day}
                            size="small"
                            label={day}
                            sx={{
                              color: '#FFFFFF',
                              backgroundColor:
                                '#0F172A'
                            }}
                          />

                        )
                      )
                  }

                </Box>

              </Grid>


              <Grid
                item
                xs={12}
              >

                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B'
                  }}
                >
                  Service Areas
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    mt: 0.7
                  }}
                >

                  {
                    technician.serviceAreas
                      ?.map(
                        (area) => (

                          <Chip
                            key={area}
                            size="small"
                            label={area}
                            sx={{
                              color: '#38BDF8',
                              backgroundColor:
                                'rgba(0,168,255,.12)'
                            }}
                          />

                        )
                      )
                  }

                </Box>

              </Grid>

            </Grid>

          </Box>


          {/* =================================================
              MAP BEFORE ACCEPT
          ================================================= */}

          {finalCustomerLocation &&
          technicianLocation && (

            <Box
              sx={{
                height: 320,
                borderTop:
                  '1px solid #2A364F'
              }}
            >

              <MapContainer
                center={[
                  Number(
                    finalCustomerLocation.latitude
                  ),
                  Number(
                    finalCustomerLocation.longitude
                  )
                ]}
                zoom={12}
                style={{
                  height: '100%',
                  width: '100%'
                }}
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                <AssignmentMapController
                  customerLocation={
                    finalCustomerLocation
                  }
                  technicianLocation={
                    technicianLocation
                  }
                />


                <Marker
                  position={[
                    Number(
                      finalCustomerLocation.latitude
                    ),
                    Number(
                      finalCustomerLocation.longitude
                    )
                  ]}
                >
                  <Popup>
                    Customer Location
                  </Popup>
                </Marker>


                <Marker
                  position={[
                    Number(
                      technicianLocation.latitude
                    ),
                    Number(
                      technicianLocation.longitude
                    )
                  ]}
                >
                  <Popup>
                    {technician.name}
                  </Popup>
                </Marker>


                <Polyline
                  positions={[
                    [
                      Number(
                        finalCustomerLocation.latitude
                      ),
                      Number(
                        finalCustomerLocation.longitude
                      )
                    ],

                    [
                      Number(
                        technicianLocation.latitude
                      ),
                      Number(
                        technicianLocation.longitude
                      )
                    ]
                  ]}
                />

              </MapContainer>

            </Box>
          )}


          {/* =================================================
              CUSTOMER ACTION BUTTONS
          ================================================= */}

          <Box
            sx={{
              p: 3,
              backgroundColor: '#0F172A',
              borderTop:
                '1px solid #2A364F'
            }}
          >

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5
              }}
            >

              {/* ACCEPT */}

              <Button
                variant="contained"
                onClick={
                  handleAccept
                }
                disabled={
                  accepting ||
                  rejecting
                }
                startIcon={
                  accepting
                    ? (
                      <CircularProgress
                        size={17}
                        color="inherit"
                      />
                    )
                    : (
                      <CheckCircle2
                        size={18}
                      />
                    )
                }
                sx={{
                  flex: 1,
                  minWidth: 220,
                  backgroundColor: '#10B981',
                  color: '#07110D',
                  fontWeight: 800,
                  py: 1.3
                }}
              >
                {
                  accepting
                    ? 'Accepting...'
                    : 'Accept Technician'
                }
              </Button>


              {/* REJECT */}

              <Button
                variant="outlined"
                onClick={
                  handleReject
                }
                disabled={
                  accepting ||
                  rejecting
                }
                startIcon={
                  rejecting
                    ? (
                      <CircularProgress
                        size={17}
                      />
                    )
                    : (
                      <RefreshCcw
                        size={18}
                      />
                    )
                }
                sx={{
                  flex: 1,
                  minWidth: 220,
                  borderColor: '#EF4444',
                  color: '#EF4444',
                  fontWeight: 800,
                  py: 1.3
                }}
              >
                {
                  rejecting
                    ? 'Finding Next Best...'
                    : 'Reject & Suggest Another'
                }
              </Button>

            </Box>


            {/* MANUAL SEARCH */}

            <Button
              fullWidth
              variant="outlined"
              startIcon={
                <Search
                  size={18}
                />
              }
              onClick={() => {

                if (
                  onSearchTechnicians
                ) {
                  onSearchTechnicians();
                }

              }}
              sx={{
                mt: 1.5,
                borderColor: '#00A8FF',
                color: '#00A8FF',
                fontWeight: 800,
                py: 1.2
              }}
            >
              Search Technician Info
            </Button>

          </Box>

        </Paper>
      )}


      {/* ===================================================
          NO MORE MATCHES
      =================================================== */}

      {!accepted &&
      !autoAssigning &&
      !technician &&
      noMoreMatches && (

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            backgroundColor: '#172036',
            border: '1px solid #2A364F',
            borderRadius: 3
          }}
        >

          <Typography
            variant="h6"
            fontWeight={800}
          >
            No More Automatic Matches
          </Typography>


          <Typography
            sx={{
              color: '#94A3B8',
              mt: 1,
              mb: 2
            }}
          >
            You can search and view technician information manually.
          </Typography>


          <Button
            variant="outlined"
            startIcon={
              <Search
                size={18}
              />
            }
            onClick={() => {

              if (
                onSearchTechnicians
              ) {
                onSearchTechnicians();
              }

            }}
          >
            Search Technician Info
          </Button>

        </Paper>
      )}

    </Box>
  );
};