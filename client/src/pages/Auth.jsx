import React, {
  useEffect,
  useState
} from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';

import {
  ArrowRight,
  LogIn,
  MapPin,
  Navigation,
  Search,
  Shield,
  User,
  UserPlus,
  Wrench
} from 'lucide-react';

import axios from 'axios';

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import {
  reverseGeocodeLocation,
  saveTechnicianLocation,
  searchLocations
} from '../services/api';


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
// BANGLADESH PHONE VALIDATION
// ==========================================================

const isValidBangladeshPhone = (
  value
) => {
  return /^(013|014|015|016|017|018|019)\d{8}$/.test(
    String(value || '').trim()
  );
};


// ==========================================================
// MAP CONTROLLER
// ==========================================================

const MapController = ({
  position
}) => {
  const map =
    useMap();


  useEffect(() => {
    if (
      position?.latitude !== undefined &&
      position?.longitude !== undefined
    ) {
      map.flyTo(
        [
          Number(
            position.latitude
          ),

          Number(
            position.longitude
          )
        ],

        16,

        {
          animate:
            true,

          duration:
            1.2
        }
      );
    }

  }, [
    position,
    map
  ]);


  return null;
};


// ==========================================================
// MAP CLICK HANDLER
// ==========================================================

const MapClickHandler = ({
  onMapSelect
}) => {
  useMapEvents({
    click(event) {
      onMapSelect(
        event.latlng.lat,
        event.latlng.lng
      );
    }
  });


  return null;
};


// ==========================================================
// AUTH PAGE
// ==========================================================

