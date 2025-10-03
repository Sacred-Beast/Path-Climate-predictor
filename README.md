# PathPredict - AI Route Weather Intelligence Engine

A complete production-ready full-stack application that predicts minute-by-minute weather and route conditions for any journey worldwide.

## Features

- **Dynamic Route Planning**: Works for any start and destination coordinates globally
- **Weather Forecasting**: Real-time weather data from Open-Meteo API
- **Segment-wise Analysis**: Route broken into ~5km segments with individual weather predictions
- **Risk Scoring**: AI-powered severity assessment for each segment
- **Smart Recommendations**: Optimal departure time suggestions
- **Interactive Map**: Color-coded route visualization with Leaflet.js
- **Timeline View**: Segment-by-segment weather conditions and ETAs
- **Alerts System**: Highlights risky segments
- **PWA Ready**: Progressive Web App with offline caching

## Technology Stack

**Backend:**
- FastAPI (Python web framework)
- Facebook Prophet (ML for time-series forecasting)
- Open-Meteo API (free weather data)
- OpenRouteService API (free routing)

**Frontend:**
- React
- Leaflet.js (interactive maps)
- Vite (build tool)
- PWA support

## Setup Instructions

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Start the FastAPI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

1. **Enter Coordinates**: Input start and destination latitude/longitude
2. **Optional Departure Time**: Select when you want to leave (default: now)
3. **Plan Route**: Click to generate route with weather predictions
4. **View Results**: 
   - Interactive map shows color-coded route segments
   - Timeline displays weather conditions per segment
   - Alerts panel highlights risky areas
5. **Get Recommendations**: Click to find the best departure time

### Example Routes

**New York to Boston:**
- Start: 40.7128, -74.0060
- End: 42.3601, -71.0589

**London to Paris:**
- Start: 51.5074, -0.1278
- End: 48.8566, 2.3522

**San Francisco to Los Angeles:**
- Start: 37.7749, -122.4194
- End: 34.0522, -118.2437

## API Endpoints

- `POST /route/plan` - Plan route with weather predictions
- `POST /weather/forecast` - Get weather forecast for location
- `POST /recommendation/departure` - Get optimal departure time recommendations

## Project Structure

```
PathPredict/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── routes/              # API endpoints
│   │   ├── ml/                  # Prophet model & risk scoring
│   │   └── utils/               # Helper utilities
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # Home page
│   │   ├── components/          # Map, Timeline, Alerts
│   │   ├── api/                 # Backend API client
│   │   └── App.jsx              # Main application
│   ├── public/                  # PWA assets
│   └── package.json
└── README.md
```

## Features Details

### Route Segmentation
Routes are automatically divided into ~5km segments, each analyzed independently for weather conditions at the estimated arrival time.

### Risk Scoring
Each segment receives a risk score based on:
- Precipitation levels
- Wind speed
- Temperature extremes
- Weather conditions (WMO codes)
- Segment distance

### Weather Prediction
Uses Facebook Prophet ML model combined with Open-Meteo forecast data to predict conditions when you'll reach each segment.

### PWA Support
The application works offline using cached data and can be installed as a native app on mobile devices.

## License

Apache 2.0 License
