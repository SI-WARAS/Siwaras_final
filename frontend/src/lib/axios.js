import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Helper for converting camelCase to snake_case
const toSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
// Helper for converting snake_case to camelCase
const toCamelCaseStr = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

const mapKeysDeep = (obj, fn) => {
  if (Array.isArray(obj)) {
    return obj.map(val => mapKeysDeep(val, fn));
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof File)) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[fn(key)] = mapKeysDeep(obj[key], fn);
      return acc;
    }, {});
  }
  return obj;
};

const mapValuesDeep = (obj, mapFn) => {
  if (Array.isArray(obj)) {
    return obj.map(val => mapValuesDeep(val, mapFn));
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof File)) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = mapValuesDeep(mapFn(key, obj[key]), mapFn);
      return acc;
    }, {});
  }
  return obj;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Transform request data to snake_case
  if (config.data && !(config.data instanceof FormData)) {
    // Translate ENUMs before mapping keys
    let data = mapValuesDeep(config.data, (key, value) => {
      if (key === 'activityLevel' || key === 'activity_level') {
        if (value === 'LOW') return 'rendah';
        if (value === 'MODERATE') return 'sedang';
        if (value === 'HIGH') return 'tinggi';
      }
      return value;
    });
    config.data = mapKeysDeep(data, toSnakeCase);
  }
  
  if (config.params) {
    config.params = mapKeysDeep(config.params, toSnakeCase);
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Transform response data to camelCase
    if (response.data && typeof response.data === 'object') {
      // First camelCase keys
      let data = mapKeysDeep(response.data, toCamelCaseStr);
      // Then reverse translate ENUMs
      data = mapValuesDeep(data, (key, value) => {
        if (key === 'activityLevel') {
          if (value === 'rendah') return 'LOW';
          if (value === 'sedang') return 'MODERATE';
          if (value === 'tinggi') return 'HIGH';
        }
        return value;
      });
      response.data = data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    // Also transform error response data to camelCase so frontend can read it
    if (error.response && error.response.data && typeof error.response.data === 'object') {
        error.response.data = mapKeysDeep(error.response.data, toCamelCaseStr);
    }
    return Promise.reject(error);
  }
);

export default api;
