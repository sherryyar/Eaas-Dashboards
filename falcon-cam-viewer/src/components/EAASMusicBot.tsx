import React, { useState, useEffect } from 'react';
import './EAASMusicBot.css';

const EAASMusicBot: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack] = useState({
    title: 'Futuristic Dreams',
    artist: 'EAAS Collective',
    album: 'Neon Nights',
    duration: '3:45',
    cover: '🎧'
  });
  const [requestedBy] = useState('Person Name');

  // Simulate progress bar movement
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 225) { // 3:45 in seconds
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="music-player-container">
      <h1 className="player-heading">EAAS Music Player</h1>
      <div className="player-card">
        <div className="album-art">{currentTrack.cover}</div>
        <div className="player-content">
          <div className="track-title">{currentTrack.title}</div>
          <div className="track-artist">{currentTrack.artist}</div>
          {requestedBy && <div className="requested-by">Requested by: {requestedBy}</div>}
          <div className="player-controls">
            <button className="control-btn" aria-label="Shuffle">
              <span>🔀</span>
            </button>
            <button className="control-btn" aria-label="Previous">
              <span>⏮️</span>
            </button>
            <button
              className={`control-btn play${isPlaying ? ' playing' : ''}`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <span>{isPlaying ? '⏸️' : '▶️'}</span>
            </button>
            <button className="control-btn" aria-label="Next">
              <span>⏭️</span>
            </button>
            <button className="control-btn" aria-label="Repeat">
              <span>🔁</span>
            </button>
          </div>
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${(currentTime / 225) * 100}%` }}
              ></div>
            </div>
            <div className="time-info">
              <span>{formatTime(currentTime)}</span>
              <span>{currentTrack.duration}</span>
            </div>
          </div>
          <div className="volume-control">
            <span 
              className="volume-icon" 
              onClick={toggleMute}
              style={{ cursor: 'pointer' }}
            >
              {isMuted ? '🔇' : volume > 50 ? '🔊' : volume > 0 ? '🔉' : '🔈'}
            </span>
            <div className="volume-bar">
              <div 
                className="volume-level" 
                style={{ width: `${isMuted ? 0 : volume}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EAASMusicBot; 