import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
// Add framer-motion import
import { motion } from 'framer-motion';

const ProviderResultsPage = () => {
  const navigate = useNavigate();
  const { state } = useUserData();
  const [matchedProviders, setMatchedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, [state.userData]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      // Use the new provider matching endpoint
      if (state.userData) {
        const { primarySymptoms, insuranceProvider, city, urgencyLevel } = state.userData;
        
        // Build query parameters
        const params = new URLSearchParams();
        if (primarySymptoms && primarySymptoms.length > 0) {
          params.append('symptoms', primarySymptoms.join(', '));
        }
        if (insuranceProvider) {
          params.append('insurance', insuranceProvider);
        }
        if (city) {
          params.append('location', city);
        }
        if (urgencyLevel) {
          params.append('urgency', urgencyLevel);
        }
        params.append('limit', '3');
        
        const response = await fetch(`http://127.0.0.1:8000/api/providers/match/?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch matched providers');
        }

        const matchedProviders = await response.json();
        setMatchedProviders(matchedProviders);
      } else {
        // Fallback to get all providers if no user data
        const response = await fetch('http://127.0.0.1:8000/api/providers/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }

        const providers = await response.json();
        setMatchedProviders(providers.slice(0, 3)); // Show top 3
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Fallback to sample data if API fails
      const matched = findMatchingProviders(state.userData);
      setMatchedProviders(matched);
      setLoading(false);
    }
  };

  const findMatchingProviders = (userData) => {
    // Fallback function - return empty array since we don't have sample data
    console.log('Using fallback provider matching');
    return [];
  };

  const handleProviderSelect = (provider) => {
    const id = provider.id || provider._id;
    if (id) {
      navigate(`/provider/${id}`);
    } else {
      alert('Provider ID not found.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆');
    }
    
    return stars.join('');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 6, maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Box sx={{ width: 80, height: 80, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', fontWeight: 'bold', boxShadow: 3, mx: 'auto', mb: 4, position: 'relative', overflow: 'hidden', animation: 'pulse 2s infinite' }}>
            <span style={{ fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>⚕️</span>
          </Box>
          <Typography variant="h5" sx={{ color: '#333', mb: 2, fontWeight: 700 }}>Finding the best providers for you...</Typography>
          <Typography sx={{ color: '#666', mb: 3 }}>Analyzing your symptoms and insurance coverage</Typography>
          <Box sx={{ width: 40, height: 4, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 1, mx: 'auto', animation: 'loading 1.5s ease-in-out infinite' }} />
          <style>{`
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes loading { 0% { width: 40px; } 50% { width: 120px; } 100% { width: 40px; } }
          `}</style>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <Paper elevation={6} sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 4, p: 5, maxWidth: 1000, mx: 'auto', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', fontWeight: 'bold', boxShadow: 3, mx: 'auto', mb: 2, position: 'relative', overflow: 'hidden' }}>
              <span style={{ fontSize: 24, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>⚕️</span>
            </Box>
            <Typography variant="h4" sx={{ mb: 1, color: '#333', fontWeight: 700 }}>Top Providers for You</Typography>
            <Typography sx={{ color: '#666', mb: 2 }}>We've found the best healthcare providers based on your needs</Typography>
          </Box>
          <Paper sx={{ background: '#f8f9fa', p: 2, borderRadius: 2, mb: 4 }} elevation={0}>
            <Typography variant="h6" sx={{ mb: 1 }}>Your Search Criteria:</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Name:</strong> {state.userData.name}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Age:</strong> {state.userData.age} years</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Primary Symptoms:</strong> {state.userData.primarySymptoms}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Duration:</strong> {state.userData.duration}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Urgency Level:</strong> {state.userData.urgencyLevel}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Severity:</strong> {state.userData.severity}/10</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Location:</strong> {state.userData.city}, {state.userData.state} - {state.userData.pincode}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Insurance:</strong> {state.userData.insuranceProvider} - {state.userData.insurancePlan}</Typography></Grid>
            </Grid>
          </Paper>
          {matchedProviders.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', background: '#fff3f3', borderRadius: 2, mb: 3 }} elevation={0}>
              <Typography variant="h6" color="error" gutterBottom>No providers found</Typography>
              <Typography gutterBottom>We couldn't find any providers matching your criteria. Please try adjusting your search.</Typography>
              <Button variant="contained" color="primary" onClick={() => navigate('/intake')} sx={{ mt: 2 }}>
                Modify Search
              </Button>
            </Paper>
          ) : (
            <Box>
              <Typography sx={{ mb: 3, color: '#666' }}>
                We found {matchedProviders.length} providers that match your needs:
              </Typography>
              <Stack spacing={3}>
                {matchedProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id || provider._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.15, ease: 'easeOut' }}
                  >
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
                      <Grid container spacing={2} alignItems="flex-start">
                        <Grid item xs={12} sm={8}>
                          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                            <Typography variant="h6" sx={{ color: '#333', m: 0 }}>
                              {index + 1}. {provider.name}
                            </Typography>
                            {provider.specialtyMatch && (
                              <Chip label="Perfect Match" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                            )}
                          </Stack>
                          <Typography sx={{ color: '#666', mb: 1 }}><strong>{provider.specialty}</strong></Typography>
                          <Typography sx={{ color: '#666', mb: 1 }}>📍 {provider.address}</Typography>
                          <Stack direction="row" spacing={3} mb={1}>
                            <Typography sx={{ color: '#fbc02d', fontWeight: 'bold' }}>{renderStars(provider.rating)} {provider.rating}</Typography>
                            <Typography>⏱️ {provider.wait_time} wait</Typography>
                            <Typography sx={{ color: '#007bff', fontWeight: 'bold' }}>Score: {provider.match_score !== undefined ? provider.match_score : 0}</Typography>
                          </Stack>
                          <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
                            Accepts: {provider.accepted_insurances.join(', ')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                          <Box sx={{ width: '100%', display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Button variant="contained" color="primary" onClick={() => handleProviderSelect(provider)} sx={{ minWidth: 140 }}>
                              View Details
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>
            </Box>
          )}
          <Stack direction="row" spacing={2} mt={5} justifyContent="center">
            <Button variant="outlined" color="primary" onClick={() => navigate('/intake')}>
              Back to Search
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ProviderResultsPage; 