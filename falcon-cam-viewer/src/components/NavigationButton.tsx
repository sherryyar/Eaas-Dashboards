import React from 'react';
import { Link } from 'react-router-dom';
import './NavigationButton.css';

interface NavigationButtonProps {
  to: string;
  children: React.ReactNode;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ to, children }) => {
  return (
    <Link to={to} className="nav-button">
      {children}
    </Link>
  );
};

export default NavigationButton; 