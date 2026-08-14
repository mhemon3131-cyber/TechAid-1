import React, { useState } from 'react';

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';

import {
  Laptop,
  Monitor,
  Smartphone,
  Printer,
  Wifi,
  MessageSquare,
  Video,
  Home,
  UploadCloud,
  CheckCircle2,
  Calendar
} from 'lucide-react';

import {
  createServiceRequest
} from '../services/api';


export const CreateRequest = ({
  onNavigateToAppointment,
  currentUser
}) => {
  const [
    step,
    setStep
  ] = useState(1);


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    error,
    setError
  ] = useState('');


  const [
    submittedData,
    setSubmittedData
  ] = useState(null);


  // ========================================================
  // FORM STATE
  // ========================================================

  const [
    deviceCategory,
    setDeviceCategory
  ] = useState('Laptop');


  const [
    description,
    setDescription
  ] = useState(
    'Laptop won\'t turn on after the last update, black screen even when plugged in...'
  );


  const [
    urgency,
    setUrgency
  ] = useState('Critical');


  const [
    serviceMethod,
    setServiceMethod
  ] = useState('Live Chat');


  const [
    attachments,
    setAttachments
  ] = useState([
    {
      name:
        'error_screen.jpg',

      type:
        'IMAGE',

      url:
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'
    }
  ]);


  // ========================================================
  // DEVICE CATEGORIES
  // ========================================================

  const categories = [
    {
      label:
        'Laptop',

      icon:
        <Laptop size={20} />
    },

    {
      label:
        'Desktop',

      icon:
        <Monitor size={20} />
    },

    {
      label:
        'Phone',

      icon:
        <Smartphone size={20} />
    },

    {
      label:
        'Printer',

      icon:
        <Printer size={20} />
    },

    {
      label:
        'Internet',

      icon:
        <Wifi size={20} />
    }
  ];


  // ========================================================
  // URGENCY
  // ========================================================

  const urgencyLevels = [
    {
      label:
        'Low',

      color:
        '#3B82F6'
    },

    {
      label:
        'Moderate',

      color:
        '#F59E0B'
    },

    {
      label:
        'Critical',

      color:
        '#EF4444'
    }
  ];


  // ========================================================
  // SERVICE METHODS
  // ========================================================

  const serviceMethods = [
    {
      label:
        'Live Chat',

      icon:
        <MessageSquare size={18} />
    },

    {
      label:
        'Video Call',

      icon:
        <Video size={18} />
    },

    {
      label:
        'Home Visit',

      icon:
        <Home size={18} />
    }
  ];


  // ========================================================
  // FIXED SERVICE FEE
  //
  // Same price for every technician.
  // Price depends only on service method.
  //
  // Live Chat  = ৳50
  // Video Call = ৳100
  // Home Visit = 300
  // ========================================================

  const getServiceFee =
    () => {
      if (
        serviceMethod ===
        'Video Call'
      ) {
        return '৳100';
      }


      if (
        serviceMethod ===
        'Home Visit'
      ) {
        return '৳300';
      }


      return '৳50';
    };


  // ========================================================
  // FILE UPLOAD
  // ========================================================

  const handleFileUpload =
    (e) => {
      const file =
        e.target.files[0];


      if (file) {
        const fileUrl =
          URL.createObjectURL(
            file
          );


        setAttachments([
          ...attachments,

          {
            name:
              file.name,

            type:
              file.type.startsWith(
                'image/'
              )
                ? 'IMAGE'
                : 'FILE',

            url:
              fileUrl
          }
        ]);
      }
    };


  // ========================================================
  // SUBMIT REQUEST
  // ========================================================

  const handleSubmit =
    async () => {
      setLoading(true);

      setError('');


      // Logged-in customer required
      if (
        !currentUser?.id
      ) {
        setError(
          'Customer account information is missing. Please log in again.'
        );

        setLoading(false);

        return;
      }


      try {
        const payload = {
          deviceCategory,

          title:
            `${deviceCategory} Support: ${description.slice(
              0,
              30
            )}...`,

          description,

          urgency,

          serviceMethod,

          attachments,

          customerId:
            currentUser.id
        };


        const response =
          await createServiceRequest(
            payload
          );


        if (
          response.success
        ) {
          setSubmittedData(
            response.data
          );
        }

      } catch (err) {
        console.error(
          'Failed to create service request:',
          err
        );


        setError(
          err?.response?.data?.message ||
          err?.message ||
          'Failed to create service request. Please try again.'
        );

      } finally {
        setLoading(false);
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

      {/* HEADER */}

      <Box
        sx={{
          mb:
            3
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color:
              '#00A8FF',

            fontWeight:
              700,

            letterSpacing:
              1
          }}
        >
          MEMBER 2 • MODULE 1 (FEATURE 2.1)
        </Typography>


        <Typography
          variant="h5"
          sx={{
            color:
              '#FFF',

            fontWeight:
              700,

            mt:
              0.5
          }}
        >
          Service Request Creation
        </Typography>


        <Typography
          variant="body2"
          sx={{
            color:
              '#94A3B8'
          }}
        >
          Step {step} of 2 —{' '}

          {
            step === 1
              ? 'Describe device & issue'
              : 'Review & Attach files'
          }
        </Typography>
      </Box>


      {/* ERROR */}

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


      {/* ===================================================
          STEP 1
      =================================================== */}

      {step === 1
        ? (
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
                '1px solid #2A364F',

              maxWidth:
                800
            }}
          >

            {/* DEVICE CATEGORY */}

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
              Device Category
            </Typography>


            <Box
              sx={{
                display:
                  'flex',

                gap:
                  1.5,

                flexWrap:
                  'wrap',

                mb:
                  4
              }}
            >
              {
                categories.map(
                  (cat) => {
                    const selected =
                      deviceCategory ===
                      cat.label;


                    return (
                      <Button
                        key={
                          cat.label
                        }
                        onClick={() =>
                          setDeviceCategory(
                            cat.label
                          )
                        }
                        startIcon={
                          cat.icon
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

                          px:
                            2.5,

                          py:
                            1,

                          fontWeight:
                            600,

                          borderRadius:
                            '8px',

                          '&:hover': {
                            backgroundColor:
                              selected
                                ? '#00A8FF'
                                : '#1E293B'
                          }
                        }}
                      >
                        {cat.label}
                      </Button>
                    );
                  }
                )
              }
            </Box>


            {/* DESCRIPTION */}

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
              Describe the issue
            </Typography>


            <TextField
              multiline
              rows={4}
              fullWidth
              value={
                description
              }
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Please describe what problem you are facing..."
              sx={{
                mb:
                  4,

                backgroundColor:
                  '#0F172A',

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


            {/* URGENCY + SERVICE METHOD */}

            <Grid
              container
              spacing={3}
              sx={{
                mb:
                  4
              }}
            >

              {/* URGENCY */}

              <Grid
                item
                xs={12}
                md={6}
              >
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
                  Urgency
                </Typography>


                <Box
                  sx={{
                    display:
                      'flex',

                    gap:
                      1
                  }}
                >
                  {
                    urgencyLevels.map(
                      (lvl) => {
                        const selected =
                          urgency ===
                          lvl.label;


                        return (
                          <Button
                            key={
                              lvl.label
                            }
                            fullWidth
                            onClick={() =>
                              setUrgency(
                                lvl.label
                              )
                            }
                            sx={{
                              backgroundColor:
                                selected
                                  ? lvl.color
                                  : '#0F172A',

                              color:
                                selected
                                  ? '#FFFFFF'
                                  : '#94A3B8',

                              border:
                                selected
                                  ? `1px solid ${lvl.color}`
                                  : '1px solid #2A364F',

                              py:
                                1,

                              fontWeight:
                                700,

                              '&:hover': {
                                backgroundColor:
                                  selected
                                    ? lvl.color
                                    : '#1E293B'
                              }
                            }}
                          >
                            {lvl.label}
                          </Button>
                        );
                      }
                    )
                  }
                </Box>
              </Grid>


              {/* SERVICE METHOD */}

              <Grid
                item
                xs={12}
                md={6}
              >
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
                  Service method
                </Typography>


                <Box
                  sx={{
                    display:
                      'flex',

                    flexDirection:
                      'column',

                    gap:
                      1
                  }}
                >
                  {
                    serviceMethods.map(
                      (sm) => {
                        const selected =
                          serviceMethod ===
                          sm.label;


                        return (
                          <Button
                            key={
                              sm.label
                            }
                            onClick={() =>
                              setServiceMethod(
                                sm.label
                              )
                            }
                            startIcon={
                              sm.icon
                            }
                            sx={{
                              justifyContent:
                                'flex-start',

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

                              '&:hover': {
                                backgroundColor:
                                  selected
                                    ? 'rgba(0, 168, 255, 0.25)'
                                    : '#1E293B'
                              }
                            }}
                          >
                            {sm.label}
                          </Button>
                        );
                      }
                    )
                  }
                </Box>
              </Grid>

            </Grid>


            {/* CONTINUE */}

            <Box
              sx={{
                display:
                  'flex',

                justifyContent:
                  'flex-end'
              }}
            >
              <Button
                variant="contained"
                onClick={() =>
                  setStep(2)
                }
                disabled={
                  !description.trim()
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
                Continue to Step 2
              </Button>
            </Box>

          </Paper>
        )

        : (

          /* =================================================
             STEP 2
          ================================================= */

          <Grid
            container
            spacing={4}
            sx={{
              maxWidth:
                1000
            }}
          >

            {/* UPLOAD SIDE */}

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
                    '1px solid #2A364F',

                  height:
                    '100%'
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
                      1
                  }}
                >
                  Add photos and review
                </Typography>


                <Typography
                  variant="body2"
                  sx={{
                    color:
                      '#94A3B8',

                    mb:
                      3
                  }}
                >
                  Upload screenshots, photos, voice notes, or short video of your issue (Stored via Cloudinary API).
                </Typography>


                {/* UPLOAD */}

                <Box
                  component="label"
                  sx={{
                    border:
                      '2px dashed #2A364F',

                    borderRadius:
                      3,

                    p:
                      4,

                    display:
                      'flex',

                    flexDirection:
                      'column',

                    alignItems:
                      'center',

                    justifyContent:
                      'center',

                    cursor:
                      'pointer',

                    backgroundColor:
                      '#0F172A',

                    transition:
                      'all 0.2s',

                    '&:hover': {
                      borderColor:
                        '#00A8FF',

                      backgroundColor:
                        'rgba(0, 168, 255, 0.05)'
                    }
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*,video/*,audio/*"
                    onChange={
                      handleFileUpload
                    }
                  />


                  <UploadCloud
                    size={48}
                    color="#00A8FF"
                    style={{
                      marginBottom:
                        12
                    }}
                  />


                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        '#FFF',

                      fontWeight:
                        600
                    }}
                  >
                    Tap to add photos or short video...
                  </Typography>


                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        '#64748B',

                      mt:
                        0.5
                    }}
                  >
                    Supports PNG, JPG, MP4, MP3 (Cloudinary Upload)
                  </Typography>
                </Box>


                {/* FILE LIST */}

                {
                  attachments.length > 0 &&
                  (
                    <Box
                      sx={{
                        mt:
                          3
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#94A3B8',

                          fontWeight:
                            600
                        }}
                      >
                        Attached Files ({attachments.length}):
                      </Typography>


                      <Box
                        sx={{
                          display:
                            'flex',

                          gap:
                            1.5,

                          mt:
                            1,

                          flexWrap:
                            'wrap'
                        }}
                      >
                        {
                          attachments.map(
                            (
                              att,
                              idx
                            ) => (
                              <Chip
                                key={
                                  idx
                                }
                                label={
                                  att.name
                                }
                                onDelete={() =>
                                  setAttachments(
                                    attachments.filter(
                                      (
                                        _,
                                        i
                                      ) =>
                                        i !== idx
                                    )
                                  )
                                }
                                sx={{
                                  backgroundColor:
                                    '#0F172A',

                                  color:
                                    '#00A8FF',

                                  border:
                                    '1px solid #2A364F'
                                }}
                              />
                            )
                          )
                        }
                      </Box>
                    </Box>
                  )
                }


                {/* BACK */}

                <Box
                  sx={{
                    display:
                      'flex',

                    gap:
                      2,

                    mt:
                      4
                  }}
                >
                  <Button
                    onClick={() =>
                      setStep(1)
                    }
                    sx={{
                      color:
                        '#94A3B8',

                      border:
                        '1px solid #2A364F',

                      px:
                        3
                    }}
                  >
                    Back
                  </Button>
                </Box>

              </Paper>
            </Grid>


            {/* SUMMARY */}

            <Grid
              item
              xs={12}
              md={5}
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
                    '1px solid #2A364F',

                  display:
                    'flex',

                  flexDirection:
                    'column',

                  justifyContent:
                    'space-between',

                  minHeight:
                    320
                }}
              >
                <Box>

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
                    Summary
                  </Typography>


                  <Box
                    sx={{
                      display:
                        'flex',

                      gap:
                        1,

                      mb:
                        2,

                      flexWrap:
                        'wrap'
                    }}
                  >

                    <Chip
                      label={
                        deviceCategory
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          '#00A8FF',

                        color:
                          '#0D1527',

                        fontWeight:
                          700
                      }}
                    />


                    <Chip
                      label={
                        urgency
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          urgency ===
                          'Critical'
                            ? '#EF4444'

                            : urgency ===
                              'Moderate'
                              ? '#F59E0B'
                              : '#3B82F6',

                        color:
                          '#FFF',

                        fontWeight:
                          700
                      }}
                    />


                    <Chip
                      label={
                        serviceMethod
                      }
                      size="small"
                      sx={{
                        backgroundColor:
                          'rgba(56, 189, 248, 0.2)',

                        color:
                          '#38BDF8',

                        fontWeight:
                          600
                      }}
                    />

                  </Box>


                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        '#E2E8F0',

                      mb:
                        3,

                      lineHeight:
                        1.6
                    }}
                  >
                    {description}
                  </Typography>


                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        '#94A3B8',

                      display:
                        'block'
                    }}
                  >
                    Service fee:
                  </Typography>


                  {/* DYNAMIC SERVICE METHOD FEE */}

                  <Typography
                    variant="h6"
                    sx={{
                      color:
                        '#00A8FF',

                      fontWeight:
                        700
                    }}
                  >
                    {getServiceFee()}
                  </Typography>

                </Box>


                {/* SUBMIT */}

                <Button
                  variant="contained"
                  fullWidth
                  onClick={
                    handleSubmit
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
                      1.5,

                    fontWeight:
                      700,

                    fontSize:
                      '1rem',

                    mt:
                      3,

                    '&:hover': {
                      backgroundColor:
                        '#38BDF8'
                    }
                  }}
                >
                  {
                    loading
                      ? 'Submitting Request...'
                      : 'Submit Request'
                  }
                </Button>

              </Paper>
            </Grid>

          </Grid>
        )
      }


      {/* ===================================================
          SUCCESS DIALOG
      =================================================== */}

      <Dialog
        open={
          Boolean(
            submittedData
          )
        }
        onClose={() =>
          setSubmittedData(
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
              '1px solid #00A8FF',

            p:
              2,

            maxWidth:
              450
          }
        }}
      >

        <DialogTitle
          sx={{
            textAlign:
              'center',

            pt:
              3
          }}
        >

          <CheckCircle2
            size={56}
            color="#00A8FF"
            style={{
              margin:
                '0 auto 12px auto',

              display:
                'block'
            }}
          />


          <Typography
            variant="h5"
            sx={{
              fontWeight:
                700
            }}
          >
            Request Submitted!
          </Typography>

        </DialogTitle>


        <DialogContent
          sx={{
            textAlign:
              'center'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color:
                '#94A3B8',

              mb:
                2
            }}
          >
            Your service request has been logged successfully with unique Tracking ID:
          </Typography>


          <Box
            sx={{
              backgroundColor:
                '#0F172A',

              py:
                1.5,

              px:
                3,

              borderRadius:
                2,

              border:
                '1px dashed #00A8FF',

              mb:
                2
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color:
                  '#00A8FF',

                fontWeight:
                  700,

                letterSpacing:
                  1.5
              }}
            >
              {
                submittedData
                  ?.trackingId
              }
            </Typography>
          </Box>


          <Typography
            variant="caption"
            sx={{
              color:
                '#64748B'
            }}
          >
            Status: PENDING
          </Typography>

        </DialogContent>


        <DialogActions
          sx={{
            justifyContent:
              'center',

            pb:
              3,

            px:
              3
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setSubmittedData(
                null
              );

              if (
                onNavigateToAppointment
              ) {
                onNavigateToAppointment();
              }
            }}
            startIcon={
              <Calendar
                size={18}
              />
            }
            sx={{
              backgroundColor:
                '#00A8FF',

              color:
                '#0D1527',

              py:
                1.2,

              fontWeight:
                700,

              '&:hover': {
                backgroundColor:
                  '#38BDF8'
              }
            }}
          >
            Schedule Appointment (Module 2)
          </Button>
        </DialogActions>

      </Dialog>

    </Box>
  );
};