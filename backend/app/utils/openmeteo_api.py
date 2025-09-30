import requests
from datetime import datetime, timedelta
from typing import List, Dict

class OpenMeteoAPI:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    
    @staticmethod
    def fetch_weather(latitude: float, longitude: float, start_time: datetime = None) -> Dict:
        """Fetch weather forecast from Open-Meteo API"""
        if start_time is None:
            start_time = datetime.now()
        
        end_time = start_time + timedelta(days=7)
        
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": "temperature_2m,precipitation,windspeed_10m,weathercode",
            "timezone": "auto"
        }
        
        try:
            response = requests.get(OpenMeteoAPI.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                "hourly": data.get("hourly", {}),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "timezone": data.get("timezone")
            }
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return None
    
    @staticmethod
    def get_weather_at_time(weather_data: Dict, target_time: datetime) -> Dict:
        """Extract weather conditions at a specific time"""
        if not weather_data or "hourly" not in weather_data:
            return None
        
        hourly = weather_data["hourly"]
        times = hourly.get("time", [])
        
        target_time_str = target_time.strftime("%Y-%m-%dT%H:00")
        
        if target_time_str in times:
            idx = times.index(target_time_str)
            return {
                "time": times[idx],
                "temperature": hourly.get("temperature_2m", [None])[idx],
                "precipitation": hourly.get("precipitation", [None])[idx],
                "windspeed": hourly.get("windspeed_10m", [None])[idx],
                "weathercode": hourly.get("weathercode", [None])[idx]
            }
        
        for i, time_str in enumerate(times):
            if time_str >= target_time_str:
                return {
                    "time": times[i],
                    "temperature": hourly.get("temperature_2m", [None])[i],
                    "precipitation": hourly.get("precipitation", [None])[i],
                    "windspeed": hourly.get("windspeed_10m", [None])[i],
                    "weathercode": hourly.get("weathercode", [None])[i]
                }
        
        return None
