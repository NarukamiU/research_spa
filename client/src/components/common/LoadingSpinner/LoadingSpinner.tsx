// ローディングスピナーコンポーネントの例
// client/src/components/LoadingSpinner/LoadingSpinner.tsx
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

export default LoadingSpinner;