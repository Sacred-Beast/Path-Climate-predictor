from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from ..utils.osmnx_wrapper import OpenRouteServiceAPI
from ..utils.segmenter import RouteSegmenter
from ..utils.openmeteo_api import OpenMeteoAPI
from ..ml.prophet_model import WeatherPredictor
from ..ml.severity_score import SeverityScorer

router = APIRouter()

class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    departure_time: Optional[str] = None

@router.post("/plan")
async def plan_route(request: RouteRequest):
    """Plan route with weather predictions and risk assessment"""
    try:
        if request.departure_time:
            departure_time = datetime.fromisoformat(request.departure_time.replace('Z', '+00:00'))
        else:
            departure_time = datetime.now()
        
        route_data = OpenRouteServiceAPI.get_route(
            (request.start_lon, request.start_lat),
            (request.end_lon, request.end_lat)
        )
        
        if not route_data:
            raise HTTPException(status_code=400, detail="Could not find route")
        
        coordinates = route_data["coordinates"]
        total_duration = route_data["duration"]
        total_distance = route_data["distance"]
        
        segments = RouteSegmenter.segment_route(
            coordinates, 
            total_duration, 
            segment_distance=5000,
            departure_time=departure_time
        )
        
        enriched_segments = []
        for segment in segments:
            center_lat = segment["center_coord"][1]
            center_lon = segment["center_coord"][0]
            segment_eta = datetime.fromisoformat(segment["eta"])
            
            weather_data = OpenMeteoAPI.fetch_weather(center_lat, center_lon, segment_eta)
            
            if weather_data:
                predicted = WeatherPredictor.predict_weather(weather_data, segment_eta)
            else:
                predicted = {
                    "temperature": None,
                    "precipitation": 0,
                    "windspeed": 0,
                    "weathercode": 0
                }
            
            risk = SeverityScorer.calculate_risk_score(predicted, segment["distance"])
            
            enriched_segments.append({
                **segment,
                "weather": {
                    **predicted,
                    "description": SeverityScorer.get_weather_description(predicted.get("weathercode", 0))
                },
                "risk": risk
            })
        
        overall_risk = sum(s["risk"]["severity_score"] for s in enriched_segments) / len(enriched_segments) if enriched_segments else 0
        
        return {
            "route": {
                "total_distance": total_distance,
                "total_duration": total_duration,
                "departure_time": departure_time.isoformat(),
                "coordinates": coordinates
            },
            "segments": enriched_segments,
            "overall_risk": round(overall_risk, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
