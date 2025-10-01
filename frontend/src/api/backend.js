import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const planRoute = async (startLat, startLon, endLat, endLon, departureTime = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/route/plan`, {
      start_lat: startLat,
      start_lon: startLon,
      end_lat: endLat,
      end_lon: endLon,
      departure_time: departureTime
    });
    return response.data;
  } catch (error) {
    console.error('Error planning route:', error);
    throw error;
  }
};

export const getWeatherForecast = async (latitude, longitude, startTime) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/weather/forecast`, {
      latitude,
      longitude,
      start_time: startTime
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

export const getRecommendedDeparture = async (startLat, startLon, endLat, endLon, timeWindowHours = 12) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recommendation/departure`, {
      start_lat: startLat,
      start_lon: startLon,
      end_lat: endLat,
      end_lon: endLon,
      time_window_hours: timeWindowHours
    });
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

export const searchLocations = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/geocoding/search`, {
      params: { q: query }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};