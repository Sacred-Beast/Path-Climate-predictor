import React, { useState } from 'react';
import { planRoute, getRecommendedDeparture } from '../api/backend';
import './Home.css';

function Home({ onRouteData, onLoading, onError }) {
  const [startLat, setStartLat] = useState('');
  const [startLon, setStartLon] = useState('');
  const [endLat, setEndLat] = useState('');
  const [endLon, setEndLon] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    
    if (!startLat || !startLon || !endLat || !endLon) {
      onError('Please fill in all location fields');
      return;
    }

    onLoading(true);
    setRecommendation(null);

    try {
      const data = await planRoute(
        parseFloat(startLat),
        parseFloat(startLon),
        parseFloat(endLat),
        parseFloat(endLon),
        departureTime || null
      );
      onRouteData(data);
    } catch (error) {
      onError('Failed to plan route. Please check your coordinates and try again.');
    } finally {
      onLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!startLat || !startLon || !endLat || !endLon) {
      onError('Please fill in all location fields');
      return;
    }

    onLoading(true);

    try {
      const data = await getRecommendedDeparture(
        parseFloat(startLat),
        parseFloat(startLon),
        parseFloat(endLat),
        parseFloat(endLon),
        12
      );
      setRecommendation(data);
    } catch (error) {
      onError('Failed to get recommendations. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  const useExampleRoute = (example) => {
    setStartLat(example.startLat);
    setStartLon(example.startLon);
    setEndLat(example.endLat);
    setEndLon(example.endLon);
  };

  return (
    <div className="home">
      <div className="input-section">
        <h2>Plan Your Route</h2>
        
        <form onSubmit={handlePlanRoute}>
          <div className="location-group">
            <h3>Start Location</h3>
            <div className="input-row">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={startLat}
                onChange={(e) => setStartLat(e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={startLon}
                onChange={(e) => setStartLon(e.target.value)}
              />
            </div>
          </div>

          <div className="location-group">
            <h3>Destination</h3>
            <div className="input-row">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={endLat}
                onChange={(e) => setEndLat(e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={endLon}
                onChange={(e) => setEndLon(e.target.value)}
              />
            </div>
          </div>

          <div className="location-group">
            <h3>Departure Time (Optional)</h3>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary">
            Plan Route
          </button>
        </form>

        <button onClick={handleGetRecommendation} className="btn-secondary">
          Get Best Departure Time
        </button>

        <div className="examples">
          <h3>Example Routes</h3>
          <button onClick={() => useExampleRoute({
            startLat: '40.7128', startLon: '-74.0060',
            endLat: '42.3601', endLon: '-71.0589'
          })} className="btn-example">
            New York to Boston
          </button>
          <button onClick={() => useExampleRoute({
            startLat: '51.5074', startLon: '-0.1278',
            endLat: '48.8566', endLon: '2.3522'
          })} className="btn-example">
            London to Paris
          </button>
          <button onClick={() => useExampleRoute({
            startLat: '37.7749', startLon: '-122.4194',
            endLat: '34.0522', endLon: '-118.2437'
          })} className="btn-example">
            San Francisco to Los Angeles
          </button>
        </div>
      </div>

      {recommendation && (
        <div className="recommendation-panel">
          <h3>Best Departure Time</h3>
          <div className="recommendation-card">
            <p className="rec-time">
              {new Date(recommendation.best_departure.departure_time).toLocaleString()}
            </p>
            <p className={`rec-risk ${recommendation.best_departure.risk_level}`}>
              Risk Level: {recommendation.best_departure.risk_level}
            </p>
            <p className="rec-score">
              Risk Score: {recommendation.best_departure.average_risk}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
