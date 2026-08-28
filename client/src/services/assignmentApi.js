import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const assignmentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// ==========================================================
// MODULE 1 - FEATURE 4
// AUTOMATIC TECHNICIAN ASSIGNMENT
// NO LOCATION / NO DISTANCE
// ==========================================================


// Automatically find and assign the best technician
export const assignAutomaticBestTechnician = async (serviceRequestId) => {
  const response = await assignmentApi.post(
    `/assignments/requests/${serviceRequestId}/assign`
  );

  return response.data;
};


// Get latest technician assignment
export const getAutomaticLatestAssignment = async (serviceRequestId) => {
  const response = await assignmentApi.get(
    `/assignments/requests/${serviceRequestId}/latest`
  );

  return response.data;
};


// Customer accepts assigned technician
export const acceptAutomaticTechnician = async (serviceRequestId) => {
  const response = await assignmentApi.put(
    `/assignments/requests/${serviceRequestId}/accept`
  );

  return response.data;
};


// Customer rejects current technician and gets next best technician
export const reassignAutomaticTechnician = async (serviceRequestId) => {
  const response = await assignmentApi.put(
    `/assignments/requests/${serviceRequestId}/reassign`
  );

  return response.data;
};


// ==========================================================
// TECHNICIAN JOB REQUESTS
// Customer-confirmed automatic assignments
// ==========================================================

export const getTechnicianAcceptedJobs = async (technicianId) => {
  const response = await assignmentApi.get(
    `/assignments/technicians/${technicianId}/jobs`
  );

  return response.data;
};


export default assignmentApi;