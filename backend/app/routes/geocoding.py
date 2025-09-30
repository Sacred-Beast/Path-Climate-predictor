from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List
from ..utils.geocoding import NominatimGeocoding

router = APIRouter()

@router.get("/search")
async def search_locations(q: str = Query(..., min_length=2)):
    """Search for locations by name with autocomplete suggestions"""
    try:
        locations = NominatimGeocoding.search_location(q, limit=5)
        return {"results": locations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reverse")
async def reverse_geocode(lat: float, lon: float):
    """Convert coordinates to location name"""
    try:
        location_name = NominatimGeocoding.reverse_geocode(lat, lon)
        if location_name:
            return {"location": location_name}
        raise HTTPException(status_code=404, detail="Location not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
