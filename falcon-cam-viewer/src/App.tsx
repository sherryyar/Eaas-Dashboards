import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StreamViewer from './components/StreamViewer';
import OpsGenieDashboard from './components/OpsGenieDashboard';
import Home from './components/Home';
import NavigationButton from './components/NavigationButton';
import './App.css';

function App() {
  return (
    <div className="App">
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/falcon-cam" element={<StreamViewer />} />
          <Route path="/stream" element={<StreamViewer autoTransition={false} />} />
          <Route path="/opsgenie" element={<OpsGenieDashboard />} />
        </Routes>
      </main>
      <NavigationButton />
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