import React, { useState } from 'react';
import './EAASGallery.css';

const EAASGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'events', label: 'Events', icon: '🎉' },
    { id: 'office', label: 'Office', icon: '🏢' },
    { id: 'projects', label: 'Projects', icon: '🚀' }
  ];

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>EAAS Gallery</h1>
        <p className="gallery-subtitle">Capturing moments and memories of our journey</p>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {/* Placeholder for gallery items */}
        <div className="gallery-item">
          <div className="gallery-item-content">
            <div className="gallery-item-overlay">
              <span className="gallery-item-title">Team Building</span>
              <span className="gallery-item-date">2024</span>
            </div>
          </div>
        </div>
        {/* Add more gallery items here */}
      </div>
    </div>
  );
};

export default EAASGallery; 