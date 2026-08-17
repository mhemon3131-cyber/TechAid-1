import React, {
  useEffect,
  useState
} from 'react';

import axios from 'axios';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Rating,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';

import {
  Star,
  CheckCircle,
  Phone,
  Mail,
  CalendarDays
} from 'lucide-react';


const API_BASE =
  'http://localhost:5000/api';


const RatingReview = () => {

  const [completedServices, setCompletedServices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [selectedService, setSelectedService] =
    useState(null);

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState('');


  // ====================================================
  // CURRENT LOGGED-IN CUSTOMER
  // ====================================================

  const storedUser =
    localStorage.getItem(
      'techaid_user'
    );


  let currentUser =
    null;


  try {

    currentUser =
      storedUser
        ? JSON.parse(
            storedUser
          )
        : null;

  } catch {

    currentUser =
      null;
  }


  const customerId =
    currentUser?.id;


  // ====================================================
  // LOAD COMPLETED SERVICES
  // ====================================================

  const loadCompletedServices =
    async () => {

      try {

        setLoading(
          true
        );

        setError(
          ''
        );


        if (!customerId) {

          setError(
            'Customer login information not found.'
          );

          return;
        }


        const response =
          await axios.get(
            `${API_BASE}/reviews/customer/${customerId}/completed-services`
          );


        if (
          response.data.success
        ) {

          setCompletedServices(
            response.data.data ||
            []
          );

        } else {

          setError(
            'Could not load completed services.'
          );
        }


      } catch (err) {

        console.error(
          'Completed service load error:',
          err
        );


        setError(
          err.response?.data?.message ||
          'Could not load completed services.'
        );

      } finally {

        setLoading(
          false
        );
      }
    };


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(
    () => {

      loadCompletedServices();

    },
    [customerId]
  );


  // ====================================================
  // SELECT SERVICE
  // ====================================================

  const handleReviewClick =
    (service) => {

      setSelectedService(
        service
      );

      setRating(
        0
      );

      setComment(
        ''
      );

      setSuccess(
        ''
      );

      setError(
        ''
      );
    };


  // ====================================================
  // SUBMIT REVIEW
  // ====================================================

  const handleSubmitReview =
    async () => {

      if (
        !selectedService
      ) {
        return;
      }


      if (
        rating < 1
      ) {

        setError(
          'Please select a rating.'
        );

        return;
      }


      try {

        setSubmitting(
          true
        );

        setError(
          ''
        );

        setSuccess(
          ''
        );


        const response =
          await axios.post(
            `${API_BASE}/reviews`,
            {
              requestId:
                selectedService.request.id,

              technicianId:
                selectedService.technician.id,

              rating:
                rating,

              comment:
                comment
            }
          );


        if (
          response.data.success
        ) {

          setSuccess(
            'Review submitted successfully.'
          );


          setRating(
            0
          );

          setComment(
            ''
          );


          await loadCompletedServices();


          setTimeout(
            () => {

              setSelectedService(
                null
              );

            },
            1200
          );
        }


      } catch (err) {

        console.error(
          'Review submit error:',
          err
        );


        setError(
          err.response?.data?.message ||
          'Could not submit review.'
        );

      } finally {

        setSubmitting(
          false
        );
      }
    };


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {

    return (
      <Box
        sx={{
          display:
            'flex',

          justifyContent:
            'center',

          alignItems:
            'center',

          minHeight:
            '60vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }


  return (
    <Box
      sx={{
        maxWidth:
          1200,

        mx:
          'auto',

        p:
          {
            xs: 2,
            md: 4
          }
      }}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <Box
        sx={{
          mb: 4
        }}
      >

        <Typography
          variant="h4"
          fontWeight={700}
        >
          Rate Your Service
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1
          }}
        >
          Review your completed services and technicians.
        </Typography>

      </Box>


      {/* ================================================= */}
      {/* MESSAGES */}
      {/* ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3
          }}
        >
          {error}
        </Alert>
      )}


      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3
          }}
        >
          {success}
        </Alert>
      )}


      {/* ================================================= */}
      {/* NO COMPLETED SERVICES */}
      {/* ================================================= */}

      {completedServices.length === 0 && (

        <Card>

          <CardContent
            sx={{
              textAlign:
                'center',

              py:
                7
            }}
          >

            <CheckCircle
              size={46}
            />

            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mt: 2
              }}
            >
              No completed services yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1
              }}
            >
              Completed services will appear here automatically.
            </Typography>

          </CardContent>

        </Card>
      )}


      {/* ================================================= */}
      {/* COMPLETED SERVICE LIST */}
      {/* ================================================= */}

      {!selectedService &&
        completedServices.map(
          (service) => (

            <Card
              key={
                service.request.id
              }
              sx={{
                mb: 2,
                borderRadius: 3
              }}
            >

              <CardContent>

                <Box
                  sx={{
                    display:
                      'flex',

                    justifyContent:
                      'space-between',

                    gap:
                      2,

                    flexWrap:
                      'wrap',

                    alignItems:
                      'center'
                  }}
                >

                  <Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >

                      <Typography
                        variant="h6"
                        fontWeight={700}
                      >
                        {
                          service.request.title
                        }
                      </Typography>

                      <Chip
                        size="small"
                        label="Completed"
                        color="success"
                      />

                    </Stack>


                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.5
                      }}
                    >
                      {
                        service.request.trackingId
                      }
                    </Typography>


                    <Typography
                      sx={{
                        mt: 1
                      }}
                    >
                      Technician:{' '}

                      <strong>
                        {
                          service.technician.name
                        }
                      </strong>
                    </Typography>


                    <Typography
                      color="text.secondary"
                    >
                      {
                        service.technician.specialty
                      }
                    </Typography>


                    {service.schedule?.date && (

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 1
                        }}
                      >
                        {
                          service.schedule.date
                        }

                        {' '}

                        {
                          service.schedule.time
                        }
                      </Typography>
                    )}

                  </Box>


                  <Box>

                    {service.reviewed
                      ? (

                        <Chip
                          icon={
                            <CheckCircle
                              size={16}
                            />
                          }
                          label="Reviewed"
                          color="success"
                          variant="outlined"
                        />

                      )
                      : (

                        <Button
                          variant="contained"
                          onClick={() =>
                            handleReviewClick(
                              service
                            )
                          }
                        >
                          Rate & Review
                        </Button>

                      )
                    }

                  </Box>

                </Box>

              </CardContent>

            </Card>
          )
        )
      }


      {/* ================================================= */}
      {/* REVIEW SCREEN */}
      {/* ================================================= */}

      {selectedService && (

        <Box>

          <Button
            variant="text"
            onClick={() => {
              setSelectedService(
                null
              );

              setError(
                ''
              );

              setSuccess(
                ''
              );
            }}
            sx={{
              mb: 2
            }}
          >
            ← Back to Completed Services
          </Button>


          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns:
                {
                  xs:
                    '1fr',

                  md:
                    '1fr 1fr'
                },

              gap:
                3
            }}
          >

            {/* =========================================== */}
            {/* TECHNICIAN DETAILS */}
            {/* =========================================== */}

            <Card
              sx={{
                borderRadius:
                  3
              }}
            >

              <CardContent
                sx={{
                  p:
                    3
                }}
              >

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Technician Details
                </Typography>


                <Divider
                  sx={{
                    my: 2
                  }}
                />


                <Box
                  sx={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap:
                      2,

                    mb:
                      3
                  }}
                >

                  <Avatar
                    src={
                      selectedService.technician.avatar ||
                      undefined
                    }
                    sx={{
                      width:
                        70,

                      height:
                        70
                    }}
                  >
                    {
                      selectedService.technician.name
                        ?.slice(
                          0,
                          2
                        )
                        .toUpperCase()
                    }
                  </Avatar>


                  <Box>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      {
                        selectedService.technician.name
                      }
                    </Typography>


                    <Typography
                      color="text.secondary"
                    >
                      {
                        selectedService.technician.specialty
                      }
                    </Typography>


                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap:
                          0.5,

                        mt:
                          0.5
                      }}
                    >

                      <Star
                        size={17}
                        fill="currentColor"
                      />

                      <Typography>
                        {
                          Number(
                            selectedService.technician.rating ||
                            0
                          ).toFixed(
                            1
                          )
                        }
                      </Typography>

                    </Box>

                  </Box>

                </Box>


                {selectedService.technician.phone && (

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      mb: 1.5
                    }}
                  >

                    <Phone
                      size={18}
                    />

                    <Typography>
                      {
                        selectedService.technician.phone
                      }
                    </Typography>

                  </Stack>
                )}


                {selectedService.technician.email && (

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      mb: 1.5
                    }}
                  >

                    <Mail
                      size={18}
                    />

                    <Typography>
                      {
                        selectedService.technician.email
                      }
                    </Typography>

                  </Stack>
                )}


                {selectedService.schedule?.date && (

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      mt: 2
                    }}
                  >

                    <CalendarDays
                      size={18}
                    />

                    <Typography>
                      {
                        selectedService.schedule.date
                      }

                      {' • '}

                      {
                        selectedService.schedule.time
                      }
                    </Typography>

                  </Stack>
                )}


                <Divider
                  sx={{
                    my: 3
                  }}
                />


                <Typography
                  fontWeight={700}
                >
                  Service
                </Typography>


                <Typography
                  sx={{
                    mt: 0.5
                  }}
                >
                  {
                    selectedService.request.title
                  }
                </Typography>


                <Typography
                  color="text.secondary"
                >
                  {
                    selectedService.request.deviceCategory
                  }
                </Typography>


                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1
                  }}
                >
                  {
                    selectedService.request.trackingId
                  }
                </Typography>

              </CardContent>

            </Card>


            {/* =========================================== */}
            {/* REVIEW FORM */}
            {/* =========================================== */}

            <Card
              sx={{
                borderRadius:
                  3
              }}
            >

              <CardContent
                sx={{
                  p:
                    3
                }}
              >

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Rate Your Experience
                </Typography>


                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    mb: 3
                  }}
                >
                  How was your service with {
                    selectedService.technician.name
                  }?
                </Typography>


                <Typography
                  fontWeight={600}
                  sx={{
                    mb: 1
                  }}
                >
                  Rating
                </Typography>


                <Rating
                  value={
                    rating
                  }
                  onChange={(
                    event,
                    newValue
                  ) => {

                    setRating(
                      newValue ||
                      0
                    );
                  }}
                  size="large"
                />


                <Typography
                  fontWeight={600}
                  sx={{
                    mt: 3,
                    mb: 1
                  }}
                >
                  Review
                </Typography>


                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  placeholder="Write your experience..."
                  value={
                    comment
                  }
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                />


                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={
                    submitting ||
                    rating < 1
                  }
                  onClick={
                    handleSubmitReview
                  }
                  sx={{
                    mt: 3,
                    py: 1.4
                  }}
                >
                  {
                    submitting
                      ? 'Submitting...'
                      : 'Submit Review'
                  }
                </Button>

              </CardContent>

            </Card>

          </Box>

        </Box>
      )}

    </Box>
  );
};


export default RatingReview;