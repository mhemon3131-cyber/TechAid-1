import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    'Content-Type': 'application/json'
  }
});


// ==========================================================
// SERVICE REQUEST APIs
// ==========================================================

export const createServiceRequest = async (payload) => {
  const response = await api.post(
    '/requests',
    payload
  );

  return response.data;
};


export const getServiceRequests = async () => {
  const response = await api.get(
    '/requests'
  );

  return response.data;
};


// ==========================================================
// LOCATION SEARCH
//
// Example:
// searchLocations("Mirpur 10")
//
// Backend OpenStreetMap Bangladesh search kore
// matching locations return korbe.
// ==========================================================

export const searchLocations = async (query) => {
  const response = await api.get(
    '/locations/search',
    {
      params: {
        q: query
      }
    }
  );

  return response.data;
};


// ==========================================================
// ADDRESS -> LATITUDE / LONGITUDE
// ==========================================================

export const geocodeLocation = async (address) => {
  const response = await api.post(
    '/locations/geocode',
    {
      address
    }
  );

  return response.data;
};


// ==========================================================
// LATITUDE / LONGITUDE -> ADDRESS
//
// Current GPS coordinate-er readable location ber kore.
// ==========================================================

export const reverseGeocodeLocation = async (
  latitude,
  longitude
) => {
  const response = await api.post(
    '/locations/reverse-geocode',
    {
      latitude,
      longitude
    }
  );

  return response.data;
};


// ==========================================================
// TECHNICIAN LOCATION - ADDRESS
// ==========================================================

export const saveTechnicianLocationByAddress = async (
  technicianId,
  address
) => {
  const response = await api.put(
    `/locations/technicians/${technicianId}/address`,
    {
      address
    }
  );

  return response.data;
};


// ==========================================================
// CUSTOMER SERVICE REQUEST LOCATION - ADDRESS
// ==========================================================

export const saveRequestLocationByAddress = async (
  serviceRequestId,
  address
) => {
  const response = await api.put(
    `/locations/requests/${serviceRequestId}/address`,
    {
      address
    }
  );

  return response.data;
};


// ==========================================================
// TECHNICIAN LOCATION - CURRENT GPS COORDINATES
//
// Technician-er latest current location database-e
// update korar jonno.
// ==========================================================

export const saveTechnicianLocation = async (
  technicianId,
  latitude,
  longitude
) => {
  const response = await api.put(
    `/assignments/technicians/${technicianId}/location`,
    {
      latitude,
      longitude
    }
  );

  return response.data;
};


// ==========================================================
// CUSTOMER REQUEST LOCATION - CURRENT COORDINATES
// ==========================================================

export const saveServiceRequestLocation = async (
  serviceRequestId,
  latitude,
  longitude,
  address = null
) => {
  const response = await api.put(
    `/assignments/requests/${serviceRequestId}/location`,
    {
      latitude,
      longitude,
      address
    }
  );

  return response.data;
};


// ==========================================================
// AUTO ASSIGN BEST TECHNICIAN
// ==========================================================

export const assignBestTechnician = async (
  serviceRequestId,
  schedule = {}
) => {
  const response = await api.post(
    `/assignments/${serviceRequestId}/assign`,
    schedule
  );

  return response.data;
};


// ==========================================================
// GET LATEST ASSIGNMENT
// ==========================================================

export const getLatestAssignment = async (
  serviceRequestId
) => {
  const response = await api.get(
    `/assignments/${serviceRequestId}`
  );

  return response.data;
};


// ==========================================================
// ACCEPT ASSIGNED TECHNICIAN
// ==========================================================

export const acceptAssignedTechnician = async (
  serviceRequestId
) => {
  const response = await api.put(
    `/assignments/${serviceRequestId}/accept`
  );

  return response.data;
};


// ==========================================================
// REJECT / REQUEST ANOTHER TECHNICIAN
// ==========================================================

export const requestTechnicianReassignment = async (
  serviceRequestId
) => {
  const response = await api.post(
    `/assignments/${serviceRequestId}/reassign`
  );

  return response.data;
};


export default api;