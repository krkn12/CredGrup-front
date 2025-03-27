// src/components/UI/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css'; // Arquivo de estilos opcional

const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <div className={`loading-spinner ${fullScreen ? 'full-screen' : ''}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;