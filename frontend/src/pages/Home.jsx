import React, { useState, useEffect, useRef } from 'react';
import { planRoute, getRecommendedDeparture, searchLocations } from '../api/backend';
import './Home.css';

function Home({ onRouteData, onLoading, onError }) {
  const [startLocation, setStartLocation] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  
  const [endLocation, setEndLocation] = useState('');
  const [endCoords, setEndCoords] = useState(null);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  
  const [departureTime, setDepartureTime] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  
  const startRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startRef.current && !startRef.current.contains(event.target)) {
        setShowStartSuggestions(false);
      }
      if (endRef.current && !endRef.current.contains(event.target)) {
        setShowEndSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartLocationChange = async (value) => {
    setStartLocation(value);
    setStartCoords(null);
    
    if (value.length >= 2) {
      const results = await searchLocations(value);
      setStartSuggestions(results);
      setShowStartSuggestions(true);
    } else {
      setStartSuggestions([]);
      setShowStartSuggestions(false);
    }
  };

  const handleEndLocationChange = async (value) => {
    setEndLocation(value);
    setEndCoords(null);
    
    if (value.length >= 2) {
      const results = await searchLocations(value);
      setEndSuggestions(results);
      setShowEndSuggestions(true);
    } else {
      setEndSuggestions([]);
      setShowEndSuggestions(false);
    }
  };

  const selectStartLocation = (suggestion) => {
    setStartLocation(suggestion.display_name);
    setStartCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setShowStartSuggestions(false);
  };

  const selectEndLocation = (suggestion) => {
    setEndLocation(suggestion.display_name);
    setEndCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setShowEndSuggestions(false);
  };

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    
    if (!startCoords || !endCoords) {
      onError('Please select valid start and destination locations from the suggestions');
      return;
    }

    onLoading(true);
    setRecommendation(null);

    try {
      const data = await planRoute(
        startCoords.lat,
        startCoords.lon,
        endCoords.lat,
        endCoords.lon,
        departureTime || null
      );
      onRouteData(data);
    } catch (error) {
      onError('Failed to plan route. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!startCoords || !endCoords) {
      onError('Please select valid start and destination locations');
      return;
    }

    onLoading(true);

    try {
      const data = await getRecommendedDeparture(
        startCoords.lat,
        startCoords.lon,
        endCoords.lat,
        endCoords.lon,
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
    setStartLocation(example.startName);
    setStartCoords({ lat: parseFloat(example.startLat), lon: parseFloat(example.startLon) });
    setEndLocation(example.endName);
    setEndCoords({ lat: parseFloat(example.endLat), lon: parseFloat(example.endLon) });
  };

  return (
    <div className="home">
      <div className="input-section">
        <h2>Plan Your Route</h2>
        
        <form onSubmit={handlePlanRoute}>
          <div className="location-group" ref={startRef}>
            <h3>Start Location</h3>
            <input
              type="text"
              placeholder="Type a city, address, or landmark..."
              value={startLocation}
              onChange={(e) => handleStartLocationChange(e.target.value)}
              onFocus={() => startSuggestions.length > 0 && setShowStartSuggestions(true)}
            />
            {showStartSuggestions && startSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {startSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => selectStartLocation(suggestion)}
                  >
                    <div className="suggestion-name">{suggestion.display_name}</div>
                  </div>
                ))}
              </div>
            )}
            {startCoords && (
              <div className="coords-display">
                Selected: {startCoords.lat.toFixed(4)}, {startCoords.lon.toFixed(4)}
              </div>
            )}
          </div>

          <div className="location-group" ref={endRef}>
            <h3>Destination</h3>
            <input
              type="text"
              placeholder="Type a city, address, or landmark..."
              value={endLocation}
              onChange={(e) => handleEndLocationChange(e.target.value)}
              onFocus={() => endSuggestions.length > 0 && setShowEndSuggestions(true)}
            />
            {showEndSuggestions && endSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {endSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => selectEndLocation(suggestion)}
                  >
                    <div className="suggestion-name">{suggestion.display_name}</div>
                  </div>
                ))}
              </div>
            )}
            {endCoords && (
              <div className="coords-display">
                Selected: {endCoords.lat.toFixed(4)}, {endCoords.lon.toFixed(4)}
              </div>
            )}
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
            startName: 'New York, USA',
            startLat: '40.7128', startLon: '-74.0060',
            endName: 'Boston, USA',
            endLat: '42.3601', endLon: '-71.0589'
          })} className="btn-example">
            New York to Boston
          </button>
          <button onClick={() => useExampleRoute({
            startName: 'London, UK',
            startLat: '51.5074', startLon: '-0.1278',
            endName: 'Paris, France',
            endLat: '48.8566', endLon: '2.3522'
          })} className="btn-example">
            London to Paris
          </button>
          <button onClick={() => useExampleRoute({
            startName: 'San Francisco, USA',
            startLat: '37.7749', startLon: '-122.4194',
            endName: 'Los Angeles, USA',
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