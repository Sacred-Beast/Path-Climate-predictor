import React from 'react';
import './AlertsPanel.css';

function AlertsPanel({ segments }) {
  if (!segments || segments.length === 0) {
    return null;
  }

  const riskySegments = segments.filter(
    segment => segment.risk.risk_level === 'risky' || segment.risk.risk_level === 'dangerous'
  );

  if (riskySegments.length === 0) {
    return (
      <div className="alerts-panel">
        <h3>Alerts</h3>
        <div className="no-alerts">
          <span className="alert-icon">✓</span>
          <p>No weather alerts for this route. Have a safe trip!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-panel">
      <h3>Weather Alerts ({riskySegments.length})</h3>
      <div className="alerts-list">
        {riskySegments.map((segment) => (
          <div key={segment.id} className={`alert-card ${segment.risk.risk_level}`}>
            <div className="alert-header">
              <span className="alert-severity">{segment.risk.risk_level.toUpperCase()}</span>
              <span className="alert-time">
                {new Date(segment.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="alert-message">
              Segment {segment.id + 1}: {segment.weather.description}
            </p>
            <div className="alert-details">
              {segment.weather.precipitation > 0 && (
                <span className="alert-detail">💧 {segment.weather.precipitation}mm rain</span>
              )}
              {segment.weather.windspeed > 30 && (
                <span className="alert-detail">💨 {segment.weather.windspeed}km/h wind</span>
              )}
              {segment.weather.temperature < 0 && (
                <span className="alert-detail">🥶 {segment.weather.temperature}°C</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertsPanel;
