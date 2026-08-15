import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

export const updateAppointmentStatus = async (appointmentId, statusData) => {
  const response = await api.put(`/appointments/${appointmentId}/status`, statusData);
  return response.data;
};

// Member 1 API Services
// Module 1 Feature 1: AI-Powered Issue Classification
export const classifyIssueWithAI = async (payload) => {
  const response = await api.post('/ai/classify', payload);
  return response.data;
};

// Module 2 Feature 1: Interactive AI Troubleshooting Assistant
export const sendTroubleshootMessage = async (payload) => {
  const response = await api.post('/ai/troubleshoot', payload);
  return response.data;
};

// Module 3 Feature: Issue Resolution History
export const getResolutionHistory = async (customerId) => {
  const response = await api.get(`/history/${customerId}`);
  return response.data;
};

// Module 3 Feature: Service Cost Estimation System
export const estimateServiceCost = async (payload) => {
  const response = await api.post('/cost-estimate', payload);
  return response.data;
};

export default api;
