import requests
from typing import List, Dict, Optional

class NominatimGeocoding:
    """Free geocoding service using OpenStreetMap Nominatim"""
    BASE_URL = "https://nominatim.openstreetmap.org"
    
    @staticmethod
    def search_location(query: str, limit: int = 5) -> List[Dict]:
        """
        Search for locations by name with autocomplete suggestions
        Returns list of matching locations with coordinates
        """
        if not query or len(query) < 2:
            return []
        
        params = {
            "q": query,
            "format": "json",
            "limit": limit,
            "addressdetails": 1
        }
        
        headers = {
            "User-Agent": "PathPredict/1.0"
        }
        
        try:
            response = requests.get(
                f"{NominatimGeocoding.BASE_URL}/search",
                params=params,
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            results = response.json()
            
            locations = []
            for result in results:
                locations.append({
                    "display_name": result.get("display_name", ""),
                    "lat": float(result.get("lat", 0)),
                    "lon": float(result.get("lon", 0)),
                    "type": result.get("type", ""),
                    "importance": result.get("importance", 0)
                })
            
            return locations
            
        except Exception as e:
            print(f"Geocoding error: {e}")
            return []
    
    @staticmethod
    def reverse_geocode(lat: float, lon: float) -> Optional[str]:
        """
        Convert coordinates to location name (reverse geocoding)
        """
        params = {
            "lat": lat,
            "lon": lon,
            "format": "json"
        }
        
        headers = {
            "User-Agent": "PathPredict/1.0"
        }
        
        try:
            response = requests.get(
                f"{NominatimGeocoding.BASE_URL}/reverse",
                params=params,
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            result = response.json()
            
            return result.get("display_name", None)
            
        except Exception as e:
            print(f"Reverse geocoding error: {e}")
            return None