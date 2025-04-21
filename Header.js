import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Header.css';

const Header = ({ onCitySearch }) => {
  const [searchCity, setSearchCity] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      onCitySearch(searchCity);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <header className="header">
      <div className="logo">
        <span className="logo-text">WeatherApp</span>
      </div>

      <form className="search" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search city..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
        <button type="submit" className="btn btn-primary search-btn">
          <FaSearch />
        </button>
      </form>

      <div className="user-menu">
        <div className="user-info" onClick={toggleMenu}>
          <FaUserCircle size={24} />
          <span>{currentUser?.username || 'User'}</span>
        </div>

        {showMenu && (
          <div className="user-dropdown">
            <ul>
              <li onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;