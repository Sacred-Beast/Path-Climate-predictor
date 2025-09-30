# PathPredict - AI Route Weather Intelligence Engine

## Project Overview
PathPredict is a production-ready full-stack AI-powered route planning application that provides segment-wise weather forecasts and risk assessments for any journey worldwide. The application uses real-time weather data and machine learning to help users plan optimal travel times.

## Architecture
- **Backend**: Python FastAPI server with Prophet ML model (Port 8000)
- **Frontend**: React + Vite with Leaflet.js for maps (Port 5000)
- **APIs**: Open-Meteo (weather), OpenRouteService (routing)

## Key Features
- Global route planning (works for any coordinates worldwide)
- Real-time weather forecasting per route segment
- AI-powered risk scoring and severity assessment
- Interactive map visualization with color-coded risk levels
- Timeline view showing segment-wise weather conditions
- Alerts panel for risky weather conditions
- Optimal departure time recommendations
- PWA-ready with offline caching support

## How It Works
1. User enters start and destination coordinates
2. Route is fetched from OpenRouteService API
3. Route is segmented into ~5km chunks
4. Weather data fetched from Open-Meteo for each segment
5. Prophet ML model predicts weather at arrival time for each segment
6. Risk scoring algorithm calculates severity based on conditions
7. Results displayed on interactive map with timeline and alerts

## Technology Stack
**Backend:**
- FastAPI (REST API framework)
- Facebook Prophet (time-series weather prediction)
- Pandas/NumPy (data processing)
- Uvicorn (ASGI server)

**Frontend:**
- React 18
- Leaflet.js + react-leaflet (interactive maps)
- Vite (build tool)
- Axios (API client)

## Project Structure
```
PathPredict/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── routes/              # API endpoints
│   │   │   ├── planner.py       # Route planning
│   │   │   ├── forecast.py      # Weather forecasts
│   │   │   └── recommend.py     # Departure recommendations
│   │   ├── ml/                  # Machine learning
│   │   │   ├── prophet_model.py # Prophet forecasting
│   │   │   └── severity_score.py # Risk scoring
│   │   └── utils/               # Utilities
│   │       ├── segmenter.py     # Route segmentation
│   │       ├── openmeteo_api.py # Weather API client
│   │       └── osmnx_wrapper.py # Routing API client
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main application
│   │   ├── pages/
│   │   │   └── Home.jsx         # Input form
│   │   ├── components/
│   │   │   ├── MapView.jsx      # Interactive map
│   │   │   ├── Timeline.jsx     # Segment timeline
│   │   │   └── AlertsPanel.jsx  # Weather alerts
│   │   └── api/
│   │       └── backend.js       # API client
│   ├── public/
│   │   ├── manifest.json        # PWA manifest
│   │   └── sw.js                # Service worker
│   └── package.json
└── README.md
```

## API Endpoints
- `POST /route/plan` - Plan route with weather and risk analysis
- `POST /weather/forecast` - Get weather forecast for location
- `POST /recommendation/departure` - Get optimal departure times

## Recent Changes
- Initial project setup with complete backend and frontend
- Implemented route planning with OpenRouteService integration
- Added weather forecasting using Open-Meteo API
- Created Prophet ML model for weather predictions
- Built risk scoring algorithm
- Developed React frontend with Leaflet map
- Added timeline and alerts components
- Configured PWA support with service worker
- Set up workflows for backend and frontend servers

## Usage Examples
**Example Routes to Try:**
- New York to Boston: 40.7128, -74.0060 → 42.3601, -71.0589
- London to Paris: 51.5074, -0.1278 → 48.8566, 2.3522
- San Francisco to LA: 37.7749, -122.4194 → 34.0522, -118.2437

## Development
- Backend runs on port 8000
- Frontend runs on port 5000
- Both workflows auto-restart on code changes
- Application works globally for any coordinates
