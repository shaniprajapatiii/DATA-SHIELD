import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('datashield_user') || '{}');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Scanner
export const scanWebsite = (url) => api.post('/scan/url', { url });
export const scanPermissionsOnly = (url) => api.post('/scan/permissions', { url });
export const scanPolicy = (url) => api.post('/scan/policy', { url });
export const compareApps = (urlA, urlB) => api.post('/scan/compare', { urlA, urlB });

// Permissions
export const getPermissions = () => api.get('/monitor/permissions');
export const blockPermission = (type, app) => api.post('/monitor/block', { type, app });

// Auth
export const loginUser = (email, password) => api.post('/auth/login', { email, password });
export const registerUser = (email, password, name) => api.post('/auth/register', { email, password, name });

// Free APIs used internally
export const getWhoIs = (domain) =>
  fetch(`https://api.whois.vu/?q=${domain}`).then(r => r.json());

export const getSSLInfo = (domain) =>
  fetch(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&startNew=on&all=done`).then(r => r.json());

export default api;