export const Auth = ({
  onLoginSuccess
}) => {

  const [
    isRegisterMode,
    setIsRegisterMode
  ] = useState(false);


  const [
    roleTab,
    setRoleTab
  ] = useState(
    'CUSTOMER'
  );


  const [
    name,
    setName
  ] = useState('');


  const [
    email,
    setEmail
  ] = useState('');


  const [
    password,
    setPassword
  ] = useState('');


  const [
    phone,
    setPhone
  ] = useState('');


  const [
    specialty,
    setSpecialty
  ] = useState(
    'Laptop & Desktop Specialist'
  );


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    error,
    setError
  ] = useState('');


  const [
    selectedLocation,
    setSelectedLocation
  ] = useState(null);


  const [
    pendingLocation,
    setPendingLocation
  ] = useState(null);


  const [
    editingLocation,
    setEditingLocation
  ] = useState(true);


  const [
    locationQuery,
    setLocationQuery
  ] = useState('');


  const [
    locationSuggestions,
    setLocationSuggestions
  ] = useState([]);


  const [
    locationSearchLoading,
    setLocationSearchLoading
  ] = useState(false);


  const [
    currentLocationLoading,
    setCurrentLocationLoading
  ] = useState(false);


  const [
    mapLocationLoading,
    setMapLocationLoading
  ] = useState(false);


  // ========================================================
  // TECHNICIAN SPECIALTIES
  // ========================================================

  const specialtiesList = [
    'Laptop & Desktop Specialist',
    'Smartphone Repair & OS Recovery',
    'Printer & Hardware Expert',
    'Networking & Internet Consultant'
  ];


  // ========================================================
  // CLEAN LOCATION NAME
  // ========================================================

  const getCleanLocationName = (
    location
  ) => {
    if (!location) {
      return '';
    }


    const address =
      location.address || {};


    const parts = [
      address.road,
      address.neighbourhood,
      address.suburb,
      address.city_district,
      address.city,
      address.town,
      address.village
    ].filter(Boolean);


    const unique =
      [...new Set(parts)];


    if (
      unique.length > 0
    ) {
      return unique
        .slice(0, 3)
        .join(', ');
    }


    if (
      location.displayName
    ) {
      return location.displayName
        .split(',')
        .slice(0, 3)
        .join(',');
    }


    return 'Selected Location';
  };


  // ========================================================
  // ROLE CHANGE
  // ========================================================

  const handleRoleChange = (
    role
  ) => {
    setRoleTab(
      role
    );


    setName('');

    setEmail('');

    setPassword('');

    setPhone('');


    setSelectedLocation(
      null
    );

    setPendingLocation(
      null
    );

    setLocationQuery('');

    setLocationSuggestions([]);

    setEditingLocation(
      true
    );

    setError('');
  };


  // ========================================================
  // LOCATION SEARCH
  // ========================================================

  useEffect(() => {
    const query =
      locationQuery.trim();


    if (
      !editingLocation ||
      query.length < 2
    ) {
      setLocationSuggestions([]);

      return;
    }


    const timer =
      setTimeout(
        async () => {
          setLocationSearchLoading(
            true
          );


          try {
            const response =
              await searchLocations(
                query
              );


            const results =
              response?.data ||
              [];


            setLocationSuggestions(
              results
            );


            if (
              results.length > 0
            ) {
              const best =
                results[0];


              setPendingLocation({
                latitude:
                  Number(
                    best.latitude
                  ),

                longitude:
                  Number(
                    best.longitude
                  ),

                displayName:
                  best.displayName,

                address:
                  best.address || {},

                source:
                  'SEARCH_PREVIEW'
              });
            }

          } catch (err) {
            console.log(
              'Location search failed:',
              err.message
            );


            setLocationSuggestions(
              []
            );

          } finally {
            setLocationSearchLoading(
              false
            );
          }

        },

        700
      );


    return () =>
      clearTimeout(
        timer
      );

  }, [
    locationQuery,
    editingLocation
  ]);


  // ========================================================
  // SELECT LOCATION
  // ========================================================

  const handleSuggestionSelect = (
    location
  ) => {
    const locationData = {
      latitude:
        Number(
          location.latitude
        ),

      longitude:
        Number(
          location.longitude
        ),

      displayName:
        location.displayName,

      address:
        location.address || {},

      source:
        'SEARCH'
    };


    setPendingLocation(
      locationData
    );


    setLocationQuery(
      location.displayName
    );


    setLocationSuggestions(
      []
    );
  };


  // ========================================================
  // MAP LOCATION
  // ========================================================

  const handleMapSelect =
    async (
      latitude,
      longitude
    ) => {
      setMapLocationLoading(
        true
      );

      setError('');


      let locationData = {
        latitude,

        longitude,

        displayName:
          `${latitude.toFixed(
            6
          )}, ${longitude.toFixed(
            6
          )}`,

        address: {},

        source:
          'MAP'
      };


      try {
        const response =
          await reverseGeocodeLocation(
            latitude,
            longitude
          );


        if (
          response?.data
        ) {
          locationData = {
            ...locationData,

            ...response.data,

            source:
              'MAP'
          };
        }

      } catch (err) {
        console.log(
          'Reverse geocode failed:',
          err.message
        );
      }


      setPendingLocation(
        locationData
      );


      setLocationQuery(
        locationData.displayName
      );


      setLocationSuggestions(
        []
      );


      setMapLocationLoading(
        false
      );
    };


  // ========================================================
  // CURRENT LOCATION
  // ========================================================

  const useCurrentLocation =
    async () => {
      setError('');


      if (
        !navigator.geolocation
      ) {
        setError(
          'Current location is not supported by this browser.'
        );

        return;
      }


      setCurrentLocationLoading(
        true
      );


      try {
        const position =
          await new Promise(
            (
              resolve,
              reject
            ) => {
              navigator.geolocation
                .getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy:
                      true,

                    timeout:
                      15000,

                    maximumAge:
                      0
                  }
                );
            }
          );


        await handleMapSelect(
          position.coords.latitude,
          position.coords.longitude
        );

      } catch (locationError) {
        if (
          locationError.code ===
          1
        ) {
          setError(
            'Location permission is blocked. Allow location access or search manually.'
          );

        } else {
          setError(
            'Unable to detect current location. Please search manually.'
          );
        }

      } finally {
        setCurrentLocationLoading(
          false
        );
      }
    };


  // ========================================================
  // CONFIRM LOCATION
  // ========================================================

  const confirmLocation = () => {
    if (
      !pendingLocation
    ) {
      setError(
        'Please search or select a location first.'
      );

      return;
    }


    setSelectedLocation({
      ...pendingLocation,

      capturedAt:
        new Date().toISOString()
    });


    setEditingLocation(
      false
    );


    setLocationSuggestions(
      []
    );


    setError('');
  };


  // ========================================================
  // CHANGE LOCATION
  // ========================================================

  const changeLocation = () => {
    setPendingLocation(
      selectedLocation
    );


    setLocationQuery(
      selectedLocation?.displayName ||
      ''
    );


    setEditingLocation(
      true
    );


    setLocationSuggestions(
      []
    );


    setError('');
  };


  // ========================================================
  // CANCEL LOCATION CHANGE
  // ========================================================

  const cancelLocationChange =
    () => {
      setPendingLocation(
        selectedLocation
      );


      setEditingLocation(
        false
      );


      setLocationSuggestions(
        []
      );


      setError('');
    };


  // ========================================================
  // COMPLETE LOGIN
  // ========================================================

  const completeLogin =
    async (
      user
    ) => {
      if (
        !selectedLocation
      ) {
        setError(
          'Please set your location before continuing.'
        );

        return;
      }


      if (
        user.role ===
        'CUSTOMER'
      ) {
        localStorage.setItem(
          'techaid_customer_location',

          JSON.stringify(
            selectedLocation
          )
        );


        onLoginSuccess({
          ...user,

          currentLocation:
            selectedLocation
        });


        return;
      }


      if (
        user.role ===
        'TECHNICIAN'
      ) {
        const technicianId =
          user.technicianId;


        if (!technicianId) {
          setError(
            'Technician profile is missing.'
          );

          return;
        }


        localStorage.setItem(
          'techaid_technician_location',

          JSON.stringify(
            selectedLocation
          )
        );


        try {
          await saveTechnicianLocation(
            technicianId,

            selectedLocation.latitude,

            selectedLocation.longitude
          );

        } catch (err) {
          console.log(
            'Technician location save failed:',
            err.message
          );


          setError(
            'Login succeeded, but technician location could not be saved.'
          );

          return;
        }


        onLoginSuccess({
          ...user,

          currentLocation:
            selectedLocation
        });
      }
    };


  // ========================================================
  // LOGIN
  // ========================================================

  const handleLogin =
    async () => {
      setError('');


      const cleanEmail =
        email
          .toLowerCase()
          .trim();


      const cleanPassword =
        password.trim();


      if (
        !cleanEmail ||
        !cleanPassword
      ) {
        setError(
          'Please enter email and password.'
        );

        return;
      }


      if (
        !selectedLocation
      ) {
        setError(
          'Please set your location before login.'
        );

        return;
      }


      setLoading(
        true
      );


      try {
        const response =
          await axios.post(
            'http://localhost:5000/api/auth/login',

            {
              email:
                cleanEmail,

              password:
                cleanPassword,

              role:
                roleTab
            }
          );


        if (
          response.data.success
        ) {
          await completeLogin(
            response.data.user
          );
        }

      } catch (err) {
        console.log(
          'Login failed:',
          err?.response?.data ||
          err.message
        );


        setError(
          err?.response?.data?.message ||
          'Unable to login.'
        );

      } finally {
        setLoading(
          false
        );
      }
    };


  // ========================================================
  // REGISTER
  // ========================================================

  const handleRegister =
    async () => {
      setError('');


      const cleanName =
        name.trim();


      const cleanEmail =
        email
          .toLowerCase()
          .trim();


      const cleanPassword =
        password.trim();


      const cleanPhone =
        phone.trim();


      if (
        !cleanName ||
        !cleanEmail ||
        !cleanPassword ||
        !cleanPhone
      ) {
        setError(
          'Please provide name, email, password and phone number.'
        );

        return;
      }


      if (
        !isValidBangladeshPhone(
          cleanPhone
        )
      ) {
        setError(
          'Enter a valid 11-digit Bangladesh mobile number.'
        );

        return;
      }


      if (
        !selectedLocation
      ) {
        setError(
          'Please set your location before creating the account.'
        );

        return;
      }


      setLoading(
        true
      );


      try {
        const response =
          await axios.post(
            'http://localhost:5000/api/auth/register',

            {
              name:
                cleanName,

              email:
                cleanEmail,

              password:
                cleanPassword,

              role:
                roleTab,

              phone:
                cleanPhone,

              specialty:
                roleTab ===
                'TECHNICIAN'
                  ? specialty
                  : undefined
            }
          );


        if (
          response.data.success
        ) {
          await completeLogin(
            response.data.user
          );
        }

      } catch (err) {
        console.log(
          'Registration failed:',
          err?.response?.data ||
          err.message
        );


        setError(
          err?.response?.data?.message ||
          'Unable to create account.'
        );

      } finally {
        setLoading(
          false
        );
      }
    };


  // ========================================================
  // MAP CENTER
  // ========================================================

  const mapCenter =
    pendingLocation
      ? [
          Number(
            pendingLocation.latitude
          ),

          Number(
            pendingLocation.longitude
          )
        ]

      : [
          23.8103,
          90.4125
        ];


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

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'center',

        p:
          3
      }}
    >

      <Paper
        elevation={0}
        sx={{
          width:
            '100%',

          maxWidth:
            560,

          backgroundColor:
            '#172036',

          border:
            '1px solid #2A364F',

          borderRadius:
            4,

          p: {
            xs:
              2.5,

            sm:
              4
          }
        }}
      >

        {/* BRAND */}

        <Box
          sx={{
            textAlign:
              'center',

            mb:
              3
          }}
        >

          <Box
            sx={{
              width:
                54,

              height:
                54,

              margin:
                '0 auto',

              mb:
                1.5,

              borderRadius:
                '15px',

              backgroundColor:
                '#00A8FF',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center'
            }}
          >
            <Shield
              size={31}
              color="#0D1527"
            />
          </Box>


          <Typography
            variant="h5"
            sx={{
              color:
                '#FFFFFF',

              fontWeight:
                800
            }}
          >
            Tech
            <span
              style={{
                color:
                  '#00A8FF'
              }}
            >
              Aid
            </span>
          </Typography>


          <Typography
            sx={{
              color:
                '#94A3B8',

              mt:
                0.5
            }}
          >
            Smart technical support platform
          </Typography>

        </Box>


        {/* SIGN IN / REGISTER */}

        <Box
          sx={{
            display:
              'flex',

            backgroundColor:
              '#0F172A',

            borderRadius:
              2,

            p:
              0.5,

            mb:
              2
          }}
        >

          <Button
            fullWidth
            startIcon={
              <LogIn
                size={16}
              />
            }
            onClick={() => {
              setIsRegisterMode(
                false
              );

              setError('');
            }}
            sx={{
              backgroundColor:
                !isRegisterMode
                  ? '#00A8FF'
                  : 'transparent',

              color:
                !isRegisterMode
                  ? '#0D1527'
                  : '#94A3B8',

              fontWeight:
                700
            }}
          >
            Sign In
          </Button>


          <Button
            fullWidth
            startIcon={
              <UserPlus
                size={16}
              />
            }
            onClick={() => {
              setIsRegisterMode(
                true
              );

              setError('');
            }}
            sx={{
              backgroundColor:
                isRegisterMode
                  ? '#00A8FF'
                  : 'transparent',

              color:
                isRegisterMode
                  ? '#0D1527'
                  : '#94A3B8',

              fontWeight:
                700
            }}
          >
            Create Account
          </Button>

        </Box>


        {/* ROLE */}

        <Grid
          container
          spacing={1}
          sx={{
            mb:
              2
          }}
        >

          <Grid
            item
            xs={6}
          >

            <Button
              fullWidth
              startIcon={
                <User
                  size={18}
                />
              }
              onClick={() =>
                handleRoleChange(
                  'CUSTOMER'
                )
              }
              sx={{
                border:
                  roleTab ===
                    'CUSTOMER'
                    ? '1px solid #00A8FF'
                    : '1px solid #334155',

                color:
                  roleTab ===
                    'CUSTOMER'
                    ? '#00A8FF'
                    : '#94A3B8'
              }}
            >
              Customer
            </Button>

          </Grid>


          <Grid
            item
            xs={6}
          >

            <Button
              fullWidth
              startIcon={
                <Wrench
                  size={18}
                />
              }
              onClick={() =>
                handleRoleChange(
                  'TECHNICIAN'
                )
              }
              sx={{
                border:
                  roleTab ===
                    'TECHNICIAN'
                    ? '1px solid #00A8FF'
                    : '1px solid #334155',

                color:
                  roleTab ===
                    'TECHNICIAN'
                    ? '#00A8FF'
                    : '#94A3B8'
              }}
            >
              Technician
            </Button>

          </Grid>

        </Grid>


        {/* LOCATION */}

        {selectedLocation &&
        !editingLocation ? (

          <Box
            sx={{
              backgroundColor:
                '#0F172A',

              border:
                '1px solid #334155',

              borderRadius:
                2,

              p:
                2,

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

                justifyContent:
                  'space-between',

                gap:
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
                    1
                }}
              >

                <MapPin
                  size={18}
                  color="#10B981"
                />


                <Typography
                  sx={{
                    color:
                      '#FFFFFF',

                    fontWeight:
                      700
                  }}
                >
                  {
                    getCleanLocationName(
                      selectedLocation
                    )
                  }
                </Typography>

              </Box>


              <Button
                size="small"
                onClick={
                  changeLocation
                }
                sx={{
                  color:
                    '#00A8FF'
                }}
              >
                Change
              </Button>

            </Box>

          </Box>

        ) : (

          <Box
            sx={{
              backgroundColor:
                '#0F172A',

              border:
                '1px solid #334155',

              borderRadius:
                2,

              p:
                2,

              mb:
                2
            }}
          >

            <Typography
              sx={{
                color:
                  '#FFFFFF',

                fontWeight:
                  800,

                mb:
                  1.2
              }}
            >
              Set Location
            </Typography>


            <TextField
              fullWidth
              size="small"
              value={
                locationQuery
              }
              onChange={(e) =>
                setLocationQuery(
                  e.target.value
                )
              }
              placeholder="Search any Bangladesh location..."
              InputProps={{
                startAdornment:
                  (
                    <Search
                      size={17}
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
                      '#FFFFFF',

                    backgroundColor:
                      '#172036'
                  }
              }}
            />


            {locationSearchLoading && (

              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    1,

                  mt:
                    1
                }}
              >

                <CircularProgress
                  size={16}
                />


                <Typography
                  variant="caption"
                  sx={{
                    color:
                      '#94A3B8'
                  }}
                >
                  Searching location...
                </Typography>

              </Box>
            )}


            {locationSuggestions.length >
              0 && (

              <Box
                sx={{
                  mt:
                    1,

                  maxHeight:
                    180,

                  overflowY:
                    'auto',

                  border:
                    '1px solid #334155',

                  borderRadius:
                    1
                }}
              >

                {locationSuggestions.map(
                  (
                    location,
                    index
                  ) => (

                    <Button
                      key={
                        `${location.latitude}-${location.longitude}-${index}`
                      }
                      fullWidth
                      onClick={() =>
                        handleSuggestionSelect(
                          location
                        )
                      }
                      sx={{
                        justifyContent:
                          'flex-start',

                        textAlign:
                          'left',

                        textTransform:
                          'none',

                        color:
                          '#E2E8F0',

                        borderRadius:
                          0,

                        py:
                          1,

                        borderBottom:
                          index <
                          locationSuggestions.length -
                            1
                            ? '1px solid #263247'
                            : 'none'
                      }}
                    >

                      <MapPin
                        size={14}
                        style={{
                          marginRight:
                            8,

                          flexShrink:
                            0
                        }}
                      />


                      {
                        location.displayName
                      }

                    </Button>
                  )
                )}

              </Box>
            )}


            <Box
              sx={{
                mt:
                  1.5,

                height:
                  280,

                borderRadius:
                  2,

                overflow:
                  'hidden',

                border:
                  '1px solid #334155'
              }}
            >

              <MapContainer
                center={
                  mapCenter
                }
                zoom={
                  pendingLocation
                    ? 16
                    : 11
                }
                style={{
                  width:
                    '100%',

                  height:
                    '100%'
                }}
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                <MapController
                  position={
                    pendingLocation
                  }
                />


                <MapClickHandler
                  onMapSelect={
                    handleMapSelect
                  }
                />


                {pendingLocation && (

                  <Marker
                    position={[
                      Number(
                        pendingLocation.latitude
                      ),

                      Number(
                        pendingLocation.longitude
                      )
                    ]}
                  >

                    <Popup>
                      {
                        getCleanLocationName(
                          pendingLocation
                        )
                      }
                    </Popup>

                  </Marker>
                )}

              </MapContainer>

            </Box>


            {pendingLocation && (

              <Typography
                sx={{
                  color:
                    '#E2E8F0',

                  mt:
                    1,

                  fontSize:
                    14
                }}
              >
                📍 {
                  getCleanLocationName(
                    pendingLocation
                  )
                }
              </Typography>
            )}


            {mapLocationLoading && (

              <Typography
                variant="caption"
                sx={{
                  display:
                    'block',

                  mt:
                    1,

                  color:
                    '#94A3B8'
                }}
              >
                Checking selected location...
              </Typography>
            )}


            <Button
              fullWidth
              onClick={
                useCurrentLocation
              }
              disabled={
                currentLocationLoading
              }
              startIcon={
                currentLocationLoading
                  ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  )
                  : (
                    <Navigation
                      size={17}
                    />
                  )
              }
              sx={{
                mt:
                  1.5,

                border:
                  '1px solid #334155',

                color:
                  '#00A8FF'
              }}
            >
              {
                currentLocationLoading
                  ? 'Finding Location...'
                  : 'Use My Current Location'
              }
            </Button>


            <Button
              fullWidth
              variant="contained"
              disabled={
                !pendingLocation ||
                mapLocationLoading
              }
              onClick={
                confirmLocation
              }
              sx={{
                mt:
                  1,

                backgroundColor:
                  '#00A8FF',

                color:
                  '#0D1527',

                fontWeight:
                  800
              }}
            >
              Use This Location
            </Button>


            {selectedLocation && (

              <Button
                fullWidth
                onClick={
                  cancelLocationChange
                }
                sx={{
                  mt:
                    0.5,

                  color:
                    '#94A3B8'
                }}
              >
                Cancel
              </Button>
            )}

          </Box>
        )}


        {/* ERROR */}

        {error && (

          <Alert
            severity="error"
            sx={{
              mb:
                2
            }}
          >
            {error}
          </Alert>
        )}


        {/* NAME */}

        {isRegisterMode && (

          <TextField
            fullWidth
            size="small"
            label="Full Name"
            value={
              name
            }
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            sx={{
              mb:
                2,

              '& .MuiOutlinedInput-root':
                {
                  color:
                    '#FFFFFF',

                  backgroundColor:
                    '#0F172A'
                },

              '& .MuiInputLabel-root':
                {
                  color:
                    '#94A3B8'
                }
            }}
          />
        )}


        {/* EMAIL */}

        <TextField
          fullWidth
          size="small"
          type="email"
          label={
            roleTab ===
              'TECHNICIAN'
              ? 'Technician Email'
              : 'Email'
          }
          value={
            email
          }
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          placeholder="Email address"
          sx={{
            mb:
              2,

            '& .MuiOutlinedInput-root':
              {
                color:
                  '#FFFFFF',

                backgroundColor:
                  '#0F172A'
              },

            '& .MuiInputLabel-root':
              {
                color:
                  '#94A3B8'
              }
          }}
        />


        {/* PASSWORD */}

        <TextField
          fullWidth
          size="small"
          type="password"
          label="Password"
          value={
            password
          }
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          sx={{
            mb:
              2,

            '& .MuiOutlinedInput-root':
              {
                color:
                  '#FFFFFF',

                backgroundColor:
                  '#0F172A'
              },

            '& .MuiInputLabel-root':
              {
                color:
                  '#94A3B8'
              }
          }}
        />


        {/* PHONE */}

        {isRegisterMode && (

          <TextField
            fullWidth
            required
            size="small"
            label="Bangladesh Mobile Number"
            value={
              phone
            }
            onChange={(e) => {
              const onlyDigits =
                e.target.value
                  .replace(
                    /\D/g,
                    ''
                  )
                  .slice(
                    0,
                    11
                  );


              setPhone(
                onlyDigits
              );
            }}
            inputProps={{
              maxLength:
                11,

              inputMode:
                'numeric'
            }}
            sx={{
              mb:
                2,

              '& .MuiOutlinedInput-root':
                {
                  color:
                    '#FFFFFF',

                  backgroundColor:
                    '#0F172A'
                },

              '& .MuiInputLabel-root':
                {
                  color:
                    '#94A3B8'
                }
            }}
          />
        )}


        {/* TECH SPECIALTY */}

        {isRegisterMode &&
        roleTab ===
          'TECHNICIAN' && (

          <FormControl
            fullWidth
            size="small"
            sx={{
              mb:
                2
            }}
          >

            <Select
              value={
                specialty
              }
              onChange={(e) =>
                setSpecialty(
                  e.target.value
                )
              }
              sx={{
                color:
                  '#FFFFFF',

                backgroundColor:
                  '#0F172A'
              }}
            >

              {
                specialtiesList.map(
                  (item) => (

                    <MenuItem
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {item}
                    </MenuItem>
                  )
                )
              }

            </Select>

          </FormControl>
        )}


        {/* BUTTON */}

        <Button
          fullWidth
          variant="contained"
          disabled={
            loading ||
            !selectedLocation
          }
          onClick={
            isRegisterMode
              ? handleRegister
              : handleLogin
          }
          endIcon={
            !loading
              ? (
                <ArrowRight
                  size={17}
                />
              )
              : null
          }
          sx={{
            py:
              1.3,

            backgroundColor:
              selectedLocation
                ? '#00A8FF'
                : '#475569',

            color:
              '#0D1527',

            fontWeight:
              800
          }}
        >

          {
            loading
              ? (
                <CircularProgress
                  size={21}
                  color="inherit"
                />
              )
              : !selectedLocation
                ? 'Set Location to Continue'
                : isRegisterMode
                  ? 'Create Account'
                  : `Log In as ${
                      roleTab ===
                        'CUSTOMER'
                        ? 'Customer'
                        : 'Technician'
                    }`
          }

        </Button>

      </Paper>

    </Box>
  );
};