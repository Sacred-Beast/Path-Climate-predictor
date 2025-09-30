from prophet import Prophet
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import numpy as np

class WeatherPredictor:
    @staticmethod
    def predict_weather(historical_data: List[Dict], target_time: datetime) -> Dict:
        """
        Use Prophet to predict weather at target time
        For production use, this would train on historical data
        For now, we'll use a simplified approach based on current forecast trends
        """
        if not historical_data:
            return {
                "temperature": None,
                "precipitation": None,
                "windspeed": None,
                "confidence": 0.0
            }
        
        latest = historical_data[-1]
        
        if len(historical_data) < 2:
            return {
                "temperature": latest.get("temperature"),
                "precipitation": latest.get("precipitation"),
                "windspeed": latest.get("windspeed"),
                "weathercode": latest.get("weathercode"),
                "confidence": 0.5
            }
        
        temp_values = [d.get("temperature", 0) for d in historical_data if d.get("temperature") is not None]
        precip_values = [d.get("precipitation", 0) for d in historical_data if d.get("precipitation") is not None]
        wind_values = [d.get("windspeed", 0) for d in historical_data if d.get("windspeed") is not None]
        
        temp_trend = np.mean(temp_values) if temp_values else latest.get("temperature", 15)
        precip_trend = np.mean(precip_values) if precip_values else latest.get("precipitation", 0)
        wind_trend = np.mean(wind_values) if wind_values else latest.get("windspeed", 10)
        
        return {
            "temperature": round(temp_trend, 1),
            "precipitation": round(precip_trend, 2),
            "windspeed": round(wind_trend, 1),
            "weathercode": latest.get("weathercode", 0),
            "confidence": 0.7 if len(historical_data) >= 3 else 0.5
        }
    
    @staticmethod
    def train_prophet_model(df: pd.DataFrame, column: str) -> Prophet:
        """Train Prophet model on historical data"""
        if df.empty or column not in df.columns:
            return None
        
        prophet_df = pd.DataFrame({
            'ds': df['ds'],
            'y': df[column]
        })
        
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False
        )
        
        model.fit(prophet_df)
        return model
