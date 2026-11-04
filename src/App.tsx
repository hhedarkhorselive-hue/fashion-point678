import React, { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Perform instant direct breakout/redirect to store page so fixed-bottom bars bind directly to browser viewport
    const storeUrl = '/assets/aistudio/fashion-point_6a561526.html' + (window.location.hash || '#/');
    window.location.replace(storeUrl);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#10265a',
      background: '#f6f9fe'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e4e7f0',
        borderTopColor: '#e5195f',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: '16px', fontWeight: 600 }}>Loading Fashion Point Store...</p>
    </div>
  );
}
