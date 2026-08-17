import axios from 'axios';

const API_BASE_URL =
  'http://localhost:1257/api';


const api =
  axios.create({
    baseURL:
      API_BASE_URL,

    headers: {
      'Content-Type':
        'application/json'
    }
  });


// ==========================================================
// SERVICE REQUEST APIs
// ==========================================================

export const createServiceRequest =
  async (
    payload
  ) => {

    const response =
      await api.post(
        '/requests',
        payload
      );

    return response.data;
  };


export const getServiceRequests =
  async () => {

    const response =
      await api.get(
        '/requests'
      );

    return response.data;
  };


// ==========================================================
// TECHNICIAN APIs
// ==========================================================

export const getTechnicians =
  async () => {

    const response =
      await api.get(
        '/technicians'
      );

    return response.data;
  };


// ==========================================================
// LOCATION SEARCH
// ==========================================================

export const searchLocations =
  async (
    query
  ) => {

    const response =
      await api.get(
        '/locations/search',
        {
          params: {
            q:
              query
          }
        }
      );

    return response.data;
  };


// ==========================================================
// ADDRESS -> LATITUDE / LONGITUDE
// ==========================================================

export const geocodeLocation =
  async (
    address
  ) => {

    const response =
      await api.post(
        '/locations/geocode',
        {
          address
        }
      );

    return response.data;
  };


// ==========================================================
// LATITUDE / LONGITUDE -> ADDRESS
// ==========================================================

export const reverseGeocodeLocation =
  async (
    latitude,
    longitude
  ) => {

    const response =
      await api.post(
        '/locations/reverse-geocode',
        {
          latitude,
          longitude
        }
      );

    return response.data;
  };


// ==========================================================
// TECHNICIAN LOCATION BY ADDRESS
// ==========================================================

export const saveTechnicianLocationByAddress =
  async (
    technicianId,
    address
  ) => {

    const response =
      await api.put(
        `/locations/technicians/${technicianId}/address`,
        {
          address
        }
      );

    return response.data;
  };


// ==========================================================
// REQUEST LOCATION BY ADDRESS
// ==========================================================

export const saveRequestLocationByAddress =
  async (
    serviceRequestId,
    address
  ) => {

    const response =
      await api.put(
        `/locations/requests/${serviceRequestId}/address`,
        {
          address
        }
      );

    return response.data;
  };


// ==========================================================
// TECHNICIAN LOCATION BY GPS
// ==========================================================

export const saveTechnicianLocation =
  async (
    technicianId,
    latitude,
    longitude
  ) => {

    const response =
      await api.put(
        `/assignments/technicians/${technicianId}/location`,
        {
          latitude,
          longitude
        }
      );

    return response.data;
  };


// ==========================================================
// SERVICE REQUEST LOCATION BY GPS
// ==========================================================

export const saveServiceRequestLocation =
  async (
    serviceRequestId,
    latitude,
    longitude,
    address = null
  ) => {

    const response =
      await api.put(
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

export const assignBestTechnician =
  async (
    serviceRequestId,
    schedule = {}
  ) => {

    const response =
      await api.post(
        `/assignments/${serviceRequestId}/assign`,
        schedule
      );

    return response.data;
  };


// ==========================================================
// GET LATEST ASSIGNMENT
// ==========================================================

export const getLatestAssignment =
  async (
    serviceRequestId
  ) => {

    const response =
      await api.get(
        `/assignments/${serviceRequestId}`
      );

    return response.data;
  };


// ==========================================================
// ACCEPT ASSIGNED TECHNICIAN
// ==========================================================

export const acceptAssignedTechnician =
  async (
    serviceRequestId
  ) => {

    const response =
      await api.put(
        `/assignments/${serviceRequestId}/accept`
      );

    return response.data;
  };


// ==========================================================
// REASSIGN TECHNICIAN
// ==========================================================

export const requestTechnicianReassignment =
  async (
    serviceRequestId
  ) => {

    const response =
      await api.post(
        `/assignments/${serviceRequestId}/reassign`
      );

    return response.data;
  };


// ==========================================================
// AI ISSUE CLASSIFIER
// ==========================================================

export const classifyIssueWithAI =
  async (
    payload
  ) => {

    const response =
      await api.post(
        '/ai/classify',
        payload
      );

    return response.data;
  };


// ==========================================================
// AI TROUBLESHOOT - ALIAS 1
// ==========================================================

export const troubleshootWithAI =
  async (
    payload
  ) => {

    const response =
      await api.post(
        '/ai/troubleshoot',
        payload
      );

    return response.data;
  };


// ==========================================================
// AI TROUBLESHOOT - ALIAS 2
// ==========================================================

export const sendTroubleshootMessage =
  async (
    payload
  ) => {

    const response =
      await api.post(
        '/ai/troubleshoot',
        payload
      );

    return response.data;
  };


// ==========================================================
// ISSUE RESOLUTION HISTORY - ALIAS 1
// ==========================================================

export const getIssueResolutionHistory =
  async (
    userId
  ) => {

    const response =
      await api.get(
        `/history/${userId}`
      );

    return response.data;
  };


// ==========================================================
// ISSUE RESOLUTION HISTORY - ALIAS 2
// ==========================================================

export const getResolutionHistory =
  async (
    userId
  ) => {

    const response =
      await api.get(
        `/history/${userId}`
      );

    return response.data;
  };


// ==========================================================
// SERVICE COST ESTIMATOR
// ==========================================================

export const estimateServiceCost =
  async (
    payload
  ) => {

    const response =
      await api.post(
        '/cost-estimate',
        payload
      );

    return response.data;
  };


export default api;