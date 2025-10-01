from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime, timedelta
from ..utils.openmeteo_api import OpenMeteoAPI
from ..ml.prophet_model import WeatherPredictor

router = APIRouter()

class ForecastRequest(BaseModel):
    latitude: float
    longitude: float
    start_time: str

@router.post("/forecast")
async def get_forecast(request: ForecastRequest):
    """Get weather forecast for a specific location and time"""
    try:
        start_time = datetime.fromisoformat(request.start_time.replace('Z', '+00:00'))
        
        weather_data = OpenMeteoAPI.fetch_weather(request.latitude, request.longitude, start_time)
        
        if not weather_data:
            raise HTTPException(status_code=400, detail="Could not fetch weather data")
        
        hourly = weather_data.get("hourly", {})
        times = hourly.get("time", [])
        
        forecasts = []
        for i, time_str in enumerate(times[:48]):
            forecasts.append({
                "time": time_str,
                "temperature": hourly.get("temperature_2m", [])[i],
                "precipitation": hourly.get("precipitation", [])[i],
                "windspeed": hourly.get("windspeed_10m", [])[i],
                "weathercode": hourly.get("weathercode", [])[i]
            })
        
        return {
            "location": {
                "latitude": weather_data.get("latitude"),
                "longitude": weather_data.get("longitude")
            },
            "forecasts": forecasts
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))