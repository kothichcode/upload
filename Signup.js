import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const schema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required')
});

const Signup = () => {
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      
      await signup(data.email, data.username, data.password);
      
      setSuccess('Registration successful! Please check your email to verify your account.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.detail || 'Failed to create an account');
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
        <h1 className="auth-title">Create Account</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className={`form-input ${errors.username ? 'error' : ''}`}
              {...register('username')} 
            />
            {errors.username && <span className="error-message">{errors.username.message}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className={`form-input ${errors.email ? 'error' : ''}`}
              {...register('email')} 
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className={`form-input ${errors.password ? 'error' : ''}`}
              {...register('password')} 
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input 
              type="password" 
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              {...register('confirmPassword')} 
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;