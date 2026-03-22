import axios from 'axios';

const API = axios.create({
baseURL: import.meta.env.VITE_API_URL || '/api', // Use Vite proxy to avoid CORS
  timeout: 10000,
});

// Request interceptor - add auth token
API.interceptors.request.use((config) => {
  console.log('🌐 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: API.defaults.baseURL,
    fullURL: `${API.defaults.baseURL}${config.url}`,
  });
  
  // New authState format: {user: {...}, token: '...'}
  try {
    const authState = JSON.parse(localStorage.getItem('authState') || 'null');
    if (authState?.token) {
      config.headers.Authorization = `Bearer ${authState.token}`;
      console.log('🔐 Added Bearer token');
    }
  } catch (e) {
    console.warn('⚠️ Invalid authState in localStorage, clearing...');
    localStorage.removeItem('authState');
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - handle errors globally
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.url, response.status);
    return response;
  },
  
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error('❌ API Error:', {
        status,
        url: error.config?.url,
        message: data?.message || 'Unknown error',
      });
      
      // Auto-logout on 401 (except auth routes)
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/');
      if (status === 401 && !isAuthRoute) {
        console.log('🔓 Token expired/unauthorized - logging out');
        localStorage.removeItem('authState');
        localStorage.removeItem('hospitalUser'); // Legacy
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
      }
    } else if (error.request) {
      console.error('❌ Network Error:', error.request);
    } else {
      console.error('❌ Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default API;
