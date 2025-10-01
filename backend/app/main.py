from pathlib import Path
import os

# Load environment variables from backend/.env so the app can read OPENROUTE_API_KEY
# Prefer python-dotenv if installed, but fall back to a simple parser to avoid
# making python-dotenv a hard requirement at runtime.
env_path = Path(__file__).resolve().parents[1] / '.env'
try:
    from dotenv import load_dotenv  # type: ignore[import]
    load_dotenv(env_path)
except Exception:
    if env_path.exists():
        for line in env_path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' not in line:
                continue
            k, v = line.split('=', 1)
            k = k.strip()
            v = v.strip()
            # Remove surrounding quotes if present
            if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                v = v[1:-1]
            # Only set if not already in environment
            os.environ.setdefault(k, v)

# Masked startup log to confirm key load (won't expose full key)
_ors_key = os.getenv('OPENROUTE_API_KEY')
if _ors_key:
    _display = _ors_key if len(_ors_key) <= 8 else f"{_ors_key[:4]}...{_ors_key[-4:]}"
    print(f"OPENROUTE_API_KEY loaded: { _display }")
else:
    print("OPENROUTE_API_KEY not found in environment")



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