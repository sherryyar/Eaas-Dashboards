import React, { useState, useEffect, useMemo } from 'react';
import InfoBanner from './InfoBanner';
import { Stream } from '../types';
import './StreamViewer.css';

interface StreamViewerProps {
  streams?: Stream[];
  autoTransition?: boolean;
  transitionInterval?: number;
  showInfoBanner?: boolean;
  infoBannerText?: string;
}

const defaultStreams: Stream[] = [
  {
    id: 'ledge',
    name: 'Ledge Camera',
    url: 'YIXDnrSl9EE',
    description: 'Watch the falcons from the ledge perspective'
  },
  {
    id: 'box',
    name: 'Box Camera',
    url: 'yv2RtoIMNzA',
    description: 'Observe from the box camera view'
  },
  {
    id: 'tower',
    name: 'Tower Camera',
    url: '_GbhU8HT3c8',
    description: 'View from the tower camera angle'
  },
  {
    id: 'nest',
    name: 'Nest Camera',
    url: 'Xj1Y6ydRl1c',
    description: 'Watch the falcons in their nest'
  }
];

const StreamViewer: React.FC<StreamViewerProps> = React.memo(({
  streams = defaultStreams,
  autoTransition = true,
  transitionInterval = 60000,
  showInfoBanner = true,
  infoBannerText = "This project studies, monitors and records the breeding and natural behaviour of a resident peregrine family on the Charles Sturt University Orange campus."
}) => {
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoize the current stream to prevent unnecessary re-renders
  const currentStream = useMemo(() => streams[currentStreamIndex], [streams, currentStreamIndex]);

  useEffect(() => {
    if (!autoTransition) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStreamIndex((prev) => (prev + 1) % streams.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 1500);
    }, transitionInterval);

    return () => clearInterval(interval);
  }, [streams.length, autoTransition, transitionInterval]);

  return (
    <>
      {showInfoBanner && <InfoBanner description={infoBannerText} />}
      <div className="stream-viewer-container">
        <div className={`video-container ${isTransitioning ? 'transitioning' : ''}`}>
          <iframe
            key={currentStream.url}
            src={`https://www.youtube.com/embed/${currentStream.url}?autoplay=1&mute=1&playsinline=1&controls=0&modestbranding=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            frameBorder="0"
            title={currentStream.name}
          />
        </div>
        <div className="stream-info">
          <h2>{currentStream.name}</h2>
          <p>{currentStream.description}</p>
        </div>
      </div>
    </>
  );
});

StreamViewer.displayName = 'StreamViewer';

export default StreamViewer; 