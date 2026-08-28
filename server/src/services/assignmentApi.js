import axios from 'axios';


const BASE_URL =
  'http://localhost:5000/api';


const assignmentApi =
  axios.create({
    baseURL:
      `${BASE_URL}/assignments`
  });


// ==========================================================
// SAVE TECHNICIAN CURRENT LOCATION
// ==========================================================

export const saveAssignmentTechnicianLocation =
  async (
    technicianId,
    latitude,
    longitude
  ) => {
    const response =
      await assignmentApi.put(
        `/technicians/${technicianId}/location`,
        {
          latitude,
          longitude
        }
      );

    return response.data;
  };


// ==========================================================
// SAVE CUSTOMER REQUEST LOCATION
// ==========================================================

export const saveAssignmentRequestLocation =
  async (
    serviceRequestId,
    latitude,
    longitude,
    address = null
  ) => {
    const response =
      await assignmentApi.put(
        `/requests/${serviceRequestId}/location`,
        {
          latitude,
          longitude,
          address
        }
      );

    return response.data;
  };


// ==========================================================
// AUTOMATIC BEST TECHNICIAN
//
// Customer date/time pathabe na.
// Backend automatically schedule choose korbe.
// ==========================================================

export const assignAutomaticBestTechnician =
  async (
    serviceRequestId
  ) => {
    const response =
      await assignmentApi.post(
        `/requests/${serviceRequestId}/assign`,
        {}
      );

    return response.data;
  };


// ==========================================================
// GET LATEST ASSIGNMENT
// ==========================================================

export const getAutomaticLatestAssignment =
  async (
    serviceRequestId
  ) => {
    const response =
      await assignmentApi.get(
        `/requests/${serviceRequestId}/latest`
      );

    return response.data;
  };


// ==========================================================
// ACCEPT
// ==========================================================

export const acceptAutomaticTechnician =
  async (
    serviceRequestId
  ) => {
    const response =
      await assignmentApi.put(
        `/requests/${serviceRequestId}/accept`
      );

    return response.data;
  };


// ==========================================================
// REJECT
// ==========================================================

export const rejectAutomaticTechnician =
  async (
    serviceRequestId
  ) => {
    const response =
      await assignmentApi.put(
        `/requests/${serviceRequestId}/reassign`
      );

    return response.data;
  };


// ==========================================================
// TECHNICIAN ACCEPTED JOBS
// ==========================================================

export const getTechnicianAutomaticJobs =
  async (
    technicianId
  ) => {
    const response =
      await assignmentApi.get(
        `/technicians/${technicianId}/jobs`
      );

    return response.data;
  };


export default assignmentApi;