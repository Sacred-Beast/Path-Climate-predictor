from prophet import Prophet
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import numpy as np
import logging

logging.getLogger('prophet').setLevel(logging.WARNING)
logging.getLogger('cmdstanpy').setLevel(logging.WARNING)

class WeatherPredictor:
    @staticmethod
    def predict_weather_with_prophet(hourly_data: Dict, target_time: datetime, metric: str) -> float:
        """
        Use Prophet to predict a specific weather metric at target time
        hourly_data: Dictionary with 'time' and metric arrays from Open-Meteo
        target_time: When to predict
        metric: Which metric to predict (temperature_2m, precipitation, windspeed_10m)
        """
        try:
            if not hourly_data or metric not in hourly_data:
                return None
            
            times = hourly_data.get("time", [])
            values = hourly_data.get(metric, [])
            
            if len(times) < 10 or len(values) < 10:
                return values[0] if values else None
            
            df = pd.DataFrame({
                'ds': pd.to_datetime(times),
                'y': values
            })
            
            df = df.dropna()
            if len(df) < 10:
                return values[0] if values else None
            
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=False,
                yearly_seasonality=False,
                seasonality_mode='additive'
            )
            model.fit(df)
            
            future = pd.DataFrame({'ds': [pd.to_datetime(target_time)]})
            forecast = model.predict(future)
            
            predicted_value = forecast['yhat'].iloc[0]
            
            if metric in ['precipitation', 'windspeed_10m']:
                return max(0, predicted_value)
            return predicted_value
            
        except Exception as e:
            print(f"Prophet prediction error for {metric}: {e}")
            if hourly_data and metric in hourly_data:
                values = hourly_data[metric]
                return values[0] if values else None
            return None
    
    @staticmethod
    def predict_weather(weather_data: Dict, target_time: datetime) -> Dict:
        """
        Use Prophet to predict weather at target time based on forecast data
        weather_data: Full weather response from Open-Meteo with hourly data
        target_time: When to predict weather conditions
        """
        if not weather_data or "hourly" not in weather_data:
            return {
                "temperature": None,
                "precipitation": None,
                "windspeed": None,
                "weathercode": 0,
                "confidence": 0.0
            }
        
        hourly = weather_data["hourly"]
        
        try:
            temperature = WeatherPredictor.predict_weather_with_prophet(
                hourly, target_time, "temperature_2m"
            )
            precipitation = WeatherPredictor.predict_weather_with_prophet(
                hourly, target_time, "precipitation"
            )
            windspeed = WeatherPredictor.predict_weather_with_prophet(
                hourly, target_time, "windspeed_10m"
            )
            
            weathercodes = hourly.get("weathercode", [])
            weathercode = weathercodes[0] if weathercodes else 0
            
            confidence = 0.8
            
            return {
                "temperature": round(temperature, 1) if temperature is not None else None,
                "precipitation": round(precipitation, 2) if precipitation is not None else 0.0,
                "windspeed": round(windspeed, 1) if windspeed is not None else None,
                "weathercode": int(weathercode),
                "confidence": confidence
            }
        except Exception as e:
            print(f"Error in weather prediction: {e}")
            times = hourly.get("time", [])
            if not times:
                return {
                    "temperature": None,
                    "precipitation": 0.0,
                    "windspeed": None,
                    "weathercode": 0,
                    "confidence": 0.0
                }
            
            return {
                "temperature": hourly.get("temperature_2m", [None])[0],
                "precipitation": hourly.get("precipitation", [0.0])[0],
                "windspeed": hourly.get("windspeed_10m", [None])[0],
                "weathercode": hourly.get("weathercode", [0])[0],
                "confidence": 0.5
            }