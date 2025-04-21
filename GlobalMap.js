import React, { useEffect, useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/GlobalMap.css';

const MAPBOX_TOKEN = 'your_mapbox_token'; // Replace with your Mapbox token

const GlobalMap = ({ globalWeather }) => {
  const [viewport, setViewport] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 1.5,
    bearing: 0,
    pitch: 0
  });
  
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    const listener = e => {
      if (e.key === 'Escape') {
        setSelectedCity(null);
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);

  return (
    <motion.div 
      className="global-map-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="section-title">Global Weather Map</h2>
      
      <div className="map-wrapper">
        <ReactMapGL
          {...viewport}
          width="100%"
          height="400px"
          mapStyle="mapbox://styles/mapbox/dark-v10"
          onViewportChange={nextViewport => setViewport(nextViewport)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          {globalWeather && globalWeather.map(city => (
            <Marker 
              key={city.id}
              latitude={city.coord.lat}
              longitude={city.coord.lon}
            >
              <button
                className="marker-btn"
                onClick={e => {
                  e.preventDefault();
                  setSelectedCity(city);
                }}
              >
                <FaMapMarkerAlt style={{ 
                  color: 
                    city.temp < 0 ? '#3498db' : 
                    city.temp < 10 ? '#2ecc71' : 
                    city.temp < 20 ? '#f39c12' : 
                    '#e74c3c' 
                }} />
              </button>
            </Marker>
          ))}

          {selectedCity && (
            <Popup
              latitude={selectedCity.coord.lat}
              longitude={selectedCity.coord.lon}
              onClose={() => setSelectedCity(null)}
              closeOnClick={false}
            >
              <div className="popup-content">
                <h3>{selectedCity.name}</h3>
                <p>{selectedCity.temp}°C</p>
                <p>{selectedCity.weather}</p>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>
    </motion.div>
  );
};

export default GlobalMap;