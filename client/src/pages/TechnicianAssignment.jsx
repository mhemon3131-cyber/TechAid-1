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
  LinearProgress,
  Paper,
  Typography
} from '@mui/material';

import {
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  Star,
  UserCheck,
  Wrench
} from 'lucide-react';

import {
  getServiceRequests
} from '../services/api';

import {
  acceptAutomaticTechnician,
  assignAutomaticBestTechnician,
  getAutomaticLatestAssignment,
  reassignAutomaticTechnician
} from '../services/assignmentApi';


// ==========================================================
// MODULE 1 - FEATURE 4
// AUTOMATIC TECHNICIAN ASSIGNMENT
//
// NO LOCATION
// NO MAP
// NO DISTANCE
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
    assignmentData,
    setAssignmentData
  ] = useState(null);


  const [
    pageLoading,
    setPageLoading
  ] = useState(true);


  const [
    assigning,
    setAssigning
  ] = useState(false);


  const [
    accepting,
    setAccepting
  ] = useState(false);


  const [
    reassigning,
    setReassigning
  ] = useState(false);


  const [
    error,
    setError
  ] = useState('');


  const [
    message,
    setMessage
  ] = useState('');


  const [
    noMoreMatches,
    setNoMoreMatches
  ] = useState(false);


  const initializedRequest =
    useRef(null);


  // ========================================================
  // LOAD CUSTOMER'S LATEST SERVICE REQUEST
  // ========================================================

  useEffect(() => {

    const loadLatestRequest =
      async () => {

        if (!currentUser?.id) {

          setPageLoading(false);

          setError(
            'Customer account information not found.'
          );

          return;
        }


        setPageLoading(true);
        setError('');


        try {

          const response =
            await getServiceRequests();


          const requests =
            response?.data || [];


          const customerRequests =
            requests
              .filter(
                request =>
                  request.customerId ===
                  currentUser.id
              )
              .sort(
                (a, b) =>
                  new Date(b.createdAt) -
                  new Date(a.createdAt)
              );


          if (
            customerRequests.length === 0
          ) {

            setError(
              'No service request found. Please create a service request first.'
            );

            return;
          }


          setServiceRequest(
            customerRequests[0]
          );


        } catch (err) {

          console.error(
            'Load request error:',
            err
          );


          setError(
            'Unable to load your service request.'
          );


        } finally {

          setPageLoading(false);
        }
      };


    loadLatestRequest();

  }, [
    currentUser
  ]);


  // ========================================================
  // LOAD EXISTING OR CREATE AUTOMATIC ASSIGNMENT
  // ========================================================

  useEffect(() => {

    if (!serviceRequest) {
      return;
    }


    if (
      initializedRequest.current ===
      serviceRequest.id
    ) {
      return;
    }


    initializedRequest.current =
      serviceRequest.id;


    const startAssignment =
      async () => {

        setAssigning(true);

        setError('');

        setMessage('');

        setNoMoreMatches(false);


        try {

          // ------------------------------------------
          // Check existing assignment first
          // ------------------------------------------

          try {

            const existing =
              await getAutomaticLatestAssignment(
                serviceRequest.id
              );


            const status =
              existing?.data
                ?.assignment
                ?.status;


            if (
              existing?.success &&
              (
                status ===
                  'PENDING_CUSTOMER_APPROVAL' ||
                status ===
                  'ACCEPTED'
              )
            ) {

              setAssignmentData(
                existing.data
              );

              return;
            }


          } catch {
            // No existing assignment
          }


          // ------------------------------------------
          // Create fresh automatic assignment
          // ------------------------------------------

          const response =
            await assignAutomaticBestTechnician(
              serviceRequest.id
            );


          if (response?.success) {

            setAssignmentData(
              response.data
            );


            setMessage(
              'The best available technician has been selected automatically.'
            );
          }


        } catch (err) {

          const responseData =
            err?.response?.data;


          if (
            responseData
              ?.noMoreAutomaticMatches
          ) {

            setNoMoreMatches(
              true
            );
          }


          setError(
            responseData?.message ||
            'Automatic technician assignment failed.'
          );


        } finally {

          setAssigning(
            false
          );
        }
      };


    startAssignment();

  }, [
    serviceRequest
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

          setAssignmentData(
            response.data
          );


          setMessage(
            'Technician accepted successfully. Your service request is now confirmed.'
          );
        }


      } catch (err) {

        setError(
          err?.response
            ?.data
            ?.message ||
          'Unable to accept technician.'
        );


      } finally {

        setAccepting(false);
      }
    };


  // ========================================================
  // REASSIGN / NEXT BEST TECHNICIAN
  // ========================================================

  const handleReassign =
    async () => {

      if (!serviceRequest) {
        return;
      }


      setReassigning(true);

      setError('');

      setMessage('');

      setNoMoreMatches(false);


      try {

        const response =
          await reassignAutomaticTechnician(
            serviceRequest.id
          );


        if (response?.success) {

          setAssignmentData(
            response.data
          );


          setMessage(
            'The previous technician was rejected. The next best technician has been selected.'
          );
        }


      } catch (err) {

        const responseData =
          err?.response?.data;


        if (
          responseData
            ?.noMoreAutomaticMatches
        ) {

          setNoMoreMatches(
            true
          );

          setAssignmentData(
            null
          );
        }


        setError(
          responseData?.message ||
          'No more suitable technicians are available.'
        );


      } finally {

        setReassigning(
          false
        );
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


  const scores =
    assignment?.scoreBreakdown ||
    {};


  const workload =
    assignment?.workload ||
    {};


  const accepted =
    assignment?.status ===
    'ACCEPTED';


  // ========================================================
  // LOADING SCREEN
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
  // MAIN PAGE
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

      {/* HEADER */}

      <Typography
        variant="caption"
        sx={{
          color:
            accepted
              ? '#10B981'
              : '#00A8FF',

          fontWeight: 800,
          letterSpacing: 1
        }}
      >
        MODULE 1 • FEATURE 4
      </Typography>


      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mt: 0.5
        }}
      >
        Automatic Technician Assignment
      </Typography>


      <Typography
        sx={{
          color: '#94A3B8',
          mt: 0.7,
          mb: 3
        }}
      >
        The system selects the most suitable technician using technical expertise,
        availability, current workload and service rating.
      </Typography>


      {/* ERROR */}

      {error && (

        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>

      )}


      {/* SUCCESS */}

      {message && (

        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>

      )}


      {/* ===================================================
          SERVICE REQUEST CARD
      =================================================== */}

      {serviceRequest && (

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
              fontWeight: 800
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
            {serviceRequest.title}
          </Typography>


          <Typography
            sx={{
              color: '#CBD5E1',
              mt: 1
            }}
          >
            {serviceRequest.description}
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
                serviceRequest
                  .trackingId
              }
              sx={{
                color: '#FFFFFF',
                backgroundColor: '#0F172A'
              }}
            />


            <Chip
              label={
                serviceRequest
                  .deviceCategory
              }
              sx={{
                color: '#00A8FF',
                backgroundColor:
                  'rgba(0,168,255,.12)'
              }}
            />


            <Chip
              label={
                serviceRequest
                  .urgency
              }
              sx={{
                color: '#F87171',
                backgroundColor:
                  'rgba(239,68,68,.12)'
              }}
            />


            <Chip
              label={
                serviceRequest
                  .serviceMethod
              }
              sx={{
                color: '#A78BFA',
                backgroundColor:
                  'rgba(167,139,250,.12)'
              }}
            />

          </Box>

        </Paper>
      )}


      {/* ===================================================
          ASSIGNMENT LOADER
      =================================================== */}

      {assigning && (

        <Paper
          elevation={0}
          sx={{
            p: 4,
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
            Checking expertise, availability, workload and rating...
          </Typography>

        </Paper>
      )}


      {/* ===================================================
          ASSIGNED TECHNICIAN
      =================================================== */}

      {!assigning &&
      technician &&
      assignment && (

        <Paper
          elevation={0}
          sx={{
            maxWidth: 1100,
            backgroundColor: '#172036',
            border:
              accepted
                ? '1px solid #10B981'
                : '1px solid #00A8FF',

            borderRadius: 3,
            overflow: 'hidden'
          }}
        >

          {/* TOP */}

          <Box
            sx={{
              p: 3,
              backgroundColor:
                accepted
                  ? 'rgba(16,185,129,.06)'
                  : 'rgba(0,168,255,.04)'
            }}
          >

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >

              <Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >

                  {accepted
                    ? (
                      <CheckCircle2
                        size={22}
                        color="#10B981"
                      />
                    )
                    : (
                      <UserCheck
                        size={22}
                        color="#00A8FF"
                      />
                    )
                  }


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
                    {accepted
                      ? 'CUSTOMER ACCEPTED'
                      : 'BEST AUTOMATIC MATCH'
                    }
                  </Typography>

                </Box>


                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mt: 1
                  }}
                >
                  {technician.name}
                </Typography>


                <Typography
                  sx={{
                    color: '#38BDF8',
                    fontWeight: 700,
                    mt: 0.5
                  }}
                >
                  {technician.specialty}
                </Typography>

              </Box>


              <Box
                sx={{
                  minWidth: 125,
                  p: 2,
                  backgroundColor: '#0F172A',
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
                  variant="h4"
                  sx={{
                    color: '#10B981',
                    fontWeight: 900
                  }}
                >
                  {Number(
                    assignment.totalScore ||
                    0
                  ).toFixed(1)}
                  %
                </Typography>

              </Box>

            </Box>

          </Box>


          <Divider
            sx={{
              borderColor: '#2A364F'
            }}
          />


          {/* TECHNICIAN INFO */}

          <Box sx={{ p: 3 }}>

            <Grid
              container
              spacing={3}
            >

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >

                <Typography
                  variant="caption"
                  sx={{ color: '#64748B' }}
                >
                  Rating
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
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
                    {technician.rating}
                    {' / 5'}
                  </Typography>

                </Box>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >

                <Typography
                  variant="caption"
                  sx={{ color: '#64748B' }}
                >
                  Availability
                </Typography>


                <Typography
                  sx={{
                    color: '#10B981',
                    fontWeight: 800,
                    mt: 0.5
                  }}
                >
                  Available
                </Typography>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >

                <Typography
                  variant="caption"
                  sx={{ color: '#64748B' }}
                >
                  Today's Workload
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    mt: 0.5
                  }}
                >

                  <Clock3
                    size={17}
                    color="#38BDF8"
                  />

                  <Typography
                    fontWeight={800}
                  >
                    {workload.current ?? 0}
                    {' / '}
                    {workload.maximum ?? 0}
                  </Typography>

                </Box>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >

                <Typography
                  variant="caption"
                  sx={{ color: '#64748B' }}
                >
                  Working Hours
                </Typography>


                <Typography
                  fontWeight={800}
                  sx={{ mt: 0.5 }}
                >
                  {technician.workingHours ||
                    'N/A'}
                </Typography>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
              >

                <Typography
                  variant="caption"
                  sx={{ color: '#64748B' }}
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
                    {technician.phone ||
                      'Not provided'}
                  </Typography>

                </Box>

              </Grid>


              <Grid
                item
                xs={12}
                sm={6}
              >

                <Typography
                  variant="caption"
                  sx={{ color: '#64748B' }}
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
                    color="#00A8FF"
                  />

                  <Typography
                    fontWeight={700}
                  >
                    {technician.email ||
                      'Not provided'}
                  </Typography>

                </Box>

              </Grid>


              <Grid
                item
                xs={12}
              >

                <Typography
                  variant="caption"
                  sx={{ color: '#64748B' }}
                >
                  Available Days
                </Typography>


                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    mt: 1
                  }}
                >

                  {technician.availableDays
                    ?.map(
                      day => (

                        <Chip
                          key={day}
                          label={day}
                          size="small"
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

            </Grid>


            {/* MATCH REASON */}

            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: 2
              }}
            >

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >

                <Wrench
                  size={20}
                  color="#00A8FF"
                />


                <Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      fontWeight: 800
                    }}
                  >
                    WHY THIS TECHNICIAN?
                  </Typography>


                  <Typography
                    sx={{
                      color: '#CBD5E1',
                      mt: 0.5
                    }}
                  >
                    {assignment.matchReason}
                  </Typography>

                </Box>

              </Box>

            </Paper>


            {/* SCORE BREAKDOWN */}

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                mt: 3,
                mb: 2
              }}
            >
              Matching Score Breakdown
            </Typography>


            <ScoreRow
              label="Technical Expertise"
              weight="40%"
              value={scores.expertise}
            />


            <ScoreRow
              label="Availability"
              weight="25%"
              value={scores.availability}
            />


            <ScoreRow
              label="Current Workload"
              weight="20%"
              value={scores.workload}
            />


            <ScoreRow
              label="Service Rating"
              weight="15%"
              value={scores.rating}
            />

          </Box>


          {/* CUSTOMER ACTIONS */}

          {!accepted && (

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
                  gap: 1.5,
                  flexWrap: 'wrap'
                }}
              >

                <Button
                  variant="contained"
                  onClick={handleAccept}
                  disabled={
                    accepting ||
                    reassigning
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
                  {accepting
                    ? 'Accepting...'
                    : 'Accept Technician'
                  }
                </Button>


                <Button
                  variant="outlined"
                  onClick={handleReassign}
                  disabled={
                    accepting ||
                    reassigning
                  }
                  startIcon={
                    reassigning
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
                  {reassigning
                    ? 'Finding Next Best...'
                    : 'Reject & Reassign'
                  }
                </Button>

              </Box>


              {onSearchTechnicians && (

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={
                    <Search size={18} />
                  }
                  onClick={
                    onSearchTechnicians
                  }
                  sx={{
                    mt: 1.5,
                    borderColor: '#00A8FF',
                    color: '#00A8FF',
                    fontWeight: 800,
                    py: 1.2
                  }}
                >
                  Browse Technicians Manually
                </Button>

              )}

            </Box>

          )}


          {/* ACCEPTED FOOTER */}

          {accepted && (

            <Box
              sx={{
                p: 2.5,
                backgroundColor:
                  'rgba(16,185,129,.08)',
                borderTop:
                  '1px solid rgba(16,185,129,.25)'
              }}
            >

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >

                <CheckCircle2
                  color="#10B981"
                />


                <Typography
                  sx={{
                    color: '#10B981',
                    fontWeight: 800
                  }}
                >
                  Technician confirmed for this service request.
                </Typography>

              </Box>

            </Box>

          )}

        </Paper>
      )}


      {/* ===================================================
          NO MORE MATCHES
      =================================================== */}

      {!assigning &&
      noMoreMatches && (

        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#172036',
            border: '1px solid #EF4444',
            borderRadius: 3
          }}
        >

          <Typography
            variant="h6"
            sx={{
              fontWeight: 800
            }}
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
            No other technician currently satisfies the required expertise,
            availability and workload conditions.
          </Typography>


          {onSearchTechnicians && (

            <Button
              variant="outlined"
              startIcon={
                <Search size={18} />
              }
              onClick={
                onSearchTechnicians
              }
            >
              Browse Technicians
            </Button>

          )}

        </Paper>

      )}

    </Box>
  );
};


// ==========================================================
// SCORE COMPONENT
// ==========================================================

const ScoreRow = ({
  label,
  weight,
  value
}) => {

  const numericValue =
    Number(value || 0);


  return (

    <Box sx={{ mb: 2 }}>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 0.7
        }}
      >

        <Typography
          variant="body2"
          sx={{
            color: '#CBD5E1',
            fontWeight: 700
          }}
        >
          {label}
          {' '}
          <Typography
            component="span"
            variant="caption"
            sx={{
              color: '#64748B'
            }}
          >
            ({weight})
          </Typography>
        </Typography>


        <Typography
          variant="body2"
          sx={{
            color: '#FFFFFF',
            fontWeight: 800
          }}
        >
          {numericValue.toFixed(1)}%
        </Typography>

      </Box>


      <LinearProgress
        variant="determinate"
        value={
          Math.min(
            numericValue,
            100
          )
        }
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#0F172A'
        }}
      />

    </Box>
  );
};