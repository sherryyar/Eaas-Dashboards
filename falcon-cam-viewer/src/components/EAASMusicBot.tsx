import React, { useState } from 'react';
import './EAASMusicBot.css';

const EAASMusicBot: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Team Vibes',
    artist: 'EAAS Team',
    album: 'Office Sessions 2024',
    duration: '3:45',
    cover: '🎵'
  });

  return (
    <div className="music-player-container">
      <div className="player-header">
        <h1>EAAS Music Player</h1>
      </div>
      
      <div className="player-content">
        <div className="album-cover">
          <div className="cover-image">{currentTrack.cover}</div>
          <div className="album-info">
            <h2>{currentTrack.album}</h2>
          </div>
        </div>

        <div className="player-controls">
          <div className="track-info">
            <h3>{currentTrack.title}</h3>
            <p>{currentTrack.artist}</p>
          </div>

          <div className="control-buttons">
            <button className="control-button shuffle">
              <span>🔀</span>
            </button>
            <button className="control-button previous">
              <span>⏮️</span>
            </button>
            <button 
              className={`control-button play ${isPlaying ? 'playing' : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <span>{isPlaying ? '⏸️' : '▶️'}</span>
            </button>
            <button className="control-button next">
              <span>⏭️</span>
            </button>
            <button className="control-button repeat">
              <span>🔁</span>
            </button>
          </div>

          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress" style={{ width: '45%' }}></div>
              <div className="progress-handle"></div>
            </div>
            <div className="time-info">
              <span className="current-time">1:45</span>
              <span className="duration">{currentTrack.duration}</span>
            </div>
          </div>

          <div className="volume-control">
            <span className="volume-icon">🔊</span>
            <div className="volume-bar">
              <div className="volume-level" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EAASMusicBot; 