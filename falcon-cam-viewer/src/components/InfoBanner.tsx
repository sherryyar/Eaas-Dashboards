import React from 'react';
import './InfoBanner.css';

interface InfoBannerProps {
  description: string;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ description }) => {
  return (
    <div className="info-banner">
      <div className="banner-content">
        <span className="falcon-cam-text">Falcon Cam</span>
        <span className="separator">|</span>
        <span className="description-text">{description}</span>
      </div>
    </div>
  );
};

export default InfoBanner; 