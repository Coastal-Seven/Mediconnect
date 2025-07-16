import React from 'react';

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }} aria-label="Loading...">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="status" aria-live="polite">
      <circle cx="24" cy="24" r="20" stroke="#764ba2" strokeWidth="6" opacity="0.2" />
      <circle cx="24" cy="24" r="20" stroke="#764ba2" strokeWidth="6" strokeLinecap="round" strokeDasharray="100" strokeDashoffset="60" style={{
        transformOrigin: 'center',
        animation: 'spinner-rotate 1s linear infinite'
      }} />
      <style>{`
        @keyframes spinner-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  </div>
);

export default LoadingSpinner; 