import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Backend running on 5000 supposedly, actually the backend is set to process.env.PORT, assume 5000
  withCredentials: true // Important for cookies (JWT)
});

// Interceptor to attach token just in case cookies are an issue and we use auth header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
