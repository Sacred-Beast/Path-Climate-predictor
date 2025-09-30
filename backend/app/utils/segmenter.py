from typing import List, Dict, Tuple
from datetime import datetime, timedelta
import math

class RouteSegmenter:
    @staticmethod
    def calculate_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates in meters using Haversine formula"""
        lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
        lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        radius = 6371000
        return radius * c
    
    @staticmethod
    def segment_route(coordinates: List[List[float]], total_duration: float, 
                     segment_distance: float = 5000, departure_time: datetime = None) -> List[Dict]:
        """
        Segment route into chunks based on distance
        coordinates: List of [lon, lat] pairs
        total_duration: Total trip duration in seconds
        segment_distance: Target distance per segment in meters (default 5km)
        """
        if not coordinates or len(coordinates) < 2:
            return []
        
        if departure_time is None:
            departure_time = datetime.now()
        
        segments = []
        current_distance = 0
        segment_start_idx = 0
        total_route_distance = 0
        
        for i in range(len(coordinates) - 1):
            coord1 = (coordinates[i][1], coordinates[i][0])
            coord2 = (coordinates[i + 1][1], coordinates[i + 1][0])
            dist = RouteSegmenter.calculate_distance(coord1, coord2)
            current_distance += dist
            total_route_distance += dist
            
            if current_distance >= segment_distance or i == len(coordinates) - 2:
                progress_ratio = total_route_distance / (total_route_distance + RouteSegmenter.calculate_distance(
                    (coordinates[i][1], coordinates[i][0]), 
                    (coordinates[-1][1], coordinates[-1][0])
                )) if i < len(coordinates) - 2 else 1.0
                
                time_offset = total_duration * progress_ratio
                eta = departure_time + timedelta(seconds=time_offset)
                
                mid_idx = (segment_start_idx + i + 1) // 2
                segment_center = coordinates[mid_idx]
                
                segments.append({
                    "id": len(segments),
                    "start_coord": coordinates[segment_start_idx],
                    "end_coord": coordinates[i + 1],
                    "center_coord": segment_center,
                    "distance": current_distance,
                    "eta": eta.isoformat(),
                    "coordinates": coordinates[segment_start_idx:i + 2]
                })
                
                current_distance = 0
                segment_start_idx = i + 1
        
        return segments
