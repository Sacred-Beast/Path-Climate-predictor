import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Planner can be slow (Stan / cmdstan processing). Increase timeout to 60s.
const api = axios.create({ baseURL: API_BASE_URL, timeout: 9000000000 });

const cache = new Map();

const request = async ({ method = 'get', url, data = null, params = null, cacheKey = null }) => {
  if (cacheKey && cache.has(cacheKey)) return cache.get(cacheKey);
  try {
    const res = await api.request({ method, url, data, params });
    if (cacheKey) cache.set(cacheKey, res.data);
    return res.data;
  } catch (e) {
    // normalize error with more context for debugging
    const status = e?.response?.status;
    const respData = e?.response?.data;
    const detail = respData?.detail || respData || e?.message || 'Unknown error';
    const msg = status
      ? `${method.toUpperCase()} ${url} failed with status ${status}: ${JSON.stringify(detail)}`
      : `Network error calling ${method.toUpperCase()} ${url}: ${String(detail)}`;
    // keep stack by throwing an Error
    throw new Error(msg);
  }
};

export const planRoute = (startLat, startLon, endLat, endLon, departureTime = null) =>
  request({ method: 'post', url: '/route/plan', data: { start_lat: startLat, start_lon: startLon, end_lat: endLat, end_lon: endLon, departure_time: departureTime } });

export const getWeatherForecast = (latitude, longitude, startTime) =>
  request({ method: 'post', url: '/weather/forecast', data: { latitude, longitude, start_time: startTime } });

export const getRecommendedDeparture = (startLat, startLon, endLat, endLon, timeWindowHours = 12) =>
  request({ method: 'post', url: '/recommendation/departure', data: { start_lat: startLat, start_lon: startLon, end_lat: endLat, end_lon: endLon, time_window_hours: timeWindowHours } });

export const searchLocations = async (query) => {
  if (!query || query.length < 2) return [];
  return request({ method: 'get', url: '/geocoding/search', params: { q: query }, cacheKey: `search:${query}` }).then(r => r.results || []);
};