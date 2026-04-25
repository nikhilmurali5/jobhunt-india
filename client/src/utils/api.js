import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ✅ FORCE ADD HEADER EVERY TIME
api.interceptors.request.use((config) => {
  const key = sessionStorage.getItem('admin_key');

  console.log("ADMIN KEY:", key); // 🔍 DEBUG

  if (key) {
    config.headers = {
      ...config.headers,
      'x-admin-key': key
    };
  }

  return config;
});

// Jobs
export const fetchJobs = (params = {}) => api.get('/jobs', { params });
export const fetchJob = (id) => api.get(`/jobs/${id}`);
export const fetchFeaturedJobs = () => api.get('/jobs/featured');

// Apply
export const submitApplication = (data) => api.post('/apply', data);

// Admin (NO KEY NEEDED NOW)
export const fetchApplications = (params = {}) =>
  api.get('/admin/applications', { params });

export const fetchAdminStats = () =>
  api.get('/admin/stats');

export const postJob = (jobData) =>
  api.post('/admin/job', jobData);

export default api;
