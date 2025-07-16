import React, { useEffect, useRef } from 'react';

const ProviderMap = ({ providers, selectedProvider, onProviderSelect }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // This is a placeholder for Leaflet map integration
    // In a real implementation, you would initialize Leaflet here
    console.log('Map would be initialized with providers:', providers);
    
    // Simulate map initialization
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div style="
          width: 100%; 
          height: 400px; 
          background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          position: relative;
        ">
          <div style="text-align: center; color: #666;">
            <h3>Interactive Map</h3>
            <p>Provider locations would be displayed here</p>
            <p>Click on markers to view provider details</p>
          </div>
          ${providers.map((provider, index) => `
            <div style="
              position: absolute;
              top: ${20 + (index * 60)}px;
              left: ${20 + (index * 40)}px;
              background: ${selectedProvider?._id === provider._id ? '#007bff' : '#28a745'};
              color: white;
              padding: 8px 12px;
              border-radius: 20px;
              font-size: 12px;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              transition: all 0.3s ease;
            " onclick="window.selectProvider('${provider._id}')">
              ${provider.name.split(' ')[1]}
            </div>
          `).join('')}
        </div>
      `;
      
      // Add global function for provider selection
      window.selectProvider = onProviderSelect;
    }
  }, [providers, selectedProvider, onProviderSelect]);

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default ProviderMap; 