import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
// Material UI imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
// Add framer-motion import
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUserData();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'rgba(102, 126, 234, 0.95)', boxShadow: 3 }} elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', px: 5 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              width: 45,
              height: 45,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: 'white',
              fontWeight: 'bold',
              boxShadow: 3,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <span style={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>⚕️</span>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.5px', m: 0 }}>
                MediConnect
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>
                Healthcare Simplified
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            {state.user ? (
              <>
                <Typography sx={{ color: 'white', alignSelf: 'center', fontSize: 14 }}>
                  Welcome, {state.user.name}!
                </Typography>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/dashboard')}
                  sx={{ borderRadius: '25px', fontWeight: 500 }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ borderRadius: '25px', fontWeight: 500 }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="inherit"
                  sx={{ borderRadius: '25px', fontWeight: 500 }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{ borderRadius: '25px', fontWeight: 600, background: 'white', color: '#667eea', '&:hover': { background: '#f8f9fa' } }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', textAlign: 'center', py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ width: '100%' }}
        >
          <Paper elevation={6} sx={{ p: 6, background: 'rgba(102, 126, 234, 0.1)', borderRadius: 4 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'white', mb: 2, lineHeight: 1.2, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
              Find Your Perfect<br />
              <Box component="span" sx={{ color: '#4CAF50' }}>Healthcare Provider</Box>
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 5, lineHeight: 1.6, maxWidth: 800, mx: 'auto' }}>
              Get personalized care recommendations based on your symptoms and insurance.
            </Typography>
            {/* Removed Sign In and Sign Up buttons from the hero section */}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingPage; 