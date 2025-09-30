import requests
from typing import List, Dict, Tuple
import os

class OpenRouteServiceAPI:
    BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"
    
    @staticmethod
    def get_route(start_coords: Tuple[float, float], end_coords: Tuple[float, float], api_key: str = None) -> Dict:
        """
        Get route from OpenRouteService
        start_coords: (longitude, latitude)
        end_coords: (longitude, latitude)
        """
        if api_key is None:
            api_key = os.getenv("OPENROUTE_API_KEY", "5b3ce3597851110001cf62489e8f7e0c58c04c4793d9e7dc1c0e7c17")
        
        headers = {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Authorization': api_key,
            'Content-Type': 'application/json; charset=utf-8'
        }
        
        body = {
            "coordinates": [
                [start_coords[0], start_coords[1]],
                [end_coords[0], end_coords[1]]
            ]
        }
        
        try:
            response = requests.post(OpenRouteServiceAPI.BASE_URL, json=body, headers=headers, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            if "routes" in data and len(data["routes"]) > 0:
                route = data["routes"][0]
                return {
                    "geometry": route.get("geometry"),
                    "distance": route["summary"]["distance"],
                    "duration": route["summary"]["duration"],
                    "coordinates": route["geometry"]["coordinates"] if "geometry" in route else []
                }
            return None
        except Exception as e:
            print(f"Error fetching route: {e}")
            return None
    
    @staticmethod
    def decode_polyline(encoded: str) -> List[List[float]]:
        """Decode polyline to coordinates"""
        inv = 1.0 / 1e5
        decoded = []
        previous = [0, 0]
        i = 0
        
        while i < len(encoded):
            ll = [0, 0]
            for j in [0, 1]:
                shift = 0
                byte = 0x20
                while byte >= 0x20:
                    byte = ord(encoded[i]) - 63
                    i += 1
                    ll[j] |= (byte & 0x1f) << shift
                    shift += 5
                ll[j] = previous[j] + (~(ll[j] >> 1) if ll[j] & 1 else (ll[j] >> 1))
                previous[j] = ll[j]
            decoded.append([float('%.6f' % (ll[0] * inv)), float('%.6f' % (ll[1] * inv))])
        
        return decoded
