import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeScreen, setActiveScreen] = useState(0);
  const navigate = useNavigate();
  const bannerText = 'Engineering as a Service, EAID\'s Managed Service Practice | 1. We are finding out our why/makes us feel #fulfilled at work | 2. We\'re going to automate everything | 3. We are proactive';

  const screens = [
    {
      id: 'stream',
      title: 'Live Streams',
      path: '/stream',
      gradient: 'linear-gradient(135deg, #00C6FB 0%, #005BEA 100%)',
      icon: '🎥'
    },
    {
      id: 'opsgenie',
      title: 'OpsGenie',
      path: '/opsgenie',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF2D55 100%)',
      icon: '📊'
    }
  ];

  useEffect(() => {
    if (gridRef.current) {
      const cells = gridRef.current.children;
      Array.from(cells).forEach((cell) => {
        (cell as HTMLElement).style.setProperty('--delay', String(Math.random() * 10));
      });
    }

    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [screens.length]);

  const createGrid = () => {
    return Array(400).fill(null).map((_, index) => (
      <div key={index} className="grid-cell" />
    ));
  };

  const formatBannerText = (text: string) => {
    const [prefix, message] = text.split(' | ');
    return (
      <>
        <strong>{prefix}</strong> | {message}
      </>
    );
  };

  return (
    <div className="home-container">
      <div className="enterprise-banner">
        <div className="banner-content">
          <div className="banner-text-wrapper">
            <span className="banner-text">
              <strong>Engineering as a Service, EAID's Managed Service Practice</strong>
              <span className="separator">|</span>
              We are finding out our why/makes us feel #fulfilled at work
              <span className="separator">|</span>
              We're going to automate everything
              <span className="separator">|</span>
              We are proactive
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
            <span className="banner-text">
              <strong>Engineering as a Service, EAID's Managed Service Practice</strong>
              <span className="separator">|</span>
              We are finding out our why/makes us feel #fulfilled at work
              <span className="separator">|</span>
              We're going to automate everything
              <span className="separator">|</span>
              We are proactive
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>
      </div>
      <div className="background-grid" ref={gridRef}>
        {createGrid()}
      </div>
      
      <div className="content-container">
        <div className="welcome-section">
          <h1 className="main-title">
            Welcome to <span className="highlight">Engineering as a Service Team</span>
          </h1>
          <p className="subtitle">
            Melbourne, Australia
          </p>
        </div>

        <div className="screens-container">
          <div className="screens-wrapper">
            {screens.map((screen, index) => (
              <div
                key={screen.id}
                className={`screen-card ${index === activeScreen ? 'active' : ''}`}
                style={{ background: screen.gradient }}
                onClick={() => navigate(screen.path)}
              >
                <div className="screen-content">
                  <div className="screen-icon">{screen.icon}</div>
                  <h3>{screen.title}</h3>
                </div>
                <div className="screen-overlay">
                  <span className="screen-cta">Enter</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="screen-indicators">
            {screens.map((_, index) => (
              <button
                key={index}
                className={`screen-indicator ${index === activeScreen ? 'active' : ''}`}
                onClick={() => setActiveScreen(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 