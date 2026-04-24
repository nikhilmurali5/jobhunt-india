import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Jobs
export const fetchJobs = (params = {}) => api.get('/jobs', { params });
export const fetchJob = (id) => api.get(`/jobs/${id}`);
export const fetchFeaturedJobs = () => api.get('/jobs/featured');

// Apply
export const submitApplication = (data) => api.post('/apply', data);

// Admin
export const adminLogin = (key) => ({ key });

export const fetchApplications = (key, params = {}) =>
  api.get('/admin/applications', { params, headers: { 'x-admin-key': key } });

export const fetchAdminStats = (key) =>
  api.get('/admin/stats', { headers: { 'x-admin-key': key } });

export const postJob = (key, jobData) =>
  api.post('/admin/job', jobData, { headers: { 'x-admin-key': key } });

export default api;
