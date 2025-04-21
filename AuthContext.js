import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/api/v1/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const signup = async (email, username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/register', {
        email,
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // API expects form data for OAuth2 format
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post('http://localhost:8000/api/v1/auth/login', formData);
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Get user data
      const userResponse = await axios.get('http://localhost:8000/api/v1/users/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setCurrentUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!token,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}