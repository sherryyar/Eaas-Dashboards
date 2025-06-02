import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavigationButton.css';

const NavigationButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const routes = [
    { path: '/', label: 'Home', icon: '🏠', description: 'Welcome to EAAS TV' },
    { path: '/stream', label: 'Stream', icon: '🎥', description: 'Live Camera Streams' },
    { path: '/opsgenie', label: 'OpsGenie', icon: '📊', description: 'On-Call Dashboard' }
  ];

  const currentIndex = routes.findIndex(route => route.path === location.pathname);
  const currentRoute = routes[currentIndex];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.nav-button-container')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRouteClick = (path: string) => {
    navigate(path);
    setIsExpanded(false);
  };

  return (
    <div 
      className={`nav-button-container ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        className="nav-button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Navigation Menu"
      >
        <div className="button-content">
          <span className="route-icon">{currentRoute.icon}</span>
          <span className="route-label">{currentRoute.label}</span>
        </div>
        <div className="progress-ring">
          <svg viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - (currentIndex + 1) / routes.length)}`}
              transform="rotate(-90 25 25)"
            />
          </svg>
        </div>
      </button>
      
      <div className={`nav-menu-container ${isExpanded ? 'show' : ''}`}>
        <div className="routes-preview">
          {routes.map((route, index) => (
            <div 
              key={route.path}
              className={`route-preview ${index === currentIndex ? 'current' : ''}`}
              onClick={() => handleRouteClick(route.path)}
            >
              <div className="route-preview-content">
                <span className="preview-icon">{route.icon}</span>
                <div className="preview-text">
                  <span className="preview-label">{route.label}</span>
                  <span className="preview-description">{route.description}</span>
                </div>
              </div>
              {index === currentIndex && (
                <span className="current-indicator">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationButton; 