import React from 'react';
import './Timeline.css';

function Timeline({ segments }) {
  if (!segments || segments.length === 0) {
    return null;
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getWeatherIcon = (weathercode) => {
    if (weathercode === 0) return '☀️';
    if (weathercode <= 3) return '⛅';
    if (weathercode <= 48) return '🌫️';
    if (weathercode <= 67) return '🌧️';
    if (weathercode <= 77) return '❄️';
    if (weathercode <= 82) return '🌧️';
    if (weathercode <= 86) return '❄️';
    return '⛈️';
  };

  return (
    <div className="timeline">
      <h3>Route Timeline</h3>
      <div className="timeline-content">
        {segments.map((segment, index) => (
          <div key={segment.id} className={`timeline-item ${segment.risk.risk_level}`}>
            <div className="timeline-marker">
              <div className={`marker-dot ${segment.risk.risk_level}`}></div>
              {index < segments.length - 1 && <div className="marker-line"></div>}
            </div>
            
            <div className="timeline-card">
              <div className="timeline-header">
                <span className="segment-number">Segment {segment.id + 1}</span>
                <span className="segment-time">{formatTime(segment.eta)}</span>
              </div>
              
              <div className="weather-info">
                <span className="weather-icon">{getWeatherIcon(segment.weather.weathercode)}</span>
                <span className="weather-desc">{segment.weather.description}</span>
              </div>
              
              <div className="segment-details">
                <div className="detail-row">
                  <span className="detail-label">Temperature:</span>
                  <span className="detail-value">{segment.weather.temperature}°C</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Precipitation:</span>
                  <span className="detail-value">{segment.weather.precipitation} mm</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Wind Speed:</span>
                  <span className="detail-value">{segment.weather.windspeed} km/h</span>
                </div>
              </div>
              
              <div className={`risk-badge ${segment.risk.risk_level}`}>
                {segment.risk.risk_level.toUpperCase()} - Score: {segment.risk.severity_score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
