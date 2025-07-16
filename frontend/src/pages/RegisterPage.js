import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import { validateName, validateEmail, validatePassword } from '../utils/validation';
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useUserData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // For phone, only allow numbers
    if (name === 'phone') {
      // Remove non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation: only allow 10-digit numbers or empty (optional)
    if (formData.phone) {
      if (!/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format. Please enter a 10-digit number.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Real API call to backend
      const response = await fetch('http://127.0.0.1:8000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
          phone: formData.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check for email already exists error
        if (errorData.detail && errorData.detail.toLowerCase().includes('email')) {
          setErrors({ email: 'This email is already used. Please use a different email address.' });
        } else {
          setErrors({ submit: errorData.detail || 'Registration failed' });
        }
        setLoading(false);
        return;
      }

      const userData = await response.json();
      
      // Registration successful, do not set user as authenticated or logged in
      setLoading(false);
      // Redirect to login page instead of dashboard
      navigate('/login');
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message });
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 550 }}
      >
        <Paper elevation={8} sx={{
          background: 'white',
          borderRadius: 4,
          p: 5,
          maxWidth: 550,
          width: '100%',
          boxShadow: '0 8px 32px 0 rgba(102, 126, 234, 0.25), 0 1.5px 8px 0 rgba(118, 75, 162, 0.10)',
          border: '2px solid #e0e7ff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gradient overlay */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(120deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.10) 100%)',
          }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
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
              <Typography variant="h4" sx={{ color: '#333', mb: 1, fontWeight: 700 }}>Create Account</Typography>
              <Typography variant="subtitle1" sx={{ color: '#666' }}>Join MediConnect - Healthcare Simplified</Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <TextField
                  label="Full Name"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={loading}
                  fullWidth
                  autoComplete="name"
                  variant="outlined"
                />
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
                  label="Phone Number"
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  error={!!errors.phone}
                  helperText={errors.phone}
                  disabled={loading}
                  fullWidth
                  inputProps={{ maxLength: 10, pattern: '[0-9]{10}', inputMode: 'numeric', autoComplete: 'tel' }}
                  variant="outlined"
                />
                <TextField
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  error={!!errors.password}
                  helperText={errors.password || 'Password must be at least 8 characters long'}
                  disabled={loading}
                  fullWidth
                  autoComplete="new-password"
                  variant="outlined"
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                  fullWidth
                  autoComplete="new-password"
                  variant="outlined"
                />
                {errors.submit && (
                  <Box sx={{ background: '#f8d7da', color: '#721c24', p: 2, borderRadius: 2, mt: 2, border: '1px solid #f5c6cb', fontSize: 14 }}>
                    {errors.submit}
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Stack>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Already have an account?{' '}
                <Button component={Link} to="/login" variant="text" sx={{ color: '#007bff', textTransform: 'none', fontWeight: 500, p: 0, minWidth: 0 }}>
                  Sign in here
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default RegisterPage; 