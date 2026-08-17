import React, { useEffect, useMemo, useState } from 'react';

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
  Divider,
  Grid,
  MenuItem,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import {
  ArrowLeft,
  Clock,
  GitCompare,
  MapPin,
  RotateCcw,
  UserRound
} from 'lucide-react';

import axios from 'axios';


// ==========================================================
// MODULE 3 - FEATURE 4
// ADVANCED SEARCH & FILTER SYSTEM
//
// Customer can filter technicians by:
// 1. Device Category
// 2. Technical Expertise
// 3. Location
// 4. Minimum Rating
//
// Customer can also compare 2-3 technicians.
// ==========================================================

export const TechnicianSearch = ({ onBack }) => {

  // ========================================================
  // TECHNICIAN DATA
  // ========================================================

  const [technicians, setTechnicians] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  // ========================================================
  // FILTER STATES
  // Empty value means no filter selected
  // ========================================================

  const [
    deviceCategoryFilter,
    setDeviceCategoryFilter
  ] = useState('');

  const [
    expertiseFilter,
    setExpertiseFilter
  ] = useState('');

  const [
    locationFilter,
    setLocationFilter
  ] = useState('');

  const [
    ratingFilter,
    setRatingFilter
  ] = useState('');


  // ========================================================
  // COMPARE STATES
  // ========================================================

  const [
    selectedTechnicians,
    setSelectedTechnicians
  ] = useState([]);

  const [
    compareOpen,
    setCompareOpen
  ] = useState(false);


  // ========================================================
  // FETCH ALL TECHNICIANS
  // ========================================================

  useEffect(() => {

    const loadTechnicians = async () => {

      setLoading(true);
      setError('');

      try {

        const response =
          await axios.get(
            'http://localhost:5000/api/technicians'
          );

        const data =
          response.data?.data ||
          response.data ||
          [];

        setTechnicians(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          'Technician search error:',
          err
        );

        setError(
          err?.response?.data?.message ||
          'Unable to load technician list.'
        );

      } finally {

        setLoading(false);

      }
    };

    loadTechnicians();

  }, []);


  // ========================================================
  // DEVICE CATEGORY OPTIONS
  // ========================================================

  const deviceCategories = [
    'Laptop',
    'Desktop',
    'Phone',
    'Printer',
    'Internet'
  ];


  // ========================================================
  // TECHNICAL EXPERTISE OPTIONS
  // ========================================================

  const expertiseOptions = [

    {
      value: 'COMPUTER',
      label: 'Laptop & Desktop Repair'
    },

    {
      value: 'SOFTWARE',
      label: 'Software & Operating System'
    },

    {
      value: 'NETWORK',
      label: 'Internet, Network & Wi-Fi'
    },

    {
      value: 'MOBILE',
      label: 'Mobile & Smartphone'
    },

    {
      value: 'PRINTER',
      label: 'Printer & Peripheral Support'
    },

    {
      value: 'HARDWARE',
      label: 'Hardware Troubleshooting'
    }

  ];


  // ========================================================
  // NORMALIZE STRING / ARRAY
  // ========================================================

  const normalizeList = (value) => {

    if (Array.isArray(value)) {

      return value
        .map(
          (item) =>
            String(item).trim()
        )
        .filter(Boolean);
    }


    if (!value) {

      return [];
    }


    return String(value)
      .split(',')
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);
  };


  // ========================================================
  // DEVICE CATEGORY MATCH
  // ========================================================

  const matchesDeviceCategory = (tech) => {

    if (!deviceCategoryFilter) {

      return true;
    }


    const selected =
      deviceCategoryFilter
        .toLowerCase();


    const backendCategories =
      normalizeList(
        tech.deviceCategories
      ).map(
        (item) =>
          item.toLowerCase()
      );


    if (
      backendCategories.includes(
        selected
      )
    ) {

      return true;
    }


    const specialty =
      String(
        tech.specialty || ''
      ).toLowerCase();


    if (selected === 'laptop') {

      return (
        specialty.includes('laptop') ||
        specialty.includes('computer') ||
        specialty.includes('pc') ||
        specialty.includes('hardware')
      );
    }


    if (selected === 'desktop') {

      return (
        specialty.includes('desktop') ||
        specialty.includes('computer') ||
        specialty.includes('pc') ||
        specialty.includes('hardware')
      );
    }


    if (selected === 'phone') {

      return (
        specialty.includes('phone') ||
        specialty.includes('mobile') ||
        specialty.includes('smartphone')
      );
    }


    if (selected === 'printer') {

      return (
        specialty.includes('printer') ||
        specialty.includes('peripheral')
      );
    }


    if (selected === 'internet') {

      return (
        specialty.includes('internet') ||
        specialty.includes('network') ||
        specialty.includes('wifi') ||
        specialty.includes('wi-fi') ||
        specialty.includes('router')
      );
    }


    return true;
  };


  // ========================================================
  // TECHNICAL EXPERTISE MATCH
  // ========================================================

  const matchesExpertiseCategory = (tech) => {

    if (!expertiseFilter) {

      return true;
    }


    const text =
      [
        tech.specialty,
        tech.technicalExpertise,
        ...normalizeList(
          tech.deviceCategories
        )
      ]
        .join(' ')
        .toLowerCase();


    switch (expertiseFilter) {

      case 'COMPUTER':

        return (
          text.includes('laptop') ||
          text.includes('desktop') ||
          text.includes('computer') ||
          text.includes('pc')
        );


      case 'SOFTWARE':

        return (
          text.includes('software') ||
          text.includes('windows') ||
          text.includes('operating system') ||
          text.includes('os')
        );


      case 'NETWORK':

        return (
          text.includes('network') ||
          text.includes('internet') ||
          text.includes('wifi') ||
          text.includes('wi-fi') ||
          text.includes('router')
        );


      case 'MOBILE':

        return (
          text.includes('mobile') ||
          text.includes('phone') ||
          text.includes('smartphone')
        );


      case 'PRINTER':

        return (
          text.includes('printer') ||
          text.includes('peripheral')
        );


      case 'HARDWARE':

        return (
          text.includes('hardware') ||
          text.includes('repair') ||
          text.includes('laptop') ||
          text.includes('desktop')
        );


      default:

        return true;
    }
  };


  // ========================================================
  // FILTER TECHNICIANS
  // ========================================================

  const filteredTechnicians =
    useMemo(() => {

      return technicians.filter(
        (tech) => {

          // ================================================
          // DEVICE CATEGORY
          // ================================================

          const matchesDevice =
            matchesDeviceCategory(
              tech
            );


          // ================================================
          // TECHNICAL EXPERTISE
          // ================================================

          const matchesExpertise =
            matchesExpertiseCategory(
              tech
            );


          // ================================================
          // LOCATION
          // ================================================

          const typedLocation =
            locationFilter
              .trim()
              .toLowerCase();


          const serviceAreas =
            normalizeList(
              tech.serviceAreas
            );


          const matchesLocation =
            !typedLocation ||
            serviceAreas.some(
              (area) =>
                area
                  .toLowerCase()
                  .includes(
                    typedLocation
                  )
            );


          // ================================================
          // MINIMUM RATING
          // ================================================

          const techRating =
            Number(
              tech.rating
            ) || 0;


          const matchesRating =
            !ratingFilter ||
            techRating >=
              Number(
                ratingFilter
              );


          return (
            matchesDevice &&
            matchesExpertise &&
            matchesLocation &&
            matchesRating
          );

        }
      );

    }, [
      technicians,
      deviceCategoryFilter,
      expertiseFilter,
      locationFilter,
      ratingFilter
    ]);


  // ========================================================
  // RESET ALL FILTERS
  // ========================================================

  const handleResetFilters = () => {

    setDeviceCategoryFilter('');

    setExpertiseFilter('');

    setLocationFilter('');

    setRatingFilter('');

    setError('');
  };


  // ========================================================
  // SELECT TECHNICIAN FOR COMPARE
  // Maximum 3 technicians
  // ========================================================

  const handleCompareSelection = (tech) => {

    const alreadySelected =
      selectedTechnicians.some(
        (item) =>
          item.id === tech.id
      );


    if (alreadySelected) {

      setSelectedTechnicians(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !== tech.id
          )
      );

      return;
    }


    if (
      selectedTechnicians.length >= 3
    ) {

      setError(
        'You can compare maximum 3 technicians at a time.'
      );

      return;
    }


    setError('');


    setSelectedTechnicians(
      (prev) => [
        ...prev,
        tech
      ]
    );
  };


  // ========================================================
  // MAIN UI
  // ========================================================

  return (

    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0D1527',
        color: '#FFF',

        p: {
          xs: 2,
          md: 4
        },

        overflowY: 'auto'
      }}
    >

      {/* ===================================================
          BACK BUTTON
      =================================================== */}

      <Button
        startIcon={
          <ArrowLeft size={18} />
        }
        onClick={onBack}
        sx={{
          color: '#94A3B8',
          mb: 2
        }}
      >
        Back to Auto Assignment
      </Button>


      {/* ===================================================
          HEADER
      =================================================== */}

      <Typography
        variant="caption"
        sx={{
          color: '#00A8FF',
          fontWeight: 800,
          letterSpacing: 1
        }}
      >
        ADVANCED SEARCH & FILTER SYSTEM
      </Typography>


      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mt: 0.5
        }}
      >
        Find the Right Technician
      </Typography>


      <Typography
        sx={{
          color: '#94A3B8',
          mt: 0.5,
          mb: 3
        }}
      >
        Filter technicians by device category,
        technical expertise, location and service rating.
      </Typography>


      {/* ===================================================
          FILTER BOX
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#172036',

          border:
            '1px solid #2A364F',

          borderRadius: 3,

          p: 2.5,

          mb: 3
        }}
      >

        <Grid
          container
          spacing={2}
        >

          {/* =================================================
              DEVICE CATEGORY
          ================================================= */}

          <Grid
            item
            xs={12}
            md={6}
          >

            <TextField
              select
              fullWidth

              value={
                deviceCategoryFilter
              }

              onChange={(e) =>
                setDeviceCategoryFilter(
                  e.target.value
                )
              }

              SelectProps={{
                displayEmpty: true,

                renderValue: (selected) => {

                  if (!selected) {

                    return (
                      <span
                        style={{
                          color: '#64748B'
                        }}
                      >
                        Device Category
                      </span>
                    );
                  }

                  return selected;
                }
              }}

              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFF',
                  backgroundColor: '#0F172A',

                  '& fieldset': {
                    borderColor: '#2A364F'
                  },

                  '&:hover fieldset': {
                    borderColor: '#475569'
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#00A8FF'
                  }
                },

                '& .MuiSvgIcon-root': {
                  color: '#94A3B8'
                }
              }}
            >

              <MenuItem
                value=""
                sx={{
                  display: 'none'
                }}
              />


              {deviceCategories.map(
                (device) => (

                  <MenuItem
                    key={device}
                    value={device}
                  >
                    {device}
                  </MenuItem>

                )
              )}

            </TextField>

          </Grid>


          {/* =================================================
              TECHNICAL EXPERTISE
          ================================================= */}

          <Grid
            item
            xs={12}
            md={6}
          >

            <TextField
              select
              fullWidth

              value={
                expertiseFilter
              }

              onChange={(e) =>
                setExpertiseFilter(
                  e.target.value
                )
              }

              SelectProps={{
                displayEmpty: true,

                renderValue: (selected) => {

                  if (!selected) {

                    return (
                      <span
                        style={{
                          color: '#64748B'
                        }}
                      >
                        Technical Expertise
                      </span>
                    );
                  }


                  const selectedItem =
                    expertiseOptions.find(
                      (item) =>
                        item.value ===
                        selected
                    );


                  return (
                    selectedItem?.label ||
                    selected
                  );
                }
              }}

              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFF',
                  backgroundColor: '#0F172A',

                  '& fieldset': {
                    borderColor: '#2A364F'
                  },

                  '&:hover fieldset': {
                    borderColor: '#475569'
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#00A8FF'
                  }
                },

                '& .MuiSvgIcon-root': {
                  color: '#94A3B8'
                }
              }}
            >

              <MenuItem
                value=""
                sx={{
                  display: 'none'
                }}
              />


              {expertiseOptions.map(
                (item) => (

                  <MenuItem
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </MenuItem>

                )
              )}

            </TextField>

          </Grid>


          {/* =================================================
              LOCATION
          ================================================= */}

          <Grid
            item
            xs={12}
            md={6}
          >

            <TextField
              fullWidth

              value={
                locationFilter
              }

              onChange={(e) =>
                setLocationFilter(
                  e.target.value
                )
              }

              placeholder="Your Area / Location"

              InputProps={{
                startAdornment: (
                  <MapPin
                    size={17}
                    style={{
                      marginRight: 8
                    }}
                  />
                )
              }}

              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFF',
                  backgroundColor: '#0F172A',

                  '& fieldset': {
                    borderColor: '#2A364F'
                  },

                  '&:hover fieldset': {
                    borderColor: '#475569'
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#00A8FF'
                  }
                },

                '& input::placeholder': {
                  color: '#64748B',
                  opacity: 1
                }
              }}
            />

          </Grid>


          {/* =================================================
              MINIMUM RATING
          ================================================= */}

          <Grid
            item
            xs={12}
            md={6}
          >

            <TextField
              select
              fullWidth

              value={
                ratingFilter
              }

              onChange={(e) =>
                setRatingFilter(
                  e.target.value
                )
              }

              SelectProps={{
                displayEmpty: true,

                renderValue: (selected) => {

                  if (!selected) {

                    return (
                      <span
                        style={{
                          color: '#64748B'
                        }}
                      >
                        Minimum Rating
                      </span>
                    );
                  }


                  return `${selected}+`;
                }
              }}

              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#FFF',
                  backgroundColor: '#0F172A',

                  '& fieldset': {
                    borderColor: '#2A364F'
                  },

                  '&:hover fieldset': {
                    borderColor: '#475569'
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#00A8FF'
                  }
                },

                '& .MuiSvgIcon-root': {
                  color: '#94A3B8'
                }
              }}
            >

              <MenuItem
                value=""
                sx={{
                  display: 'none'
                }}
              />


              <MenuItem value="3">
                3.0+
              </MenuItem>


              <MenuItem value="4">
                4.0+
              </MenuItem>


              <MenuItem value="4.5">
                4.5+
              </MenuItem>

            </TextField>

          </Grid>

        </Grid>


        {/* =================================================
            RESET + COMPARE BUTTON
        ================================================= */}

        <Box
          sx={{
            mt: 2,

            display: 'flex',

            justifyContent:
              'space-between',

            alignItems:
              'center',

            flexWrap:
              'wrap',

            gap: 2
          }}
        >

          <Button
            startIcon={
              <RotateCcw
                size={17}
              />
            }

            onClick={
              handleResetFilters
            }

            sx={{
              color: '#94A3B8',

              border:
                '1px solid #2A364F',

              '&:hover': {
                borderColor:
                  '#475569',

                backgroundColor:
                  '#0F172A'
              }
            }}
          >
            Reset Filters
          </Button>


          <Button
            variant="contained"

            startIcon={
              <GitCompare
                size={18}
              />
            }

            disabled={
              selectedTechnicians.length <
              2
            }

            onClick={() =>
              setCompareOpen(true)
            }

            sx={{
              backgroundColor:
                '#00A8FF',

              color:
                '#0D1527',

              fontWeight:
                800,

              '&:hover': {
                backgroundColor:
                  '#38BDF8'
              }
            }}
          >
            Compare (
            {selectedTechnicians.length}
            )
          </Button>

        </Box>

      </Paper>


      {/* ===================================================
          ERROR MESSAGE
      =================================================== */}

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


      {/* ===================================================
          LOADING
      =================================================== */}

      {loading ? (

        <Box
          sx={{
            display: 'flex',

            justifyContent:
              'center',

            mt: 8
          }}
        >
          <CircularProgress />
        </Box>

      ) : (

        <>

          {/* ===============================================
              RESULT COUNT
          =============================================== */}

          <Typography
            variant="body2"
            sx={{
              color: '#94A3B8',
              mb: 2
            }}
          >
            {filteredTechnicians.length}{' '}
            technician(s) match your requirements
          </Typography>


          {/* ===============================================
              NO RESULT
          =============================================== */}

          {filteredTechnicians.length === 0 ? (

            <Paper
              elevation={0}
              sx={{
                p: 4,

                textAlign:
                  'center',

                backgroundColor:
                  '#172036',

                border:
                  '1px solid #2A364F',

                borderRadius:
                  3
              }}
            >

              <UserRound
                size={44}
                color="#64748B"
              />


              <Typography
                variant="h6"
                sx={{
                  color: '#FFF',

                  mt: 1.5,

                  fontWeight: 700
                }}
              >
                No technicians found
              </Typography>


              <Typography
                sx={{
                  color: '#94A3B8'
                }}
              >
                Try another device category, expertise,
                location or rating.
              </Typography>

            </Paper>

          ) : (

            <Grid
              container
              spacing={3}
            >

              {filteredTechnicians.map(
                (tech) => {

                  const availableDays =
                    normalizeList(
                      tech.availableDays
                    );


                  const serviceAreas =
                    normalizeList(
                      tech.serviceAreas
                    );


                  const isSelected =
                    selectedTechnicians.some(
                      (item) =>
                        item.id ===
                        tech.id
                    );


                  return (

                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      key={tech.id}
                    >

                      <Paper
                        elevation={0}

                        sx={{
                          height: '100%',

                          backgroundColor:
                            '#172036',

                          border:
                            isSelected
                              ? '2px solid #00A8FF'
                              : '1px solid #2A364F',

                          borderRadius: 3,

                          p: 3
                        }}
                      >

                        {/* TECHNICIAN NAME + SPECIALTY */}

                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 2
                          }}
                        >

                          <Avatar
                            src={
                              tech.avatar ||
                              ''
                            }

                            sx={{
                              width: 58,
                              height: 58,

                              backgroundColor:
                                '#00A8FF',

                              color:
                                '#0D1527',

                              fontWeight:
                                800
                            }}
                          >

                            {
                              tech.name
                                ?.slice(
                                  0,
                                  2
                                )
                                .toUpperCase() ||
                              'TE'
                            }

                          </Avatar>


                          <Box
                            sx={{
                              flexGrow: 1
                            }}
                          >

                            <Typography
                              variant="h6"
                              sx={{
                                color: '#FFF',

                                fontWeight:
                                  800
                              }}
                            >
                              {tech.name}
                            </Typography>


                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  '#38BDF8'
                              }}
                            >
                              {
                                tech.specialty ||
                                'Technical Specialist'
                              }
                            </Typography>

                          </Box>

                        </Box>


                        {/* RATING */}

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"

                          sx={{
                            mb: 2
                          }}
                        >

                          <Rating
                            value={
                              Number(
                                tech.rating
                              ) || 0
                            }

                            precision={0.1}

                            readOnly

                            size="small"
                          />


                          <Typography
                            sx={{
                              color: '#FFF',

                              fontWeight:
                                700
                            }}
                          >
                            {
                              Number(
                                tech.rating ||
                                0
                              ).toFixed(1)
                            }
                          </Typography>

                        </Stack>


                        {/* WORKING HOURS */}

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"

                          sx={{
                            mb: 2
                          }}
                        >

                          <Clock
                            size={17}
                            color="#00A8FF"
                          />


                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                '#CBD5E1'
                            }}
                          >
                            {
                              tech.workingHours ||
                              'Working hours not provided'
                            }
                          </Typography>

                        </Stack>


                        {/* AVAILABLE DAYS */}

                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              '#64748B',

                            fontWeight:
                              700
                          }}
                        >
                          AVAILABLE DAYS
                        </Typography>


                        <Box
                          sx={{
                            display: 'flex',

                            flexWrap:
                              'wrap',

                            gap: 0.7,

                            mt: 0.7,

                            mb: 2
                          }}
                        >

                          {availableDays.length > 0 ? (

                            availableDays.map(
                              (day) => (

                                <Chip
                                  key={day}

                                  size="small"

                                  label={day}

                                  sx={{
                                    color:
                                      '#FFF',

                                    backgroundColor:
                                      '#0F172A'
                                  }}
                                />

                              )
                            )

                          ) : (

                            <Typography
                              variant="caption"
                              sx={{
                                color:
                                  '#94A3B8'
                              }}
                            >
                              Not specified
                            </Typography>

                          )}

                        </Box>


                        {/* SERVICE AREAS */}

                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              '#64748B',

                            fontWeight:
                              700
                          }}
                        >
                          SERVICE AREAS
                        </Typography>


                        <Box
                          sx={{
                            display: 'flex',

                            flexWrap:
                              'wrap',

                            gap: 0.7,

                            mt: 0.7,

                            mb: 2
                          }}
                        >

                          {serviceAreas.length > 0 ? (

                            serviceAreas.map(
                              (area) => (

                                <Chip
                                  key={area}

                                  size="small"

                                  icon={
                                    <MapPin
                                      size={13}
                                    />
                                  }

                                  label={area}

                                  sx={{
                                    color:
                                      '#38BDF8',

                                    backgroundColor:
                                      'rgba(0,168,255,.10)'
                                  }}
                                />

                              )
                            )

                          ) : (

                            <Typography
                              variant="caption"
                              sx={{
                                color:
                                  '#94A3B8'
                              }}
                            >
                              Area not specified
                            </Typography>

                          )}

                        </Box>


                        {/* ADD TO COMPARE */}

                        <Button
                          fullWidth

                          variant={
                            isSelected
                              ? 'contained'
                              : 'outlined'
                          }

                          startIcon={
                            <GitCompare
                              size={17}
                            />
                          }

                          onClick={() =>
                            handleCompareSelection(
                              tech
                            )
                          }

                          sx={{
                            mt: 1,

                            color:
                              isSelected
                                ? '#0D1527'
                                : '#00A8FF',

                            backgroundColor:
                              isSelected
                                ? '#00A8FF'
                                : 'transparent',

                            borderColor:
                              '#00A8FF',

                            fontWeight:
                              700,

                            '&:hover': {
                              borderColor:
                                '#38BDF8',

                              backgroundColor:
                                isSelected
                                  ? '#38BDF8'
                                  : 'rgba(0,168,255,.08)'
                            }
                          }}
                        >

                          {
                            isSelected
                              ? 'Selected for Compare'
                              : 'Add to Compare'
                          }

                        </Button>

                      </Paper>

                    </Grid>

                  );
                }
              )}

            </Grid>

          )}

        </>
      )}


      {/* ===================================================
          COMPARE POPUP
      =================================================== */}

      <Dialog
        open={compareOpen}

        onClose={() =>
          setCompareOpen(false)
        }

        fullWidth

        maxWidth="lg"

        PaperProps={{
          sx: {
            backgroundColor:
              '#172036',

            color:
              '#FFFFFF',

            border:
              '1px solid #2A364F'
          }
        }}
      >

        <DialogTitle
          sx={{
            fontWeight: 800
          }}
        >
          Compare Technicians
        </DialogTitle>


        <DialogContent>

          <Typography
            variant="body2"

            sx={{
              color: '#94A3B8',
              mb: 3
            }}
          >
            Compare technical expertise, service rating,
            location and working schedule.
          </Typography>


          <Grid
            container
            spacing={2}
          >

            {selectedTechnicians.map(
              (tech) => {

                const areas =
                  normalizeList(
                    tech.serviceAreas
                  );


                const days =
                  normalizeList(
                    tech.availableDays
                  );


                return (

                  <Grid
                    item
                    xs={12}

                    md={
                      selectedTechnicians.length === 2
                        ? 6
                        : 4
                    }

                    key={tech.id}
                  >

                    <Paper
                      elevation={0}

                      sx={{
                        p: 2.5,

                        height: '100%',

                        backgroundColor:
                          '#0F172A',

                        border:
                          '1px solid #2A364F',

                        borderRadius: 2
                      }}
                    >

                      <Avatar
                        src={
                          tech.avatar ||
                          ''
                        }

                        sx={{
                          width: 60,
                          height: 60,

                          mb: 1.5,

                          backgroundColor:
                            '#00A8FF',

                          color:
                            '#0D1527',

                          fontWeight:
                            800
                        }}
                      >
                        {
                          tech.name
                            ?.slice(
                              0,
                              2
                            )
                            .toUpperCase()
                        }
                      </Avatar>


                      <Typography
                        variant="h6"
                        sx={{
                          color: '#FFF',

                          fontWeight:
                            800
                        }}
                      >
                        {tech.name}
                      </Typography>


                      <Typography
                        variant="body2"

                        sx={{
                          color:
                            '#38BDF8',

                          mb: 2
                        }}
                      >
                        {
                          tech.specialty ||
                          'Technical Specialist'
                        }
                      </Typography>


                      <Divider
                        sx={{
                          borderColor:
                            '#2A364F',

                          mb: 2
                        }}
                      />


                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B'
                        }}
                      >
                        SERVICE RATING
                      </Typography>


                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"

                        sx={{
                          mb: 2
                        }}
                      >

                        <Rating
                          value={
                            Number(
                              tech.rating
                            ) || 0
                          }

                          precision={0.1}

                          readOnly

                          size="small"
                        />


                        <Typography
                          sx={{
                            color: '#FFF',

                            fontWeight:
                              700
                          }}
                        >
                          {
                            Number(
                              tech.rating ||
                              0
                            ).toFixed(1)
                          }
                        </Typography>

                      </Stack>


                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B'
                        }}
                      >
                        TECHNICAL EXPERTISE
                      </Typography>


                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            '#CBD5E1',

                          mb: 2
                        }}
                      >
                        {
                          tech.specialty ||
                          'Not specified'
                        }
                      </Typography>


                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B'
                        }}
                      >
                        SERVICE AREAS
                      </Typography>


                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            '#CBD5E1',

                          mb: 2
                        }}
                      >
                        {
                          areas.length > 0
                            ? areas.join(', ')
                            : 'Not specified'
                        }
                      </Typography>


                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B'
                        }}
                      >
                        AVAILABLE DAYS
                      </Typography>


                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            '#CBD5E1',

                          mb: 2
                        }}
                      >
                        {
                          days.length > 0
                            ? days.join(', ')
                            : 'Not specified'
                        }
                      </Typography>


                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B'
                        }}
                      >
                        WORKING HOURS
                      </Typography>


                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            '#CBD5E1'
                        }}
                      >
                        {
                          tech.workingHours ||
                          'Not specified'
                        }
                      </Typography>

                    </Paper>

                  </Grid>

                );
              }
            )}

          </Grid>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() => {

              setSelectedTechnicians([]);

              setCompareOpen(false);

            }}

            sx={{
              color: '#EF4444'
            }}
          >
            Clear Compare
          </Button>


          <Button
            variant="contained"

            onClick={() =>
              setCompareOpen(false)
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
            Close
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
};