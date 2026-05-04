import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://ac-service-ecru.vercel.app/api' });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  sendOtp: (data) => API.post('/auth/send-otp', data),
  verifyOtp: (data) => API.post('/auth/verify-otp', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/updateprofile', data),
  changePassword: (data) => API.put('/auth/changepassword', data),
  getUsers: () => API.get('/auth/users'),
  deleteUser: (id) => API.delete(`/auth/users/${id}`),
  toggleUserStatus: (id) => API.put(`/auth/users/${id}/status`),
};

// Services
export const servicesAPI = {
  getAll: (params) => API.get('/services', { params }),
  getOne: (id) => API.get(`/services/${id}`),
  create: (data) => API.post('/services', data),
  update: (id, data) => API.put(`/services/${id}`, data),
  delete: (id) => API.delete(`/services/${id}`),
};

// Bookings
export const bookingsAPI = {
  getAll: () => API.get('/bookings'),
  getOne: (id) => API.get(`/bookings/${id}`),
  create: (data) => API.post('/bookings', data),
  updateStatus: (id, data) => API.put(`/bookings/${id}/status`, data),
  assign: (id, data) => API.put(`/bookings/${id}/assign`, data),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
  getRecommendations: () => API.get('/bookings/recommendations'),
};

// Technicians
export const techniciansAPI = {
  getAll: () => API.get('/technicians'),
  getOne: (id) => API.get(`/technicians/${id}`),
  getMyProfile: () => API.get('/technicians/profile/me'),
  getLiveTracking: () => API.get('/technicians/live/tracking'),
  create: (data) => API.post('/technicians', data),
  update: (id, data) => API.put(`/technicians/${id}`, data),
  updateStatus: (data) => API.put('/technicians/status', data),
  updateLocation: (data) => API.put('/technicians/location', data),
  delete: (id) => API.delete(`/technicians/${id}`),
};

// Inventory
export const inventoryAPI = {
  getAll: (params) => API.get('/inventory', { params }),
  getOne: (id) => API.get(`/inventory/${id}`),
  create: (data) => API.post('/inventory', data),
  update: (id, data) => API.put(`/inventory/${id}`, data),
  restock: (id, data) => API.put(`/inventory/${id}/restock`, data),
  delete: (id) => API.delete(`/inventory/${id}`),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
  getRevenue: (params) => API.get('/analytics/revenue', { params }),
};

// Payments
export const paymentsAPI = {
  initiate: (data) => API.post('/payments/initiate', data),
  getInvoice: (bookingId) => API.get(`/payments/invoice/${bookingId}`),
};

// Notifications
export const notificationsAPI = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

export default API;
