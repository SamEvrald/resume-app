// frontend/src/services/api.js
import axios from 'axios';
import { auth } from './firebase'; // Import Firebase Auth to get the ID token

// Base URL for your Express.js backend API
// Ensure this matches the PORT in your backend/.env (default 5000)
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Firebase ID token to outgoing requests
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Get the Firebase ID token
      const idToken = await user.getIdToken();
      // Add the ID token to the Authorization header
      config.headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.error('Error getting Firebase ID token:', error);
    // You might want to handle token retrieval errors, e.g., redirect to login
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
