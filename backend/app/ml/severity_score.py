from typing import Dict

class SeverityScorer:
    @staticmethod
    def calculate_risk_score(weather: Dict, distance: float) -> Dict:
        """
        Calculate risk score based on weather conditions
        Returns risk level and severity score
        """
        if not weather:
            return {
                "risk_level": "unknown",
                "severity_score": 0,
                "factors": {}
            }
        
        temp = weather.get("temperature", 15)
        precip = weather.get("precipitation", 0)
        wind = weather.get("windspeed", 0)
        weathercode = weather.get("weathercode", 0)
        
        precipitation_score = min(precip * 10, 100)
        wind_score = min(wind * 2, 100)
        
        temp_score = 0
        if temp < 0:
            temp_score = 30
        elif temp > 35:
            temp_score = 20
        
        weather_condition_score = SeverityScorer.get_weathercode_severity(weathercode)
        
        distance_factor = min(distance / 1000, 5) / 5
        
        total_score = (
            precipitation_score * 0.4 +
            wind_score * 0.3 +
            temp_score * 0.15 +
            weather_condition_score * 0.15
        ) * (1 + distance_factor * 0.2)
        
        if total_score < 20:
            risk_level = "safe"
        elif total_score < 50:
            risk_level = "moderate"
        elif total_score < 75:
            risk_level = "risky"
        else:
            risk_level = "dangerous"
        
        return {
            "risk_level": risk_level,
            "severity_score": round(total_score, 2),
            "factors": {
                "precipitation": round(precipitation_score, 2),
                "wind": round(wind_score, 2),
                "temperature": round(temp_score, 2),
                "weather_condition": round(weather_condition_score, 2)
            }
        }
    
    @staticmethod
    def get_weathercode_severity(code: int) -> float:
        """Map WMO weather codes to severity scores"""
        if code == 0:
            return 0
        elif code in [1, 2]:
            return 5
        elif code == 3:
            return 10
        elif code in [45, 48]:
            return 25
        elif code in [51, 53, 55]:
            return 30
        elif code in [61, 63, 65]:
            return 50
        elif code in [66, 67]:
            return 60
        elif code in [71, 73, 75, 77]:
            return 55
        elif code in [80, 81, 82]:
            return 65
        elif code in [85, 86]:
            return 70
        elif code in [95, 96, 99]:
            return 90
        else:
            return 20
    
    @staticmethod
    def get_weather_description(code: int) -> str:
        """Get human-readable weather description from WMO code"""
        weather_codes = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Light freezing rain",
            67: "Heavy freezing rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        return weather_codes.get(code, "Unknown")
