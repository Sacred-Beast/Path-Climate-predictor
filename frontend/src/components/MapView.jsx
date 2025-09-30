import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ routeData }) {
  const map = useMap();
  
  useEffect(() => {
    if (routeData && routeData.route && routeData.route.coordinates) {
      const coords = routeData.route.coordinates;
      const bounds = L.latLngBounds(coords.map(c => [c[1], c[0]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeData, map]);
  
  return null;
}

function MapView({ routeData }) {
  const defaultCenter = [40.7128, -74.0060];
  const defaultZoom = 10;

  const getSegmentColor = (riskLevel) => {
    switch (riskLevel) {
      case 'safe':
        return '#10b981';
      case 'moderate':
        return '#f59e0b';
      case 'risky':
        return '#f97316';
      case 'dangerous':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="map-view">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {routeData && (
          <>
            <MapUpdater routeData={routeData} />
            
            {routeData.route && routeData.route.coordinates && (
              <>
                <Marker position={[
                  routeData.route.coordinates[0][1],
                  routeData.route.coordinates[0][0]
                ]}>
                  <Popup>
                    <strong>Start</strong><br />
                    Departure: {new Date(routeData.route.departure_time).toLocaleString()}
                  </Popup>
                </Marker>
                
                <Marker position={[
                  routeData.route.coordinates[routeData.route.coordinates.length - 1][1],
                  routeData.route.coordinates[routeData.route.coordinates.length - 1][0]
                ]}>
                  <Popup>
                    <strong>Destination</strong><br />
                    Distance: {(routeData.route.total_distance / 1000).toFixed(1)} km<br />
                    Duration: {Math.round(routeData.route.total_duration / 60)} min
                  </Popup>
                </Marker>
              </>
            )}
            
            {routeData.segments && routeData.segments.map((segment) => {
              const coords = segment.coordinates.map(c => [c[1], c[0]]);
              const color = getSegmentColor(segment.risk.risk_level);
              
              return (
                <Polyline
                  key={segment.id}
                  positions={coords}
                  color={color}
                  weight={5}
                  opacity={0.8}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <strong>Segment {segment.id + 1}</strong><br />
                      <strong>ETA:</strong> {new Date(segment.eta).toLocaleTimeString()}<br />
                      <strong>Distance:</strong> {(segment.distance / 1000).toFixed(1)} km<br />
                      <strong>Risk:</strong> <span style={{ 
                        color: color, 
                        fontWeight: 'bold' 
                      }}>
                        {segment.risk.risk_level.toUpperCase()}
                      </span><br />
                      <strong>Weather:</strong> {segment.weather.description}<br />
                      <strong>Temp:</strong> {segment.weather.temperature}°C<br />
                      <strong>Precipitation:</strong> {segment.weather.precipitation} mm<br />
                      <strong>Wind:</strong> {segment.weather.windspeed} km/h
                    </div>
                  </Popup>
                </Polyline>
              );
            })}
          </>
        )}
      </MapContainer>
      
      {routeData && (
        <div className="map-legend">
          <h4>Risk Levels</h4>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#10b981' }}></div>
            <span>Safe</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f59e0b' }}></div>
            <span>Moderate</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f97316' }}></div>
            <span>Risky</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ef4444' }}></div>
            <span>Dangerous</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
