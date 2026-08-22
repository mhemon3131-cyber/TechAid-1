import axios from 'axios';

const API_BASE_URL = 'http://localhost:1345/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Module 1 API Services
export const createServiceRequest = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data;
};

export const getServiceRequests = async () => {
  const response = await api.get('/requests');
  return response.data;
};

export const getRequestByTrackingId = async (trackingId) => {
  const response = await api.get(`/requests/${trackingId}`);
  return response.data;
};

// Module 2 API Services
export const getTechnicians = async () => {
  const response = await api.get('/technicians');
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const getAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

// AI & Troubleshooting API Services (Module 1)
export const classifyIssueWithAI = async (data) => {
  const response = await api.post('/ai/classify', data);
  return response.data;
};

export const sendTroubleshootMessage = async (data) => {
  const response = await api.post('/ai/troubleshoot', data);
  return response.data;
};

export const getResolutionHistory = async (userId) => {
  const response = await api.get(`/history${userId ? `?userId=${userId}` : ''}`);
  return response.data;
};

export const calculateEstimatedCost = async (data) => {
  const response = await api.post('/cost-estimation/calculate', data);
  return response.data;
};

export const estimateServiceCost = async (data) => {
  const response = await api.post('/cost-estimation/calculate', data);
  return response.data;
};

export const updateAppointmentStatus = async (appointmentId, statusData) => {
  const response = await api.put(`/appointments/${appointmentId}/status`, statusData);
  return response.data;
};

export default api;
