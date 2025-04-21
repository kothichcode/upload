import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock } from 'react-icons/fa';
import '../styles/Auth.css';

const schema = yup.object({
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup.string().required('Password is required')
});

const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-form"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="auth-title">Welcome Back</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input 
                type="email" 
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="your@email.com"
                {...register('email')}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input 
                type="password" 
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                {...register('password')}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password.message}</span>}
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;