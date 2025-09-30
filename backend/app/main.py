from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import planner, forecast, recommend, geocoding

app = FastAPI(title="PathPredict API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(planner.router, prefix="/route", tags=["route"])
app.include_router(forecast.router, prefix="/weather", tags=["weather"])
app.include_router(recommend.router, prefix="/recommendation", tags=["recommendation"])
app.include_router(geocoding.router, prefix="/geocoding", tags=["geocoding"])

@app.get("/")
async def root():
    return {
        "message": "PathPredict - AI Route Weather Intelligence Engine",
        "version": "1.0.0",
        "endpoints": {
            "route_planning": "/route/plan",
            "weather_forecast": "/weather/forecast",
            "departure_recommendation": "/recommendation/departure"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
