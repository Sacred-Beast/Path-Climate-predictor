from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime, timedelta
from ..utils.osmnx_wrapper import OpenRouteServiceAPI
from ..utils.segmenter import RouteSegmenter
from ..utils.openmeteo_api import OpenMeteoAPI
from ..ml.severity_score import SeverityScorer

router = APIRouter()

class RecommendationRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    time_window_hours: int = 12

@router.post("/departure")
async def recommend_departure(request: RecommendationRequest):
    """Recommend best departure time to minimize weather risk"""
    try:
        route_data = OpenRouteServiceAPI.get_route(
            (request.start_lon, request.start_lat),
            (request.end_lon, request.end_lat)
        )
        
        if not route_data:
            raise HTTPException(status_code=400, detail="Could not find route")
        
        coordinates = route_data["coordinates"]
        total_duration = route_data["duration"]
        
        recommendations = []
        current_time = datetime.now()
        
        for hour_offset in range(request.time_window_hours):
            departure_time = current_time + timedelta(hours=hour_offset)
            
            segments = RouteSegmenter.segment_route(
                coordinates,
                total_duration,
                segment_distance=5000,
                departure_time=departure_time
            )
            
            total_risk = 0
            segment_count = 0
            
            for segment in segments:
                center_lat = segment["center_coord"][1]
                center_lon = segment["center_coord"][0]
                segment_eta = datetime.fromisoformat(segment["eta"])
                
                weather_data = OpenMeteoAPI.fetch_weather(center_lat, center_lon, segment_eta)
                weather = OpenMeteoAPI.get_weather_at_time(weather_data, segment_eta)
                
                if weather:
                    risk = SeverityScorer.calculate_risk_score(weather, segment["distance"])
                    total_risk += risk["severity_score"]
                    segment_count += 1
            
            avg_risk = total_risk / segment_count if segment_count > 0 else 0
            
            recommendations.append({
                "departure_time": departure_time.isoformat(),
                "average_risk": round(avg_risk, 2),
                "risk_level": "safe" if avg_risk < 20 else "moderate" if avg_risk < 50 else "risky" if avg_risk < 75 else "dangerous"
            })
        
        recommendations.sort(key=lambda x: x["average_risk"])
        
        return {
            "route_info": {
                "distance": route_data["distance"],
                "duration": route_data["duration"]
            },
            "best_departure": recommendations[0],
            "all_recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))