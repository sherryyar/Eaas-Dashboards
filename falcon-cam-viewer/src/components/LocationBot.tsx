import React, { useEffect, useState } from 'react';
import './LocationBot.css';

interface LocationData {
  office: string[];
  home: string[];
  sick: string[];
  totalResponses: number;
  lastUpdated: string;
}

const LocationBot: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    office: [],
    home: [],
    sick: [],
    totalResponses: 0,
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/location-tracking');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setLocationData({
            office: data.workingFromOffice || [],
            home: data.workingFromHome || [],
            sick: data.onLeave || [],
            totalResponses: data.totalResponses || 0,
            lastUpdated: data.timestamp || new Date().toISOString()
          });
        }
      } catch (err) {
        setError('Failed to fetch location data');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchLocationData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="location-bot-container">
        <div className="location-bot-content">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-bot-container">
        <div className="location-bot-content">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="location-bot-container">
      <div className="location-bot-content">
        <div className="header-section">
          <h1>Location Bot</h1>
          <div className="location-stats">
            <div className="stat-item">
              <div className="stat-value">{locationData.totalResponses}</div>
              <div className="stat-label">Total Responses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{new Date(locationData.lastUpdated).toLocaleTimeString()}</div>
              <div className="stat-label">Last Updated</div>
            </div>
          </div>
        </div>
        <div className="status-columns">
          <div className="status-column">
            <div className="column-header">
              <h2>Office</h2>
              <span className="count-badge">{locationData.office.length}</span>
            </div>
            <div className="status-list">
              {locationData.office.map((name, index) => (
                <div key={index} className="status-item">
                  <span className="user-avatar">{name.charAt(0)}</span>
                  <span className="user-name">{name}</span>
                </div>
              ))}
              {locationData.office.length === 0 && (
                <div className="status-item empty">
                  <span className="empty-icon">🏢</span>
                  <span>No one in office</span>
                </div>
              )}
            </div>
          </div>
          <div className="status-column">
            <div className="column-header">
              <h2>Home</h2>
              <span className="count-badge">{locationData.home.length}</span>
            </div>
            <div className="status-list">
              {locationData.home.map((name, index) => (
                <div key={index} className="status-item">
                  <span className="user-avatar">{name.charAt(0)}</span>
                  <span className="user-name">{name}</span>
                </div>
              ))}
              {locationData.home.length === 0 && (
                <div className="status-item empty">
                  <span className="empty-icon">🏠</span>
                  <span>No one working from home</span>
                </div>
              )}
            </div>
          </div>
          <div className="status-column">
            <div className="column-header">
              <h2>Sick</h2>
              <span className="count-badge">{locationData.sick.length}</span>
            </div>
            <div className="status-list">
              {locationData.sick.map((name, index) => (
                <div key={index} className="status-item">
                  <span className="user-avatar">{name.charAt(0)}</span>
                  <span className="user-name">{name}</span>
                </div>
              ))}
              {locationData.sick.length === 0 && (
                <div className="status-item empty">
                  <span className="empty-icon">🏥</span>
                  <span>No one on sick leave</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationBot; 