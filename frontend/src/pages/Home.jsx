import React, { useState, useEffect, useRef } from 'react';
import { planRoute, getRecommendedDeparture, searchLocations } from '../api/backend';
import MapView from '../components/MapView';
import AlertsPanel from '../components/AlertsPanel';
import Timeline from '../components/Timeline';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Autocomplete from '../components/Autocomplete';
import Skeleton from '../components/Skeleton';
import styles from './Home.module.css';

function Home() {
  const [startLocation, setStartLocation] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [startLoading, setStartLoading] = useState(false);

  const [endLocation, setEndLocation] = useState('');
  const [endCoords, setEndCoords] = useState(null);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [endLoading, setEndLoading] = useState(false);

  const [departureTime, setDepartureTime] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // debounced start search
  const startTimer = useRef(null);
  const handleStartLocationChange = (value) => {
    setStartLocation(value);
    setStartCoords(null);
    setError('');
    if (startTimer.current) clearTimeout(startTimer.current);
    if (value.length >= 2) {
      setStartLoading(true);
      startTimer.current = setTimeout(async () => {
        try {
          const results = await searchLocations(value);
          setStartSuggestions(results);
          setShowStartSuggestions(true);
        } catch (err) {
          const message = err?.message || String(err) || 'Failed to fetch start suggestions';
          console.error('Start suggestions error:', err);
          setError(`Failed to fetch start suggestions: ${message}`);
        } finally {
          setStartLoading(false);
        }
      }, 300);
    } else {
      setStartSuggestions([]);
      setShowStartSuggestions(false);
      setStartLoading(false);
    }
  };

  // debounced end search
  const endTimer = useRef(null);
  const handleEndLocationChange = (value) => {
    setEndLocation(value);
    setEndCoords(null);
    setError('');
    if (endTimer.current) clearTimeout(endTimer.current);
    if (value.length >= 2) {
      setEndLoading(true);
      endTimer.current = setTimeout(async () => {
        try {
          const results = await searchLocations(value);
          setEndSuggestions(results);
          setShowEndSuggestions(true);
        } catch (err) {
          const message = err?.message || String(err) || 'Failed to fetch destination suggestions';
          console.error('End suggestions error:', err);
          setError(`Failed to fetch destination suggestions: ${message}`);
        } finally {
          setEndLoading(false);
        }
      }, 300);
    } else {
      setEndSuggestions([]);
      setShowEndSuggestions(false);
      setEndLoading(false);
    }
  };

  const selectStartLocation = (s) => {
    setStartLocation(s.display_name);
    setStartCoords({ lat: s.lat, lon: s.lon });
    setShowStartSuggestions(false);
  };

  const selectEndLocation = (s) => {
    setEndLocation(s.display_name);
    setEndCoords({ lat: s.lat, lon: s.lon });
    setShowEndSuggestions(false);
  };

  const handlePlanRoute = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    if (!startCoords || !endCoords) {
      setError('Please select valid start and destination locations.');
      return;
    }
    setLoading(true);
    try {
      const data = await planRoute(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon, departureTime || null);
      setRouteData(data);
      setSuccess('Route planned successfully');
    } catch (err) {
      setError(err?.toString() || 'Route planning failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    setError('');
    setSuccess('');
    if (!startCoords || !endCoords) {
      setError('Please select valid start and destination locations.');
      return;
    }
    setLoading(true);
    try {
      const data = await getRecommendedDeparture(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon, 12);
      console.log('Recommendation response:', data);
      setRecommendation(data);
      setSuccess('Recommendation calculated');
    } catch (err) {
      console.error('Recommendation error:', err);
      setError(err?.toString() || 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  const useExampleRoute = (example) => {
    setStartLocation(example.startName);
    setStartCoords({ lat: parseFloat(example.startLat), lon: parseFloat(example.startLon) });
    setEndLocation(example.endName);
    setEndCoords({ lat: parseFloat(example.endLat), lon: parseFloat(example.endLon) });
  };

  return (
    <div className={styles.home}>
      <div className={styles.mapAndAlerts}>
        <div className={styles.sidebar}>
          <Card className={`${styles.inputSection} ${'card--p'}`}>
        <h2>Plan Your Route</h2>
        <form onSubmit={handlePlanRoute} aria-label="route-form">
          <div className={styles.locationGroup} ref={startRef}>
            <label htmlFor="start">Start Location</label>
            <Autocomplete
              id="start"
              value={startLocation}
              onChange={handleStartLocationChange}
              onSelect={selectStartLocation}
              placeholder="City, address, or landmark"
              suggestions={startSuggestions}
              showSuggestions={showStartSuggestions}
              setShowSuggestions={setShowStartSuggestions}
              loading={startLoading}
            />
            {startCoords && <div className={styles.coordsDisplay}>Selected: {Number(startCoords.lat).toFixed(4)}, {Number(startCoords.lon).toFixed(4)}</div>}
          </div>

          <div className={styles.locationGroup} ref={endRef}>
            <label htmlFor="end">Destination</label>
            <Autocomplete
              id="end"
              value={endLocation}
              onChange={handleEndLocationChange}
              onSelect={selectEndLocation}
              placeholder="City, address, or landmark"
              suggestions={endSuggestions}
              showSuggestions={showEndSuggestions}
              setShowSuggestions={setShowEndSuggestions}
              loading={endLoading}
            />
            {endCoords && <div className={styles.coordsDisplay}>Selected: {Number(endCoords.lat).toFixed(4)}, {Number(endCoords.lon).toFixed(4)}</div>}
          </div>

          <div className={styles.locationGroup}>
            <label htmlFor="departure">Departure Time (Optional)</label>
            <Input id="departure" type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
          </div>

          <Button type="submit" className={styles.btnWhite} loading={loading}>Plan Route</Button>
        </form>

        <Button onClick={handleGetRecommendation} className={styles.btnSecondary} loading={loading}>Get Best Departure Time</Button>

        {/* examples removed per request */}

        {error && <div className={styles.error} role="alert">{error}</div>}
        {success && <div className={styles.success} role="status">{success}</div>}
        {loading && (
          <div className={styles.loading} role="status">
            <Skeleton height={16} style={{ marginBottom: 8 }} />
            <Skeleton height={14} width="60%" />
          </div>
        )}
        {recommendation && (
          <div className={styles.recommendation}>
            <h3>Recommendation</h3>
            {recommendation.best_departure ? (
              <div className={styles.bestDeparture}>
                <div><strong>Best departure:</strong></div>
                <div>Time: {new Date(recommendation.best_departure.departure_time).toLocaleString()}</div>
                <div>Average risk: {recommendation.best_departure.average_risk}</div>
                <div>Risk level: {recommendation.best_departure.risk_level}</div>
              </div>
            ) : (
              <div>No best departure found.</div>
            )}

            {Array.isArray(recommendation.all_recommendations) && recommendation.all_recommendations.length > 0 && (
              <details className={styles.recommendationDetails}>
                <summary>All recommendations ({recommendation.all_recommendations.length})</summary>
                <ul>
                  {recommendation.all_recommendations.map((r, idx) => (
                    <li key={idx}>
                      {new Date(r.departure_time).toLocaleString()} — avg risk: {r.average_risk}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </Card>
      {routeData && <div className={styles.timelineWrapper}><Timeline segments={routeData.segments} /></div>}

        </div>
        <div className={styles.mapWrapper}>
          <MapView routeData={routeData} />
        </div>
      </div>
      {routeData && <AlertsPanel segments={routeData.segments} />}
    </div>
  );
}

export default Home;