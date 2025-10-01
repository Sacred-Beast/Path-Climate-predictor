import React, { useState } from 'react';
import Home from './pages/Home';
import MapView from './components/MapView';
import Timeline from './components/Timeline';
import AlertsPanel from './components/AlertsPanel';
import './App.css';

function App() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRouteData = (data) => {
    setRouteData(data);
    setError(null);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  const handleError = (errorMsg) => {
    setError(errorMsg);
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PathPredict</h1>
        <p>AI Route Weather Intelligence Engine</p>
      </header>
      
      <div className="app-content">
        <div className="sidebar">
          <Home 
            onRouteData={handleRouteData} 
            onLoading={handleLoading}
            onError={handleError}
          />
          
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Planning your route...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {routeData && !loading && (
            <>
              <AlertsPanel segments={routeData.segments} />
              <Timeline segments={routeData.segments} />
            </>
          )}
        </div>
        
        <div className="map-container">
          <MapView routeData={routeData} />
        </div>
      </div>
    </div>
  );
}

export default App;