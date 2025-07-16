import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import { validateEmail, validatePassword } from '../utils/validation';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
// Add framer-motion import
import { motion } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUserData();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      const loginData = await response.json();
      localStorage.setItem('access_token', loginData.access_token);
      const profileRes = await fetch('http://127.0.0.1:8000/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.access_token}`,
        },
      });
      if (!profileRes.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const userData = await profileRes.json();
      userData.isAuthenticated = true;
      const normalizedUser = {
        ...userData,
        id: userData.id || userData._id
      };
      dispatch({ type: 'SET_USER', payload: normalizedUser });
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setLoading(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      setErrors({ general: error.message });
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 450 }}
      >
        <Paper elevation={8} sx={{
          background: 'white',
          borderRadius: 4,
          p: 5,
          maxWidth: 450,
          width: '100%',
          boxShadow: '0 8px 32px 0 rgba(102, 126, 234, 0.25), 0 1.5px 8px 0 rgba(118, 75, 162, 0.10)',
          border: '2px solid #e0e7ff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: 'white',
              fontWeight: 'bold',
              boxShadow: 3,
              margin: '0 auto 20px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <span style={{ fontSize: 24, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>⚕️</span>
            </Box>
            <Typography variant="h4" sx={{ color: '#333', mb: 1, fontWeight: 700 }}>Welcome Back</Typography>
            <Typography variant="subtitle1" sx={{ color: '#666' }}>Sign in to your MediConnect account</Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                label="Email Address"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                fullWidth
                autoComplete="email"
                variant="outlined"
              />
              <TextField
                label="Password"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                fullWidth
                autoComplete="current-password"
                variant="outlined"
              />
              {errors.general && (
                <Box sx={{ mt: 1, p: 2, background: '#f8d7da', color: '#721c24', borderRadius: 2, border: '1px solid #f5c6cb' }}>
                  {errors.general}
                </Box>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ borderRadius: 2, fontWeight: 600, py: 1.5, mt: 1 }}
                disabled={loading}
                startIcon={loading && <CircularProgress size={22} color="inherit" />}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              Don't have an account?{' '}
              <Button component={Link} to="/register" variant="text" sx={{ color: '#007bff', textTransform: 'none', fontWeight: 500, p: 0, minWidth: 0 }}>
                Sign up here
              </Button>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default LoginPage; 