import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StreamViewer from './components/StreamViewer';
import OpsGenieDashboard from './components/OpsGenieDashboard';
import Home from './components/Home';
import NavigationButton from './components/NavigationButton';
import LocationBot from './components/LocationBot';
import EAASMusicBot from './components/EAASMusicBot';
import EAASGallery from './components/EAASGallery';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="app-navigation">
        <NavigationButton to="/">Home</NavigationButton>
        <NavigationButton to="/stream">Live Streams</NavigationButton>
        <NavigationButton to="/opsgenie">OpsGenie</NavigationButton>
        <NavigationButton to="/location-bot">Location Bot</NavigationButton>
        <NavigationButton to="/music-bot">EAAS Music</NavigationButton>
        <NavigationButton to="/gallery">EAAS Gallery</NavigationButton>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/falcon-cam" element={<StreamViewer />} />
          <Route path="/stream" element={<StreamViewer autoTransition={false} />} />
          <Route path="/opsgenie" element={<OpsGenieDashboard />} />
          <Route path="/location-bot" element={<LocationBot />} />
          <Route path="/music-bot" element={<EAASMusicBot />} />
          <Route path="/gallery" element={<EAASGallery />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About</h3>
            <p>Falcon Cam Viewer is a real-time monitoring solution for your security cameras.</p>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>For support, please contact your system administrator.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 