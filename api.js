import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Weather API services
export const weatherService = {
  getCurrentWeather: (city) => api.get(`/weather/current/${city}`),
  getForecast: (city) => api.get(`/weather/forecast/${city}`),
  getGlobalWeather: () => api.get('/weather/global'),
  addFavorite: (cityId, cityName) => api.post(`/weather/favorites/${cityId}/${cityName}`),
  getFavorites: () => api.get('/weather/favorites'),
  removeFavorite: (cityId) => api.delete(`/weather/favorites/${cityId}`)
};

// User API services
export const userService = {
    getCurrentUser: () => api.get('/users/me'),
    updateUser: (userData) => api.put('/users/me', userData),
    getSearchHistory: () => api.get('/users/search-history'),
    clearSearchHistory: () => api.delete('/users/search-history')
  };
  
  export default api;