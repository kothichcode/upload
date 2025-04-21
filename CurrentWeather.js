import React from 'react';
import { FaTemperatureHigh, FaWind, FaCloudRain, FaCompass } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/CurrentWeather.css';

const CurrentWeather = ({ data }) => {
  if (!data) return null;

  const {
    name,
    main: { temp, feels_like, humidity },
    weather,
    wind,
    sys
  } = data;

  // Get time and date for the city
  const date = new Date();
  const localTime = new Date(date.getTime() + (date.getTimezoneOffset() * 60000) + (sys.timezone * 1000));
  const timeString = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = localTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  const weatherIcon = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

  return (
    <motion.div 
      className="card current-weather"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="weather-info">
        <div>
          <h2 className="city-name">{name}</h2>
          <p className="date-time">{dateString} | {timeString}</p>
          <div className="weather-temp">
            {Math.round(temp)}°C
          </div>
          <p className="weather-desc">{weather[0].description}</p>
        </div>
        
        <div className="weather-details">
          <div className="weather-detail">
            <FaTemperatureHigh />
            <span>Feels like: {Math.round(feels_like)}°C</span>
          </div>
          <div className="weather-detail">
            <FaWind />
            <span>Wind: {wind.speed} m/s</span>
          </div>
          <div className="weather-detail">
            <FaCloudRain />
            <span>Humidity: {humidity}%</span>
          </div>
        </div>
      </div>
      
      <div className="weather-visual">
        <div className="weather-icon-container">
          <img src={weatherIcon} alt={weather[0].description} className="weather-icon-large" />
        </div>
      </div>
    </motion.div>
  );
};

export default CurrentWeather;