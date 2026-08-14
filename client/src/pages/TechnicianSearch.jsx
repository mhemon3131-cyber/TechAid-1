import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Rating,
  TextField,
  Typography
} from '@mui/material';

import {
  ArrowLeft,
  Clock,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound
} from 'lucide-react';

import axios from 'axios';


// ==========================================================
// MEMBER 4 - TECHNICIAN SEARCH & FILTER
//
// Customer automatic technician suggestion use na korte chaile
// ei page-e technician list/details dekhte parbe.
//
// Search:
// - Name
// - Specialty
//
// Filter:
// - Specialty
// - Availability
// - Rating
// ==========================================================

export const TechnicianSearch = ({
  onBack
}) => {

  const [
    technicians,
    setTechnicians
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState('');


  const [
    searchText,
    setSearchText
  ] = useState('');


  const [
    specialtyFilter,
    setSpecialtyFilter
  ] = useState('ALL');


  const [
    availabilityFilter,
    setAvailabilityFilter
  ] = useState('ALL');


  const [
    ratingFilter,
    setRatingFilter
  ] = useState('ALL');


  // ========================================================
  // FETCH TECHNICIANS
  // ========================================================

  useEffect(() => {

    const loadTechnicians =
      async () => {

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
  // SPECIALTY OPTIONS
  // ========================================================

  const specialties =
    useMemo(() => {

      return [
        ...new Set(
          technicians
            .map(
              (tech) =>
                tech.specialty
            )
            .filter(Boolean)
        )
      ];

    }, [
      technicians
    ]);


  // ========================================================
  // FILTERED TECHNICIANS
  // ========================================================

  const filteredTechnicians =
    useMemo(() => {

      return technicians.filter(
        (tech) => {

          const search =
            searchText
              .trim()
              .toLowerCase();


          const name =
            (
              tech.name ||
              ''
            ).toLowerCase();


          const specialty =
            (
              tech.specialty ||
              ''
            ).toLowerCase();


          const matchesSearch =
            !search ||
            name.includes(
              search
            ) ||
            specialty.includes(
              search
            );


          const matchesSpecialty =
            specialtyFilter === 'ALL' ||
            tech.specialty ===
              specialtyFilter;


          const matchesAvailability =
            availabilityFilter === 'ALL' ||

            (
              availabilityFilter === 'AVAILABLE' &&
              tech.isAvailable === true
            ) ||

            (
              availabilityFilter === 'UNAVAILABLE' &&
              tech.isAvailable === false
            );


          const rating =
            Number(
              tech.rating
            ) || 0;


          const matchesRating =
            ratingFilter === 'ALL' ||

            rating >=
              Number(
                ratingFilter
              );


          return (
            matchesSearch &&
            matchesSpecialty &&
            matchesAvailability &&
            matchesRating
          );
        }
      );

    }, [
      technicians,
      searchText,
      specialtyFilter,
      availabilityFilter,
      ratingFilter
    ]);


  // ========================================================
  // UI
  // ========================================================

  return (

    <Box
      sx={{
        minHeight:
          '100vh',

        backgroundColor:
          '#0D1527',

        color:
          '#FFF',

        p: {
          xs:
            2,

          md:
            4
        },

        overflowY:
          'auto'
      }}
    >

      {/* ===================================================
          BACK
      =================================================== */}

      <Button
        startIcon={
          <ArrowLeft
            size={18}
          />
        }
        onClick={
          onBack
        }
        sx={{
          color:
            '#94A3B8',

          mb:
            2
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
          color:
            '#00A8FF',

          fontWeight:
            800,

          letterSpacing:
            1
        }}
      >
        TECHNICIAN SEARCH & FILTER
      </Typography>


      <Typography
        variant="h4"
        sx={{
          fontWeight:
            800,

          mt:
            0.5
        }}
      >
        Search Technician Info
      </Typography>


      <Typography
        sx={{
          color:
            '#94A3B8',

          mt:
            0.5,

          mb:
            3
        }}
      >
        Browse available technicians and review their service information.
      </Typography>


      {/* ===================================================
          FILTER PANEL
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#172036',

          border:
            '1px solid #2A364F',

          borderRadius:
            3,

          p:
            2.5,

          mb:
            3
        }}
      >

        <Grid
          container
          spacing={2}
        >

          {/* SEARCH */}

          <Grid
            item
            xs={12}
            md={4}
          >

            <TextField
              fullWidth
              value={
                searchText
              }
              onChange={
                (e) =>
                  setSearchText(
                    e.target.value
                  )
              }
              placeholder="Search name or specialty..."
              InputProps={{
                startAdornment: (
                  <Search
                    size={18}
                    style={{
                      marginRight:
                        8
                    }}
                  />
                )
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

          </Grid>


          {/* SPECIALTY */}

          <Grid
            item
            xs={12}
            md={3}
          >

            <TextField
              select
              fullWidth
              label="Specialty"
              value={
                specialtyFilter
              }
              onChange={
                (e) =>
                  setSpecialtyFilter(
                    e.target.value
                  )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    color:
                      '#FFF',

                    backgroundColor:
                      '#0F172A'
                  },

                '& .MuiInputLabel-root':
                  {
                    color:
                      '#94A3B8'
                  }
              }}
            >

              <MenuItem value="ALL">
                All Specialties
              </MenuItem>


              {specialties.map(
                (specialty) => (

                  <MenuItem
                    key={
                      specialty
                    }
                    value={
                      specialty
                    }
                  >
                    {specialty}
                  </MenuItem>

                )
              )}

            </TextField>

          </Grid>


          {/* AVAILABILITY */}

          <Grid
            item
            xs={12}
            md={2.5}
          >

            <TextField
              select
              fullWidth
              label="Availability"
              value={
                availabilityFilter
              }
              onChange={
                (e) =>
                  setAvailabilityFilter(
                    e.target.value
                  )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    color:
                      '#FFF',

                    backgroundColor:
                      '#0F172A'
                  },

                '& .MuiInputLabel-root':
                  {
                    color:
                      '#94A3B8'
                  }
              }}
            >

              <MenuItem value="ALL">
                All
              </MenuItem>

              <MenuItem value="AVAILABLE">
                Available
              </MenuItem>

              <MenuItem value="UNAVAILABLE">
                Unavailable
              </MenuItem>

            </TextField>

          </Grid>


          {/* RATING */}

          <Grid
            item
            xs={12}
            md={2.5}
          >

            <TextField
              select
              fullWidth
              label="Minimum Rating"
              value={
                ratingFilter
              }
              onChange={
                (e) =>
                  setRatingFilter(
                    e.target.value
                  )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    color:
                      '#FFF',

                    backgroundColor:
                      '#0F172A'
                  },

                '& .MuiInputLabel-root':
                  {
                    color:
                      '#94A3B8'
                  }
              }}
            >

              <MenuItem value="ALL">
                Any Rating
              </MenuItem>

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

      </Paper>


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
          LOADING
      =================================================== */}

      {loading ? (

        <Box
          sx={{
            display:
              'flex',

            justifyContent:
              'center',

            mt:
              8
          }}
        >

          <CircularProgress />

        </Box>

      ) : (

        <>
          {/* RESULT COUNT */}

          <Typography
            variant="body2"
            sx={{
              color:
                '#94A3B8',

              mb:
                2
            }}
          >
            {
              filteredTechnicians.length
            } technician(s) found
          </Typography>


          {/* NO RESULT */}

          {filteredTechnicians.length ===
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
                  color:
                    '#FFF',

                  mt:
                    1.5,

                  fontWeight:
                    700
                }}
              >
                No technicians found
              </Typography>


              <Typography
                sx={{
                  color:
                    '#94A3B8'
                }}
              >
                Try changing your search or filters.
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
                    tech.availableDays
                      ?.split(',')
                      .map(
                        (day) =>
                          day.trim()
                      )
                      .filter(Boolean) ||
                    [];


                  const serviceAreas =
                    tech.serviceAreas
                      ?.split(',')
                      .map(
                        (area) =>
                          area.trim()
                      )
                      .filter(Boolean) ||
                    [];


                  return (

                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      key={
                        tech.id
                      }
                    >

                      <Paper
                        elevation={0}
                        sx={{
                          height:
                            '100%',

                          backgroundColor:
                            '#172036',

                          border:
                            '1px solid #2A364F',

                          borderRadius:
                            3,

                          p:
                            3
                        }}
                      >

                        {/* ===================================
                            TECH HEADER
                        =================================== */}

                        <Box
                          sx={{
                            display:
                              'flex',

                            gap:
                              2,

                            mb:
                              2
                          }}
                        >

                          <Avatar
                            src={
                              tech.avatar ||
                              ''
                            }
                            sx={{
                              width:
                                58,

                              height:
                                58,

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
                              flexGrow:
                                1
                            }}
                          >

                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight:
                                  800
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
                                  '#38BDF8'
                              }}
                            >
                              {
                                tech.specialty ||
                                'Technical Specialist'
                              }
                            </Typography>


                            <Chip
                              size="small"
                              label={
                                tech.isAvailable
                                  ? 'Available'
                                  : 'Unavailable'
                              }
                              sx={{
                                mt:
                                  0.7,

                                backgroundColor:
                                  tech.isAvailable
                                    ? 'rgba(16,185,129,.15)'
                                    : 'rgba(239,68,68,.15)',

                                color:
                                  tech.isAvailable
                                    ? '#10B981'
                                    : '#EF4444',

                                fontWeight:
                                  700
                              }}
                            />

                          </Box>

                        </Box>


                        {/* ===================================
                            RATING
                        =================================== */}

                        <Box
                          sx={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              1,

                            mb:
                              2
                          }}
                        >

                          <Rating
                            value={
                              Number(
                                tech.rating
                              ) || 0
                            }
                            precision={
                              0.1
                            }
                            readOnly
                            size="small"
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
                              Number(
                                tech.rating ||
                                0
                              ).toFixed(
                                1
                              )
                            }
                          </Typography>

                        </Box>


                        {/* ===================================
                            WORKING HOURS
                        =================================== */}

                        <Box
                          sx={{
                            display:
                              'flex',

                            gap:
                              1,

                            mb:
                              1.5
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

                        </Box>


                        {/* ===================================
                            CONTACT
                        =================================== */}

                        {tech.user?.phone && (

                          <Box
                            sx={{
                              display:
                                'flex',

                              gap:
                                1,

                              mb:
                                1
                            }}
                          >

                            <Phone
                              size={16}
                              color="#10B981"
                            />


                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  '#CBD5E1'
                              }}
                            >
                              {
                                tech.user.phone
                              }
                            </Typography>

                          </Box>

                        )}


                        {tech.user?.email && (

                          <Box
                            sx={{
                              display:
                                'flex',

                              gap:
                                1,

                              mb:
                                2
                            }}
                          >

                            <Mail
                              size={16}
                              color="#38BDF8"
                            />


                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  '#CBD5E1',

                                wordBreak:
                                  'break-all'
                              }}
                            >
                              {
                                tech.user.email
                              }
                            </Typography>

                          </Box>

                        )}


                        {/* ===================================
                            AVAILABLE DAYS
                        =================================== */}

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
                            display:
                              'flex',

                            flexWrap:
                              'wrap',

                            gap:
                              0.7,

                            mt:
                              0.7,

                            mb:
                              2
                          }}
                        >

                          {availableDays.length >
                          0 ? (

                            availableDays.map(
                              (day) => (

                                <Chip
                                  key={
                                    day
                                  }
                                  size="small"
                                  label={
                                    day
                                  }
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


                        {/* ===================================
                            SERVICE AREA
                        =================================== */}

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
                            display:
                              'flex',

                            flexWrap:
                              'wrap',

                            gap:
                              0.7,

                            mt:
                              0.7
                          }}
                        >

                          {serviceAreas.length >
                          0 ? (

                            serviceAreas.map(
                              (area) => (

                                <Chip
                                  key={
                                    area
                                  }
                                  size="small"
                                  icon={
                                    <MapPin
                                      size={13}
                                    />
                                  }
                                  label={
                                    area
                                  }
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

                      </Paper>

                    </Grid>

                  );
                }
              )}

            </Grid>

          )}

        </>
      )}

    </Box>
  );
};