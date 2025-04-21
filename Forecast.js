import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaCloudRain, FaRegSun, FaThermometerHalf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/Forecast.css';

const Forecast = ({ data }) => {
  if (!data || !data.list) return null;

  // Group forecast data by day
  const groupedData = data.list.reduce((days, item) => {
    const date = new Date(item.dt * 1000);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    if (!days[dayOfWeek]) {
      days[dayOfWeek] = {
        temps: [],
        icons: [],
        descriptions: [],
        rain: [],
        humidity: [],
        windSpeed: []
      };
    }
    
    days[dayOfWeek].temps.push(item.main.temp);
    days[dayOfWeek].icons.push(item.weather[0].icon);
    days[dayOfWeek].descriptions.push(item.weather[0].description);
    days[dayOfWeek].rain.push(item.rain ? item.rain['3h'] || 0 : 0);
    days[dayOfWeek].humidity.push(item.main.humidity);
    days[dayOfWeek].windSpeed.push(item.wind.speed);
    
    return days;
  }, {});

  // Calculate daily averages and get most frequent condition
  const forecastDays = Object.keys(groupedData).map(day => {
    const dayData = groupedData[day];
    
    // Get average temperature
    const avgTemp = dayData.temps.reduce((sum, temp) => sum + temp, 0) / dayData.temps.length;
    
    // Get most frequent weather icon
    const iconCounts = {};
    dayData.icons.forEach(icon => {
      iconCounts[icon] = (iconCounts[icon] || 0) + 1;
    });
    const mostFrequentIcon = Object.keys(iconCounts).reduce((a, b) => 
      iconCounts[a] > iconCounts[b] ? a : b
    );
    
    // Get corresponding description
    const iconIndex = dayData.icons.indexOf(mostFrequentIcon);
    const description = dayData.descriptions[iconIndex];
    
    // Calculate rain probability
    const rainPoints = dayData.rain.filter(amount => amount > 0).length;
    const rainProbability = (rainPoints / dayData.rain.length) * 100;
    
    // Get average humidity and wind speed
    const avgHumidity = dayData.humidity.reduce((sum, hum) => sum + hum, 0) / dayData.humidity.length;
    const avgWindSpeed = dayData.windSpeed.reduce((sum, speed) => sum + speed, 0) / dayData.windSpeed.length;
    
    return {
      day,
      avgTemp: Math.round(avgTemp),
      icon: mostFrequentIcon,
      description,
      rainProbability: Math.round(rainProbability),
      avgHumidity: Math.round(avgHumidity),
      avgWindSpeed: Math.round(avgWindSpeed)
    };
  });

  // Prepare data for precipitation chart
  const precipitationData = forecastDays.map(day => ({
    name: day.day,
    precipitation: day.rainProbability,
    temperature: day.avgTemp
  }));

  return (
    <motion.div 
      className="forecast"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="section-title">7-Day Forecast</h2>
      
      <div className="forecast-days">
        {forecastDays.map((day, index) => (
          <motion.div 
            key={day.day} 
            className="card day-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <div className="day-name">{day.day}</div>
            <img 
              src={`http://openweathermap.org/img/wn/${day.icon}.png`} 
              alt={day.description} 
              className="weather-icon" 
            />
            <div className="day-temp">{day.avgTemp}°C</div>
            <div className="day-desc">{day.description}</div>
            <div className="day-detail">
              <FaCloudRain />
              <span>{day.rainProbability}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rain-chart-container">
        <h3 className="chart-title">Precipitation Forecast</h3>
        <div className="rain-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={precipitationData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#ecf0f1" />
              <YAxis stroke="#ecf0f1" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2c2c2c', borderColor: '#444', borderRadius: '8px' }}
                labelStyle={{ color: '#ecf0f1' }}
              />
              <Line 
                type="monotone" 
                dataKey="precipitation" 
                stroke="#3498db" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                name="Precipitation (%)"
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#e74c3c" 
                strokeWidth={2} 
                activeDot={{ r: 8 }}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default Forecast;